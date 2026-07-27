import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError, validationError } from "@/lib/api-response";
import { sanitizeRichContent, validateCmsEntity } from "@/lib/cms-validation.mjs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const validation = validateCmsEntity("enquiries", body);
    if (!validation.valid) return validationError(validation.errors);

    const data = validation.data;
    let retreatId = typeof data.retreatId === "string" ? data.retreatId : undefined;
    if (!retreatId && typeof data.retreatSlug === "string") {
      const retreat = await prisma.retreat.findFirst({
        where: { slug: data.retreatSlug, publicationStatus: "PUBLISHED" },
        select: { id: true },
      });
      if (!retreat) return apiError(422, "INVALID_RETREAT", "The selected retreat is not available.");
      retreatId = retreat.id;
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        retreatId,
        name: String(data.name),
        email: String(data.email).toLowerCase(),
        phone: typeof data.phone === "string" ? data.phone : null,
        message: String(sanitizeRichContent(data.message)),
        source: typeof data.source === "string" ? data.source : "website",
        status: "NEW",
      },
      select: { id: true, status: true, createdAt: true },
    });
    return apiSuccess(enquiry, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
