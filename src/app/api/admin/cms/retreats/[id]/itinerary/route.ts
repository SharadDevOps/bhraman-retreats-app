import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError, validationError } from "@/lib/api-response";
import { getAdminSession } from "@/lib/admin-auth";
import { isRoleAllowed, validateCmsEntity } from "@/lib/cms-validation.mjs";
import type { Prisma } from "@prisma/client";

type NestedActivity = Record<string, unknown>;
type NestedSection = Record<string, unknown> & { activities?: NestedActivity[] };
type NestedDay = Record<string, unknown> & { sections?: NestedSection[] };
type ValidatedActivity = Record<string, unknown>;
type ValidatedSection = Record<string, unknown> & { activities: ValidatedActivity[] };
type ValidatedDay = Record<string, unknown> & { sections: ValidatedSection[] };

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return apiError(401, "UNAUTHORIZED", "Authentication is required.");
  if (!isRoleAllowed(session.role, ["CONTENT_EDITOR", "SUPER_ADMIN"])) {
    return apiError(403, "FORBIDDEN", "Your role cannot update itineraries.");
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.days) || body.days.length < 1 || body.days.length > 30) {
    return apiError(422, "VALIDATION_ERROR", "Days must contain between 1 and 30 itinerary days.");
  }

  const errors: Record<string, string> = {};
  const days: ValidatedDay[] = (body.days as NestedDay[]).map((day, dayIndex): ValidatedDay => {
    const dayValidation = validateCmsEntity("retreat-days", { ...day, retreatId: id });
    for (const [field, message] of Object.entries(dayValidation.errors)) {
      errors[`days.${dayIndex}.${field}`] = message;
    }
    const sections = Array.isArray(day.sections) ? day.sections.map((section, sectionIndex) => {
      const sectionValidation = validateCmsEntity("itinerary-sections", {
        ...section,
        retreatDayId: "transactional",
      });
      for (const [field, message] of Object.entries(sectionValidation.errors)) {
        errors[`days.${dayIndex}.sections.${sectionIndex}.${field}`] = message;
      }
      const activities = Array.isArray(section.activities)
        ? section.activities.map((activity, activityIndex) => {
          const activityValidation = validateCmsEntity("itinerary-activities", {
            ...activity,
            itinerarySectionId: "transactional",
          });
          for (const [field, message] of Object.entries(activityValidation.errors)) {
            errors[`days.${dayIndex}.sections.${sectionIndex}.activities.${activityIndex}.${field}`] = message;
          }
          const { itinerarySectionId: _relation, ...activityData } = activityValidation.data;
          return activityData;
        })
        : [];
      const { retreatDayId: _relation, ...sectionData } = sectionValidation.data;
      return { ...sectionData, activities } as ValidatedSection;
    }) : [];
    const { retreatId: _relation, ...dayData } = dayValidation.data;
    return { ...dayData, sections } as ValidatedDay;
  });

  if (Object.keys(errors).length) return validationError(errors);
  const dayNumbers = days.map((day) => day.dayNumber);
  if (new Set(dayNumbers).size !== dayNumbers.length) {
    return validationError({ days: "Day numbers must be unique within a retreat." });
  }

  try {
    const exists = await prisma.retreat.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return apiError(404, "NOT_FOUND", "Retreat not found.");

    const itinerary = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.retreatDay.deleteMany({ where: { retreatId: id } });
      for (const day of days) {
        await tx.retreatDay.create({
          data: {
            retreatId: id,
            dayNumber: Number(day.dayNumber),
            element: String(day.element),
            title: String(day.title),
            description: typeof day.description === "string" ? day.description : null,
            publicationStatus: typeof day.publicationStatus === "string" ? day.publicationStatus : "DRAFT",
            sections: {
              create: day.sections.map((section, sectionIndex) => ({
                title: String(section.title),
                description: typeof section.description === "string" ? section.description : null,
                sortOrder: typeof section.sortOrder === "number" ? section.sortOrder : sectionIndex,
                publicationStatus: typeof section.publicationStatus === "string" ? section.publicationStatus : "DRAFT",
                activities: {
                  create: section.activities.map((activity, activityIndex) => ({
                    title: String(activity.title),
                    description: typeof activity.description === "string" ? activity.description : null,
                    startTime: typeof activity.startTime === "string" ? activity.startTime : null,
                    sortOrder: typeof activity.sortOrder === "number" ? activity.sortOrder : activityIndex,
                    publicationStatus: typeof activity.publicationStatus === "string" ? activity.publicationStatus : "DRAFT",
                  })),
                },
              })),
            },
          },
        });
      }
      return tx.retreatDay.findMany({
        where: { retreatId: id },
        include: { sections: { include: { activities: true }, orderBy: { sortOrder: "asc" } } },
        orderBy: { dayNumber: "asc" },
      });
    });
    return apiSuccess(itinerary);
  } catch (error) {
    return handleApiError(error);
  }
}