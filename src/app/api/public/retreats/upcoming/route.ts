import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { publicRetreatSelect } from "@/lib/public-content";

// Up to three upcoming, published retreats ordered soonest-first. The homepage
// features the first and shows the next two as smaller cards.
export async function GET() {
  try {
    const retreats = await prisma.retreat.findMany({
      where: {
        publicationStatus: "PUBLISHED",
        status: { in: ["UPCOMING", "BOOKING_OPEN", "SOLD_OUT", "ENQUIRY"] },
        endDate: { gte: new Date() },
      },
      orderBy: { startDate: "asc" },
      take: 3,
      select: publicRetreatSelect,
    });
    return apiSuccess(retreats);
  } catch (error) {
    return handleApiError(error);
  }
}
