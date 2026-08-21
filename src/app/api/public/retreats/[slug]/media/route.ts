import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const retreat = await prisma.retreat.findFirst({
      where: {
        slug,
        publicationStatus: "PUBLISHED",
      },
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });

    if (!retreat) {
      return apiError(404, "NOT_FOUND", "Retreat not found or not published.");
    }

    const media = await prisma.mediaAsset.findMany({
      where: {
        retreatId: retreat.id,
        publicationStatus: "PUBLISHED",
      },
      orderBy: [
        { isCover: "desc" },
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        url: true,
        kind: true,
        folder: true,
        title: true,
        altText: true,
        caption: true,
        credit: true,
        category: true,
        displayOrder: true,
        isCover: true,
        isFeatured: true,
        width: true,
        height: true,
        durationSeconds: true,
        posterUrl: true,
        thumbnailUrl: true,
      },
    });

    return apiSuccess(media);
  } catch (error) {
    return handleApiError(error);
  }
}
