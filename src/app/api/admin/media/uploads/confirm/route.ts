import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { hasAdminRole } from "@/lib/admin-auth";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { deleteMediaBlobIfExists, getMediaBlobProperties } from "@/lib/azure-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await hasAdminRole(["CONTENT_EDITOR", "SUPER_ADMIN"]))) {
    return apiError(403, "FORBIDDEN", "Content editor access is required.");
  }

  const body = await request.json().catch(() => null);
  const assetId = body && typeof body.assetId === "string" ? body.assetId : "";
  if (!assetId) return apiError(422, "VALIDATION_ERROR", "assetId is required.");

  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id: assetId } });
    if (!asset) return apiError(404, "NOT_FOUND", "Media asset not found.");
    if (asset.uploadStatus !== "AUTHORIZED") {
      return apiError(409, "INVALID_UPLOAD_STATE", "This upload is not awaiting confirmation.");
    }

    const isLocal = asset.blobName.startsWith("local-fallback/");
    let properties;

    if (isLocal) {
      const relativePath = asset.url.replace(/^\//, "");
      const absolutePath = path.join(process.cwd(), "public", relativePath);
      try {
        const stats = await fs.stat(absolutePath);
        properties = {
          contentType: asset.mimeType,
          contentLength: stats.size,
          blobType: "BlockBlob",
          etag: asset.etag || `local-${stats.mtimeMs}`,
        };
      } catch (error) {
        return apiError(409, "BLOB_NOT_FOUND", "The local file upload has not completed.");
      }
    } else {
      try {
        properties = await getMediaBlobProperties(asset.blobName);
      } catch (error) {
        if ((error as { statusCode?: number }).statusCode === 404) {
          return apiError(409, "BLOB_NOT_FOUND", "The browser upload has not completed.");
        }
        throw error;
      }
    }

    const actualType = properties.contentType?.split(";", 1)[0]?.trim().toLowerCase() ?? "";
    const expectedSize = asset.sizeBytes ?? -1;
    const metadataMatches = properties.blobType === "BlockBlob"
      && properties.contentLength === expectedSize
      && actualType === asset.mimeType.toLowerCase();

    if (!metadataMatches) {
      if (isLocal) {
        const relativePath = asset.url.replace(/^\//, "");
        const absolutePath = path.join(process.cwd(), "public", relativePath);
        await fs.unlink(absolutePath).catch(() => null);
      } else {
        await deleteMediaBlobIfExists(asset.blobName);
      }
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: { uploadStatus: "REJECTED" },
      });
      return apiError(422, "UPLOAD_MISMATCH", "Uploaded file metadata did not match the authorization request.");
    }

    const confirmed = await prisma.mediaAsset.update({
      where: { id: asset.id },
      data: {
        uploadStatus: "CONFIRMED",
        etag: properties.etag ?? null,
        uploadedAt: new Date(),
      },
      select: {
        id: true,
        url: true,
        folder: true,
        kind: true,
        title: true,
        altText: true,
        mimeType: true,
        sizeBytes: true,
        uploadStatus: true,
        publicationStatus: true,
        uploadedAt: true,
      },
    });
    return apiSuccess(confirmed);
  } catch (error) {
    return handleApiError(error);
  }
}
