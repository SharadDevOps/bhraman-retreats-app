import { prisma } from "./prisma";
import { brandAssets } from "@/data/brand";
import { retreatCatalog, selectFeaturedRetreat } from "@/data/retreat";

export type Testimonial = { name: string; location: string; quote: string };
export type MediaSlots = { retreat?: string; founder?: string; hero?: string };

export type SiteData = {
  retreat: {
    slug: string; title: string; edition: string | null; summary: string; location: string;
    startDate: Date; endDate: Date; priceInPaise: number; capacity: number;
    highlight?: string;
  };
  testimonials: Testimonial[];
  media: MediaSlots;
};

function fallbackData(now = new Date()): SiteData {
  const retreat = selectFeaturedRetreat(retreatCatalog, now);
  return {
    retreat: {
      slug: retreat.slug,
      title: retreat.title,
      edition: retreat.edition,
      summary: retreat.summary,
      location: retreat.location,
      startDate: new Date(retreat.startDate),
      endDate: new Date(retreat.endDate),
      priceInPaise: retreat.priceInPaise,
      capacity: retreat.capacity,
      highlight: retreat.highlight,
    },
    testimonials: [],
    media: brandAssets.founderFallback ? { founder: brandAssets.founderFallback } : {},
  };
}

export async function getSiteData(): Promise<SiteData> {
  const now = new Date();
  const fallback = fallbackData(now);
  try {
    const [retreatRows, testimonialsRow, mediaRow] = await Promise.all([
      prisma.retreat.findMany({ where: { slug: { in: retreatCatalog.map((retreat) => retreat.slug) } } }),
      prisma.siteContent.findUnique({ where: { key: "testimonials" } }),
      prisma.siteContent.findUnique({ where: { key: "mediaSlots" } }),
    ]);
    const retreats = retreatCatalog.map((definition) => {
      const stored = retreatRows.find((row) => row.slug === definition.slug);
      return stored ? {
        slug: stored.slug,
        title: stored.title,
        edition: stored.edition,
        summary: stored.summary,
        location: stored.location,
        startDate: stored.startDate,
        endDate: stored.endDate,
        priceInPaise: stored.priceInPaise,
        capacity: stored.capacity,
        highlight: definition.highlight,
      } : {
        slug: definition.slug,
        title: definition.title,
        edition: definition.edition,
        summary: definition.summary,
        location: definition.location,
        startDate: new Date(definition.startDate),
        endDate: new Date(definition.endDate),
        priceInPaise: definition.priceInPaise,
        capacity: definition.capacity,
        highlight: definition.highlight,
      };
    });
    return {
      retreat: selectFeaturedRetreat(retreats, now),
      testimonials: testimonialsRow ? JSON.parse(testimonialsRow.value) : [],
      media: {
        ...fallback.media,
        ...(mediaRow ? JSON.parse(mediaRow.value) : {}),
      },
    };
  } catch {
    // Database not migrated or available yet — serve defaults.
    return fallback;
  }
}

export function formatDateRange(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const month = end.toLocaleDateString("en-GB", { month: "long" });
  const year = end.getFullYear();
  if (sameMonth) return `${start.getDate()}–${end.getDate()} ${month} ${year}`;
  return `${start.getDate()} ${start.toLocaleDateString("en-GB", { month: "short" })} – ${end.getDate()} ${end.toLocaleDateString("en-GB", { month: "short" })} ${year}`;
}
