import { prisma } from "@/lib/prisma";
import { isSensitiveSettingKey, normalizePublication } from "@/lib/cms-validation.mjs";

type CmsDelegate = {
  findMany(args: Record<string, unknown>): Promise<Record<string, unknown>[]>;
  count(args: Record<string, unknown>): Promise<number>;
  findUnique(args: Record<string, unknown>): Promise<Record<string, unknown> | null>;
  create(args: Record<string, unknown>): Promise<Record<string, unknown>>;
  update(args: Record<string, unknown>): Promise<Record<string, unknown>>;
  delete(args: Record<string, unknown>): Promise<Record<string, unknown>>;
};

export type CmsEntityConfig = {
  delegate: string;
  allowedSorts: readonly string[];
  defaultSort: string;
  searchFields: readonly string[];
  statusField: "publicationStatus" | "status";
  publishable: boolean;
  roles: Array<"CONTENT_EDITOR" | "BOOKING_MANAGER" | "SUPER_ADMIN">;
};

export const cmsEntities: Record<string, CmsEntityConfig> = {
  retreats: {
    delegate: "retreat",
    allowedSorts: ["createdAt", "updatedAt", "startDate", "endDate", "title"],
    defaultSort: "updatedAt",
    searchFields: ["title", "slug", "location"],
    statusField: "status",
    publishable: true,
    roles: ["CONTENT_EDITOR", "SUPER_ADMIN"],
  },
  "retreat-days": {
    delegate: "retreatDay",
    allowedSorts: ["createdAt", "updatedAt", "dayNumber"],
    defaultSort: "dayNumber",
    searchFields: ["title", "element"],
    statusField: "publicationStatus",
    publishable: true,
    roles: ["CONTENT_EDITOR", "SUPER_ADMIN"],
  },
  "itinerary-sections": {
    delegate: "itinerarySection",
    allowedSorts: ["createdAt", "updatedAt", "sortOrder", "title"],
    defaultSort: "sortOrder",
    searchFields: ["title"],
    statusField: "publicationStatus",
    publishable: true,
    roles: ["CONTENT_EDITOR", "SUPER_ADMIN"],
  },
  "itinerary-activities": {
    delegate: "itineraryActivity",
    allowedSorts: ["createdAt", "updatedAt", "sortOrder", "title"],
    defaultSort: "sortOrder",
    searchFields: ["title"],
    statusField: "publicationStatus",
    publishable: true,
    roles: ["CONTENT_EDITOR", "SUPER_ADMIN"],
  },
  testimonials: {
    delegate: "testimonial",
    allowedSorts: ["createdAt", "updatedAt", "sortOrder", "name"],
    defaultSort: "updatedAt",
    searchFields: ["name", "slug", "location", "quote"],
    statusField: "publicationStatus",
    publishable: true,
    roles: ["CONTENT_EDITOR", "SUPER_ADMIN"],
  },
  blogs: {
    delegate: "blogPost",
    allowedSorts: ["createdAt", "updatedAt", "publishedAt", "title"],
    defaultSort: "updatedAt",
    searchFields: ["title", "slug", "excerpt"],
    statusField: "publicationStatus",
    publishable: true,
    roles: ["CONTENT_EDITOR", "SUPER_ADMIN"],
  },
  founders: {
    delegate: "founderProfile",
    allowedSorts: ["createdAt", "updatedAt", "name"],
    defaultSort: "updatedAt",
    searchFields: ["name", "slug", "title"],
    statusField: "publicationStatus",
    publishable: true,
    roles: ["CONTENT_EDITOR", "SUPER_ADMIN"],
  },
  quotes: {
    delegate: "quote",
    allowedSorts: ["createdAt", "updatedAt", "sortOrder"],
    defaultSort: "updatedAt",
    searchFields: ["slug", "text", "attribution"],
    statusField: "publicationStatus",
    publishable: true,
    roles: ["CONTENT_EDITOR", "SUPER_ADMIN"],
  },
  "media-assets": {
    delegate: "mediaAsset",
    allowedSorts: ["createdAt", "updatedAt", "title"],
    defaultSort: "createdAt",
    searchFields: ["blobName", "title", "altText", "caption"],
    statusField: "publicationStatus",
    publishable: true,
    roles: ["CONTENT_EDITOR", "SUPER_ADMIN"],
  },
  "site-settings": {
    delegate: "siteSetting",
    allowedSorts: ["createdAt", "updatedAt", "key"],
    defaultSort: "key",
    searchFields: ["key", "description"],
    statusField: "publicationStatus",
    publishable: true,
    roles: ["CONTENT_EDITOR", "SUPER_ADMIN"],
  },
  enquiries: {
    delegate: "enquiry",
    allowedSorts: ["createdAt", "updatedAt", "name", "status"],
    defaultSort: "createdAt",
    searchFields: ["name", "email", "phone", "message"],
    statusField: "status",
    publishable: false,
    roles: ["BOOKING_MANAGER", "SUPER_ADMIN"],
  },
};

export function getCmsConfig(entity: string) {
  return cmsEntities[entity];
}

export function getCmsDelegate(config: CmsEntityConfig) {
  return (prisma as unknown as Record<string, CmsDelegate>)[config.delegate];
}

export function makeAdminWhere(
  entity: string,
  config: CmsEntityConfig,
  options: { status?: string; search?: string; publicationStatus?: string; parentId?: string },
) {
  const where: Record<string, unknown> = {};
  if (options.status) where[config.statusField] = options.status;
  if (entity === "retreats" && options.publicationStatus) {
    where.publicationStatus = options.publicationStatus;
  }
  if (options.search) {
    where.OR = config.searchFields.map((field) => ({
      [field]: { contains: options.search, mode: "insensitive" },
    }));
  }
  if (options.parentId) {
    const parentFields: Record<string, string> = {
      "retreat-days": "retreatId",
      "itinerary-sections": "retreatDayId",
      "itinerary-activities": "itinerarySectionId",
      enquiries: "retreatId",
    };
    if (parentFields[entity]) where[parentFields[entity]] = options.parentId;
  }
  return where;
}

export function prepareCmsData(entity: string, data: Record<string, unknown>) {
  const hasPublishedAt = ["retreats", "testimonials", "blogs", "founders", "quotes", "site-settings"].includes(entity);
  const prepared = hasPublishedAt ? normalizePublication(data) : { ...data };
  if (entity === "enquiries") delete prepared.retreatSlug;
  return prepared;
}

export function redactCmsRecord(entity: string, record: Record<string, unknown>) {
  if (entity !== "site-settings" || !isSensitiveSettingKey(record.key)) return record;
  return { ...record, value: "[REDACTED]" };
}
