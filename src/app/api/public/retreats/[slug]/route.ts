import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { publicRetreatDetailInclude, publicRetreatSelect } from "@/lib/public-content";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const retreat = await prisma.retreat.findFirst({
      where: { slug, publicationStatus: "PUBLISHED" },
      select: { ...publicRetreatSelect, ...publicRetreatDetailInclude },
    });
    if (!retreat) return apiError(404, "NOT_FOUND", "Retreat not found.");
    return apiSuccess(retreat);
  } catch (error) {
    return handleApiError(error);
  }
}
