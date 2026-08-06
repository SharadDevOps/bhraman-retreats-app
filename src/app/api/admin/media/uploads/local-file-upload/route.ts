import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { hasAdminRole } from "@/lib/admin-auth";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  if (!(await hasAdminRole(["CONTENT_EDITOR", "SUPER_ADMIN"]))) {
    return apiError(403, "FORBIDDEN", "Content editor access is required.");
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  if (!id) return apiError(422, "VALIDATION_ERROR", "Asset id is required.");

  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return apiError(404, "NOT_FOUND", "Media asset not found.");
    if (asset.uploadStatus !== "AUTHORIZED") {
      return apiError(409, "INVALID_UPLOAD_STATE", "This upload is not awaiting data.");
    }

    const dataBuffer = Buffer.from(await request.arrayBuffer());

    if (asset.sizeBytes && dataBuffer.length !== asset.sizeBytes) {
      return apiError(422, "SIZE_MISMATCH", "Uploaded file size does not match expected size.");
    }

    // Relative path to write, e.g. "uploads/retreats/covers/local-uuid-name.jpg"
    const relativePath = asset.url.replace(/^\//, "");
    const absolutePath = path.join(process.cwd(), "public", relativePath);

    // Create container directory structure recursive
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, dataBuffer);

    await prisma.mediaAsset.update({
      where: { id: asset.id },
      data: {
        etag: `local-etag-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
