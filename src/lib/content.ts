import { prisma } from "./prisma";
import { brandAssets } from "@/data/brand";
import {
  elements as fallbackElements,
  itinerary as fallbackItinerary,
  retreatCatalog,
  selectFeaturedRetreat,
} from "@/data/retreat";
import type { ItineraryItem } from "@/components/itinerary";

export type Testimonial = { name: string; location?: string | null; quote: string };
export type MediaSlots = { retreat?: string; founder?: string; hero?: string };
export type FounderContent = {
  name: string;
  title: string;
  bio?: string;
  imageUrl?: string | null;
  credentials?: string | null;
};
export type ElementContent = {
  key: string; symbol: string; name: string; sanskrit: string;
  verb: string; practice: string; detail: string;
};
export type HomeContent = {
  heroEyebrow: string; heroTitle: string; heroEmphasis: string; heroCopy: string;
  heroPrimaryCta: string; heroSecondaryCta: string; introTagline: string;
  philosophyLabel: string; philosophyTitle: string; philosophyEmphasis: string;
  philosophyParagraphs: string[]; philosophyCta: string;
  elementsLabel: string; elementsTitle: string; elementsEmphasis: string; elementsIntro: string;
  itineraryLabel: string; itineraryTitle: string; itineraryEmphasis: string; itineraryIntro: string; itineraryNote: string;
  founderLabel: string; founderTitle: string; founderEmphasis: string;
  testimonialsLabel: string; testimonialsTitle: string; testimonialsEmphasis: string;
  closingLabel: string; closingTitle: string; closingEmphasis: string; closingCopy: string;
  footerTagline: string;
};

const defaultHomeContent: HomeContent = {
  heroEyebrow: "Elemental retreats · Himalayas, India",
  heroTitle: "Remember your",
  heroEmphasis: "natural rhythm.",
  heroCopy: "Five elements. Five days. One quiet return to the part of you that never forgot how to be whole.",
  heroPrimaryCta: "Explore the retreat",
  heroSecondaryCta: "Discover our philosophy",
  introTagline: "Breathe in · Return within",
  philosophyLabel: "The Bhraman way",
  philosophyTitle: "Nature is not the backdrop.",
  philosophyEmphasis: "Nature is the medicine.",
  philosophyParagraphs: [
    "In the heart of the Himalayas, every breath of air and every grain of soil whispers an ancient truth: all life arises from Earth, Water, Fire, Air and Space.",
    "Our intimate retreats weave elemental therapy, yoga, sattvik food and slow travel into a rhythm where the body can soften and the mind can become clear.",
  ],
  philosophyCta: "Walk through the five elements",
  elementsLabel: "Panch Mahābhūta",
  elementsTitle: "Five pathways back to",
  elementsEmphasis: "balance.",
  elementsIntro: "Each element holds a distinct quality. Together, they create a complete journey through body, breath, energy and awareness.",
  itineraryLabel: "Your five-day rhythm",
  itineraryTitle: "A journey that",
  itineraryEmphasis: "unfolds slowly.",
  itineraryIntro: "Every day honours one element through movement, traditional practice, conscious nourishment and reflection.",
  itineraryNote: "The complete time-by-time schedule becomes available in your retreat account after booking.",
  founderLabel: "Meet your guide",
  founderTitle: "Rooted in medicine.",
  founderEmphasis: "Guided by nature.",
  testimonialsLabel: "Voices from the journey",
  testimonialsTitle: "What guests",
  testimonialsEmphasis: "carry home.",
  closingLabel: "Your next journey awaits",
  closingTitle: "Come back to what",
  closingEmphasis: "feels essential.",
  closingCopy: "Join the next Bhraman retreat and experience life in its natural rhythm.",
  footerTagline: "Silence as teacher · Element as medicine · Nature as guide",
};

export type SiteData = {
  retreat: {
    slug: string; title: string; edition: string | null; summary: string; location: string;
    startDate: Date; endDate: Date; priceInPaise: number; capacity: number;
    highlight?: string;
  };
  testimonials: Testimonial[];
  media: MediaSlots;
  itinerary: ItineraryItem[];
  founder: FounderContent;
  elements: ElementContent[];
  content: HomeContent;
  founderQuote: string;
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
    itinerary: fallbackItinerary.map((day) => ({ ...day, activities: [...day.activities] })),
    founder: {
      name: "Dr. Pratiksha Shekhawat",
      title: "Doctor, yoga and elemental therapist",
    },
    elements: fallbackElements.map((element) => ({ ...element })),
    content: defaultHomeContent,
    founderQuote: "Nature holds everything we need to heal. We only have to learn how to listen again.",
  };
}

export async function getSiteData(): Promise<SiteData> {
  const now = new Date();
  const fallback = fallbackData(now);
  try {
    const [retreatRows, testimonials, settings, founder, founderQuote] = await Promise.all([
      prisma.retreat.findMany({
        where: {
          slug: { in: retreatCatalog.map((retreat) => retreat.slug) },
          publicationStatus: "PUBLISHED",
        },
        include: {
          itinerary: {
            where: { publicationStatus: "PUBLISHED" },
            orderBy: { dayNumber: "asc" },
            include: {
              sections: {
                where: { publicationStatus: "PUBLISHED" },
                orderBy: { sortOrder: "asc" },
                include: {
                  activities: {
                    where: { publicationStatus: "PUBLISHED" },
                    orderBy: { sortOrder: "asc" },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.testimonial.findMany({
        where: { publicationStatus: "PUBLISHED" },
        orderBy: { sortOrder: "asc" },
        select: { name: true, location: true, quote: true },
      }),
      prisma.siteSetting.findMany({
        where: { key: { in: ["media.slots", "home.content", "home.elements"] }, publicationStatus: "PUBLISHED" },
      }),
      prisma.founderProfile.findFirst({
        where: { publicationStatus: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
        select: { name: true, title: true, bio: true, imageUrl: true, credentials: true },
      }),
      prisma.quote.findFirst({
        where: { publicationStatus: "PUBLISHED", context: "Founder philosophy" },
        orderBy: { sortOrder: "asc" },
        select: { text: true },
      }),
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
        highlight: stored.highlight ?? definition.highlight,
        itinerary: stored.itinerary,
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
        itinerary: [],
      };
    });
    const selectedRetreat = selectFeaturedRetreat(retreats, now);
    const dynamicItinerary = selectedRetreat.itinerary.map((day) => ({
      day: `Day ${day.dayNumber}`,
      element: day.element,
      title: day.title,
      activities: day.sections.flatMap((section) => section.activities.map((activity) => activity.title)),
    }));
    const setting = (key: string) => settings.find((row) => row.key === key)?.value;
    const mediaSetting = setting("media.slots");
    const mediaValue = mediaSetting && typeof mediaSetting === "object" && !Array.isArray(mediaSetting)
      ? mediaSetting as MediaSlots
      : {};
    const contentSetting = setting("home.content");
    const content = contentSetting && typeof contentSetting === "object" && !Array.isArray(contentSetting)
      ? { ...defaultHomeContent, ...contentSetting } as HomeContent
      : fallback.content;
    const elementSetting = setting("home.elements");
    const elements = Array.isArray(elementSetting) ? elementSetting as ElementContent[] : fallback.elements;
    return {
      retreat: selectedRetreat,
      testimonials,
      media: {
        ...fallback.media,
        ...mediaValue,
        ...(founder?.imageUrl ? { founder: founder.imageUrl } : {}),
      },
      itinerary: dynamicItinerary.length ? dynamicItinerary : fallback.itinerary,
      founder: founder ?? fallback.founder,
      elements,
      content,
      founderQuote: founderQuote?.text ?? fallback.founderQuote,
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
