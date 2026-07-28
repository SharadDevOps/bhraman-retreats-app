import { apiError, apiSuccess, handleApiError, validationError } from "@/lib/api-response";
import { getAdminSession } from "@/lib/admin-auth";
import { getCmsConfig, getCmsDelegate, prepareCmsData, redactCmsRecord } from "@/lib/cms-admin";
import { isRoleAllowed, validateCmsEntity } from "@/lib/cms-validation.mjs";
import { deleteMediaBlobIfExists, isBlobConfigured } from "@/lib/azure-storage";

async function authorize(entity: string) {
  const config = getCmsConfig(entity);
  if (!config) return { response: apiError(404, "NOT_FOUND", "CMS entity not found.") };
  const session = await getAdminSession();
  if (!session) return { response: apiError(401, "UNAUTHORIZED", "Authentication is required.") };
  if (!isRoleAllowed(session.role, config.roles)) {
    return { response: apiError(403, "FORBIDDEN", "Your role cannot manage this resource.") };
  }
  return { config };
}

export async function GET(_request: Request, context: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await context.params;
  const authorization = await authorize(entity);
  if ("response" in authorization) return authorization.response;
  try {
    const item = await getCmsDelegate(authorization.config).findUnique({ where: { id } });
    if (!item) return apiError(404, "NOT_FOUND", "Record not found.");
    return apiSuccess(redactCmsRecord(entity, item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await context.params;
  const authorization = await authorize(entity);
  if ("response" in authorization) return authorization.response;
  try {
    const body = await request.json().catch(() => null);
    const validation = validateCmsEntity(entity, body, { partial: true });
    if (!validation.valid) return validationError(validation.errors);
    if (!Object.keys(validation.data).length) {
      return apiError(422, "VALIDATION_ERROR", "At least one editable field is required.");
    }
    const item = await getCmsDelegate(authorization.config).update({
      where: { id },
      data: prepareCmsData(entity, validation.data),
    });
    return apiSuccess(redactCmsRecord(entity, item));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await context.params;
  const authorization = await authorize(entity);
  if ("response" in authorization) return authorization.response;
  try {
    if (entity === "media-assets") {
      const asset = await getCmsDelegate(authorization.config).findUnique({ where: { id } });
      if (!asset) return apiError(404, "NOT_FOUND", "Media asset not found.");
      if (typeof asset.blobName === "string" && isBlobConfigured()) {
        await deleteMediaBlobIfExists(asset.blobName);
      }
    }
    await getCmsDelegate(authorization.config).delete({ where: { id } });
    return apiSuccess({ id, deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
