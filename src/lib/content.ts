import { prisma } from "./prisma";
import { upcomingRetreat } from "@/data/retreat";

export type Testimonial = { name: string; location: string; quote: string };
export type MediaSlots = { retreat?: string; founder?: string; hero?: string };

export type SiteData = {
  retreat: {
    title: string; edition: string | null; summary: string; location: string;
    startDate: Date; endDate: Date; priceInPaise: number; capacity: number;
  };
  testimonials: Testimonial[];
  media: MediaSlots;
};

const fallback: SiteData = {
  retreat: {
    title: upcomingRetreat.title,
    edition: upcomingRetreat.edition,
    summary: upcomingRetreat.summary,
    location: upcomingRetreat.location,
    startDate: new Date(upcomingRetreat.startDate),
    endDate: new Date(upcomingRetreat.endDate),
    priceInPaise: upcomingRetreat.priceInPaise,
    capacity: upcomingRetreat.capacity,
  },
  testimonials: [],
  media: {},
};

export async function getSiteData(): Promise<SiteData> {
  try {
    const [retreat, testimonialsRow, mediaRow] = await Promise.all([
      prisma.retreat.findUnique({ where: { slug: upcomingRetreat.slug } }),
      prisma.siteContent.findUnique({ where: { key: "testimonials" } }),
      prisma.siteContent.findUnique({ where: { key: "mediaSlots" } }),
    ]);
    return {
      retreat: retreat ? {
        title: retreat.title,
        edition: retreat.edition,
        summary: retreat.summary,
        location: retreat.location,
        startDate: retreat.startDate,
        endDate: retreat.endDate,
        priceInPaise: retreat.priceInPaise,
        capacity: retreat.capacity,
      } : fallback.retreat,
      testimonials: testimonialsRow ? JSON.parse(testimonialsRow.value) : [],
      media: mediaRow ? JSON.parse(mediaRow.value) : {},
    };
  } catch {
    // Database not migrated yet — serve defaults
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
