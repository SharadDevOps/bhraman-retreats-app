import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { publicRetreatDetailInclude, publicRetreatSelect } from "@/lib/public-content";

export async function GET() {
  try {
    const retreat = await prisma.retreat.findFirst({
      where: {
        publicationStatus: "PUBLISHED",
        status: { in: ["UPCOMING", "BOOKING_OPEN", "SOLD_OUT"] },
        endDate: { gte: new Date() },
      },
      orderBy: { startDate: "asc" },
      select: { ...publicRetreatSelect, ...publicRetreatDetailInclude },
    });
    if (!retreat) return apiError(404, "NOT_FOUND", "No upcoming published retreat is available.");
    return apiSuccess(retreat);
  } catch (error) {
    return handleApiError(error);
  }
}
