import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { defaultFounderChapters } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [founder, storySetting] = await Promise.all([
      prisma.founderProfile.findFirst({
        where: { publicationStatus: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          slug: true,
          name: true,
          title: true,
          bio: true,
          imageUrl: true,
          credentials: true,
          publishedAt: true,
          updatedAt: true,
        },
      }),
      prisma.siteSetting.findUnique({
        where: { key: "founder.story" },
      }),
    ]);

    if (!founder) return apiError(404, "NOT_FOUND", "Founder profile is not published.");

    const storyData = storySetting?.value && typeof storySetting.value === "object" && !Array.isArray(storySetting.value)
      ? (storySetting.value as Record<string, unknown>)
      : null;

    const chapters = Array.isArray(storyData?.chapters) && storyData.chapters.length > 0
      ? storyData.chapters
      : defaultFounderChapters;

    return apiSuccess({
      ...founder,
      subtitle: storyData?.subtitle ?? "Rooted in medicine. Guided by nature.",
      quote: storyData?.quote ?? "Nature holds everything we need to heal. We only have to learn how to listen again.",
      quoteAttribution: storyData?.quoteAttribution ?? founder.name,
      chapters,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
