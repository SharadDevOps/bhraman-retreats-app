import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hasAdminRole } from "@/lib/admin-auth";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { isAllowedMediaFolder } from "@/lib/media-validation.mjs";

export async function GET(request: Request) {
  if (!(await hasAdminRole(["CONTENT_EDITOR", "SUPER_ADMIN"]))) {
    return apiError(403, "FORBIDDEN", "Content editor access is required.");
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("pageSize") ?? "25", 10) || 25));
  const folder = url.searchParams.get("folder");
  const publicationStatus = url.searchParams.get("publicationStatus");
  const uploadStatus = url.searchParams.get("uploadStatus");
  const kind = url.searchParams.get("kind");

  if (folder && !isAllowedMediaFolder(folder)) {
    return apiError(422, "VALIDATION_ERROR", "folder is not an approved media folder.");
  }

  const where: Prisma.MediaAssetWhereInput = {
    ...(folder ? { folder } : {}),
    ...(publicationStatus ? { publicationStatus } : {}),
    ...(uploadStatus ? { uploadStatus } : {}),
    ...(kind ? { kind } : {}),
  };

  try {
    const [items, total] = await prisma.$transaction([
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.mediaAsset.count({ where }),
    ]);
    return apiSuccess(items, { meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (error) {
    return handleApiError(error);
  }
}
