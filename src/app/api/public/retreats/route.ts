import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { paginationMeta, parseListQuery } from "@/lib/cms-query";
import { publicRetreatSelect } from "@/lib/public-content";

export async function GET(request: Request) {
  try {
    const query = parseListQuery(request, {
      defaultSort: "startDate",
      allowedSorts: ["startDate", "endDate", "title", "createdAt", "updatedAt"],
    });
    const where = {
      publicationStatus: "PUBLISHED",
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? {
        OR: [
          { title: { contains: query.search, mode: "insensitive" as const } },
          { location: { contains: query.search, mode: "insensitive" as const } },
        ],
      } : {}),
    };
    const [retreats, total] = await prisma.$transaction([
      prisma.retreat.findMany({
        where,
        select: publicRetreatSelect,
        skip: query.skip,
        take: query.pageSize,
        orderBy: { [query.sort]: query.order },
      }),
      prisma.retreat.count({ where }),
    ]);
    return apiSuccess(retreats, { meta: paginationMeta(total, query) });
  } catch (error) {
    return handleApiError(error);
  }
}
