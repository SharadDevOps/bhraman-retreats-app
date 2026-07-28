import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const founder = await prisma.founderProfile.findFirst({
      where: { publicationStatus: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, slug: true, name: true, title: true, bio: true,
        imageUrl: true, credentials: true, publishedAt: true, updatedAt: true,
      },
    });
    if (!founder) return apiError(404, "NOT_FOUND", "Founder profile is not published.");
    return apiSuccess(founder);
  } catch (error) {
    return handleApiError(error);
  }
}
