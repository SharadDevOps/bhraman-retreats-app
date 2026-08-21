import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { publicationStatus: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        location: true,
        imageUrl: true,
        quote: true,
        sortOrder: true,
      },
    });

    return apiSuccess(testimonials);
  } catch (error) {
    return handleApiError(error);
  }
}
