import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { paginationMeta, parseListQuery } from "@/lib/cms-query";

export async function GET(request: Request) {
  try {
    const query = parseListQuery(request, {
      defaultSort: "sortOrder",
      allowedSorts: ["sortOrder", "publishedAt", "createdAt"],
    });
    const where = { publicationStatus: "PUBLISHED" };
    const [items, total] = await prisma.$transaction([
      prisma.testimonial.findMany({
        where,
        select: { id: true, slug: true, name: true, location: true, quote: true, sortOrder: true },
        skip: query.skip,
        take: query.pageSize,
        orderBy: { [query.sort]: query.order },
      }),
      prisma.testimonial.count({ where }),
    ]);
    return apiSuccess(items, { meta: paginationMeta(total, query) });
  } catch (error) {
    return handleApiError(error);
  }
}
