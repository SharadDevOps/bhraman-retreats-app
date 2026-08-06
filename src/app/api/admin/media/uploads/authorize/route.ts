import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { hasAdminRole } from "@/lib/admin-auth";
import { apiError, apiSuccess, handleApiError, validationError } from "@/lib/api-response";
import {
  createDirectMediaUpload,
  getMediaRootPrefix,
  isBlobConfigured,
} from "@/lib/azure-storage";
import { validateMediaUploadRequest } from "@/lib/media-validation.mjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await hasAdminRole(["CONTENT_EDITOR", "SUPER_ADMIN"]))) {
    return apiError(403, "FORBIDDEN", "Content editor access is required.");
  }
  if (!isBlobConfigured()) {
    const body = await request.clone().json().catch(() => null);
    const validation = validateMediaUploadRequest(body);
    if (!validation.valid) return validationError(validation.errors);

    const metadata = validation.value;
    const localFileName = `local-${randomUUID()}-${metadata.safeFileName}`;
    const blobName = `local-fallback/${metadata.folder}/${localFileName}`;
    const publicUrl = `/uploads/${metadata.folder}/${localFileName}`;

    try {
      const asset = await prisma.mediaAsset.create({
        data: {
          blobName,
          url: publicUrl,
          kind: metadata.kind,
          folder: metadata.folder,
          originalFileName: metadata.fileName,
          title: metadata.title,
          altText: metadata.altText,
          caption: metadata.caption,
          credit: metadata.credit,
          mimeType: metadata.mimeType,
          sizeBytes: metadata.sizeBytes,
          width: metadata.width,
          height: metadata.height,
          durationSeconds: metadata.durationSeconds,
          uploadStatus: "AUTHORIZED",
          publicationStatus: "DRAFT",
        },
      });

      return apiSuccess(
        {
          asset: {
            id: asset.id,
            folder: asset.folder,
            kind: asset.kind,
            uploadStatus: asset.uploadStatus,
            publicationStatus: asset.publicationStatus,
            publicUrl: asset.url,
          },
          upload: {
            url: `/api/admin/media/uploads/local-file-upload?id=${asset.id}`,
            expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
            requiredHeaders: {
              "Content-Type": metadata.mimeType,
            },
          },
        },
        { status: 201 },
      );
    } catch (error) {
      return handleApiError(error);
    }
  }

  const body = await request.json().catch(() => null);
  const validation = validateMediaUploadRequest(body);
  if (!validation.valid) return validationError(validation.errors);

  const metadata = validation.value;
  const blobName = `${getMediaRootPrefix()}/${metadata.folder}/${randomUUID()}-${metadata.safeFileName}`;

  try {
    const authorization = await createDirectMediaUpload(blobName);
    const asset = await prisma.mediaAsset.create({
      data: {
        blobName,
        url: authorization.publicUrl,
        kind: metadata.kind,
        folder: metadata.folder,
        originalFileName: metadata.fileName,
        title: metadata.title,
        altText: metadata.altText,
        caption: metadata.caption,
        credit: metadata.credit,
        mimeType: metadata.mimeType,
        sizeBytes: metadata.sizeBytes,
        width: metadata.width,
        height: metadata.height,
        durationSeconds: metadata.durationSeconds,
        uploadStatus: "AUTHORIZED",
        publicationStatus: "DRAFT",
      },
    });

    return apiSuccess(
      {
        asset: {
          id: asset.id,
          folder: asset.folder,
          kind: asset.kind,
          uploadStatus: asset.uploadStatus,
          publicationStatus: asset.publicationStatus,
          publicUrl: asset.url,
        },
        upload: {
          url: authorization.uploadUrl,
          expiresAt: authorization.expiresAt,
          requiredHeaders: {
            ...authorization.requiredHeaders,
            "Content-Type": metadata.mimeType,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
