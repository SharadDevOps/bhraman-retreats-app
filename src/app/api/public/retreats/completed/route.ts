import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const retreats = await prisma.retreat.findMany({
      where: {
        status: "COMPLETED",
        publicationStatus: "PUBLISHED",
      },
      orderBy: [
        { displayOrder: "asc" },
        { startDate: "desc" },
      ],
      select: {
        id: true,
        slug: true,
        title: true,
        edition: true,
        summary: true,
        description: true,
        location: true,
        venue: true,
        startDate: true,
        endDate: true,
        priceInPaise: true,
        capacity: true,
        status: true,
        heroImageUrl: true,
        highlight: true,
        storyTitle: true,
        storyBody: true,
        participantCount: true,
        displayOrder: true,
        coverMediaId: true,
        publishedAt: true,
        media: {
          where: { publicationStatus: "PUBLISHED" },
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
        },
      },
    });

    return apiSuccess(retreats);
  } catch (error) {
    return handleApiError(error);
  }
}
