import { apiError, apiSuccess, handleApiError, validationError } from "@/lib/api-response";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getCmsConfig, getCmsDelegate, makeAdminWhere, prepareCmsData, redactCmsRecord,
} from "@/lib/cms-admin";
import { paginationMeta, parseListQuery } from "@/lib/cms-query";
import { isRoleAllowed, validateCmsEntity } from "@/lib/cms-validation.mjs";

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

export async function GET(request: Request, context: { params: Promise<{ entity: string }> }) {
  const { entity } = await context.params;
  const authorization = await authorize(entity);
  if ("response" in authorization) return authorization.response;
  const { config } = authorization;
  try {
    const query = parseListQuery(request, {
      defaultSort: config.defaultSort,
      allowedSorts: config.allowedSorts,
    });
    const params = new URL(request.url).searchParams;
    const where = makeAdminWhere(entity, config, {
      status: query.status,
      search: query.search,
      publicationStatus: params.get("publicationStatus")?.toUpperCase(),
      parentId: params.get("parentId") ?? undefined,
    });
    const delegate = getCmsDelegate(config);
    const [items, total] = await Promise.all([
      delegate.findMany({
        where,
        skip: query.skip,
        take: query.pageSize,
        orderBy: { [query.sort]: query.order },
      }),
      delegate.count({ where }),
    ]);
    return apiSuccess(items.map((item) => redactCmsRecord(entity, item)), {
      meta: paginationMeta(total, query),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ entity: string }> }) {
  const { entity } = await context.params;
  const authorization = await authorize(entity);
  if ("response" in authorization) return authorization.response;
  if (entity === "media-assets") {
    return apiError(405, "CONTROLLED_UPLOAD_REQUIRED", "Use the media upload authorization endpoint to create assets.");
  }
  try {
    const body = await request.json().catch(() => null);
    const validation = validateCmsEntity(entity, body);
    if (!validation.valid) return validationError(validation.errors);
    const item = await getCmsDelegate(authorization.config).create({
      data: prepareCmsData(entity, validation.data),
    });
    return apiSuccess(redactCmsRecord(entity, item), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
