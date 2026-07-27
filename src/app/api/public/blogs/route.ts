import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { paginationMeta, parseListQuery } from "@/lib/cms-query";

export async function GET(request: Request) {
  try {
    const query = parseListQuery(request, {
      defaultSort: "publishedAt",
      allowedSorts: ["publishedAt", "createdAt", "updatedAt", "title"],
    });
    const where = {
      publicationStatus: "PUBLISHED",
      ...(query.search ? {
        OR: [
          { title: { contains: query.search, mode: "insensitive" as const } },
          { excerpt: { contains: query.search, mode: "insensitive" as const } },
        ],
      } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.blogPost.findMany({
        where,
        select: {
          id: true, slug: true, title: true, excerpt: true, coverImageUrl: true,
          authorName: true, publishedAt: true, updatedAt: true,
        },
        skip: query.skip,
        take: query.pageSize,
        orderBy: { [query.sort]: query.order },
      }),
      prisma.blogPost.count({ where }),
    ]);
    return apiSuccess(items, { meta: paginationMeta(total, query) });
  } catch (error) {
    return handleApiError(error);
  }
}
