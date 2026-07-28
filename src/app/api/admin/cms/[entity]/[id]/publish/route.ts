import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { getAdminSession } from "@/lib/admin-auth";
import { getCmsConfig, getCmsDelegate } from "@/lib/cms-admin";
import { isRoleAllowed } from "@/lib/cms-validation.mjs";

const actions = {
  publish: { publicationStatus: "PUBLISHED", publishedAt: () => new Date() },
  draft: { publicationStatus: "DRAFT", publishedAt: () => null },
  archive: { publicationStatus: "ARCHIVED", publishedAt: () => null },
} as const;

export async function POST(request: Request, context: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await context.params;
  const config = getCmsConfig(entity);
  if (!config || !config.publishable) {
    return apiError(404, "NOT_FOUND", "Publish workflow is not available for this resource.");
  }
  const session = await getAdminSession();
  if (!session) return apiError(401, "UNAUTHORIZED", "Authentication is required.");
  if (!isRoleAllowed(session.role, config.roles)) {
    return apiError(403, "FORBIDDEN", "Your role cannot publish this resource.");
  }
  const body = await request.json().catch(() => null);
  const action = body && typeof body.action === "string" ? body.action.toLowerCase() : "";
  if (!(action in actions)) {
    return apiError(422, "VALIDATION_ERROR", "Action must be publish, draft or archive.");
  }
  try {
    if (entity === "media-assets" && action === "publish") {
      const asset = await getCmsDelegate(config).findUnique({ where: { id } });
      if (!asset) return apiError(404, "NOT_FOUND", "Media asset not found.");
      if (asset.uploadStatus !== "CONFIRMED") {
        return apiError(409, "UPLOAD_NOT_CONFIRMED", "Confirm the Blob upload before publishing.");
      }
    }
    const workflow = actions[action as keyof typeof actions];
    const hasPublishedAt = ["retreats", "testimonials", "blogs", "founders", "quotes", "media-assets", "site-settings"].includes(entity);
    const item = await getCmsDelegate(config).update({
      where: { id },
      data: {
        publicationStatus: workflow.publicationStatus,
        ...(hasPublishedAt ? { publishedAt: workflow.publishedAt() } : {}),
      },
    });
    return apiSuccess(item);
  } catch (error) {
    return handleApiError(error);
  }
}
