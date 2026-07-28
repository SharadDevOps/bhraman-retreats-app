export type RetreatDefinition = {
  slug: string;
  title: string;
  edition: string;
  summary: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  priceInPaise: number;
  capacity: number;
  highlight?: string;
};

export const retreatCatalog: readonly RetreatDefinition[] = [
  {
    slug: "ladakh-edition-2-sep-2026",
    title: "Ladakh Edition 2.0",
    edition: "Ladakh Edition 2.0",
    summary: "Five elemental days shaped by high-altitude stillness, monastery rhythms and the vast landscapes of Ladakh.",
    description: "A five-element retreat through the silence, culture and mountain wisdom of Ladakh.",
    location: "Sham Valley, Ladakh",
    startDate: "2026-09-12T00:00:00.000Z",
    endDate: "2026-09-16T00:00:00.000Z",
    priceInPaise: 2999900,
    capacity: 12,
    highlight: "Stay at Lamayuru Monastery",
  },
  {
    slug: "uttarakhand-retreat-dec-2026",
    title: "Uttarakhand Retreat",
    edition: "Uttarakhand Retreat",
    summary: "Five restorative days of elemental practice, conscious nourishment and quiet immersion in the Himalayan foothills.",
    description: "An intimate five-element retreat rooted in the natural rhythms of Uttarakhand.",
    location: "Van Tarang, Rajaji National Park, Uttarakhand",
    startDate: "2026-12-25T00:00:00.000Z",
    endDate: "2026-12-29T00:00:00.000Z",
    priceInPaise: 2999900,
    capacity: 12,
  },
] as const;

type DatedRetreat = { startDate: string | Date; endDate: string | Date };

export function selectFeaturedRetreat<T extends DatedRetreat>(retreats: readonly T[], now = new Date()): T {
  if (!retreats.length) throw new Error("At least one retreat is required.");

  const currentTime = now.getTime();
  const chronological = [...retreats].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );
  const upcoming = chronological.find((retreat) => new Date(retreat.endDate).getTime() >= currentTime);

  return upcoming ?? chronological[chronological.length - 1];
}

export function getFeaturedRetreatDefinition(now = new Date()) {
  return selectFeaturedRetreat(retreatCatalog, now);
}

// Backwards-compatible fallback for components that need a default price.
// The selected entry is date-driven rather than assigned through a featured flag.
export const upcomingRetreat = getFeaturedRetreatDefinition();

export const paymentInstructions = {
  upiId: "bhramanretreats@upi", // TODO: replace with real UPI ID
  accountName: "Bhraman Retreats",
  accountNumber: "XXXXXXXXXXXX", // TODO: replace with real account number
  ifsc: "XXXXXXXXX", // TODO: replace with real IFSC
  bankName: "Your Bank", // TODO: replace with real bank name
  note: "Use your booking reference as the payment remark. Your spot is confirmed once payment is received.",
} as const;

export const elements = [
  { key: "earth", symbol: "01", name: "Earth", sanskrit: "Prithvi", verb: "Root", practice: "Mud therapy", detail: "Grounding yoga, barefoot nature walks and the healing touch of soil." },
  { key: "water", symbol: "02", name: "Water", sanskrit: "Jala", verb: "Release", practice: "Breathwork", detail: "Fluid movement, sound and breath rituals to soften what you are holding." },
  { key: "fire", symbol: "03", name: "Fire", sanskrit: "Agni", verb: "Transform", practice: "Trataka", detail: "Solar practice, candle gazing and expression to rekindle inner clarity." },
  { key: "air", symbol: "04", name: "Air", sanskrit: "Vāyu", verb: "Expand", practice: "Sound healing", detail: "Prāṇāyāma, mantra and spacious movement to invite lightness." },
  { key: "space", symbol: "05", name: "Space", sanskrit: "Ākāśa", verb: "Observe", practice: "Meditation", detail: "Sky gazing, inner silence and deep rest to return to awareness." },
] as const;

export const itinerary = [
  { day: "Day one", element: "Earth", title: "Ground & arrive", activities: ["Opening circle", "Clay therapy", "Herb walk", "Rooted yoga", "Inner silence"] },
  { day: "Day two", element: "Water", title: "Flow & release", activities: ["Chandra Namaskar", "Breathwork + sound", "Ayurvedic kitchen", "Ashram visit", "Yoga Nidra"] },
  { day: "Day three", element: "Fire", title: "Transform & awaken", activities: ["Surya Arghya", "Dynamic yoga", "Agni kriyas", "Trataka", "Kirtan circle"] },
  { day: "Day four", element: "Air", title: "Expand & express", activities: ["Prāṇāyāma", "Heart-opening flow", "Abhyanga", "Herbal tea circle", "Bīja mantra"] },
  { day: "Day five", element: "Space", title: "Integrate & return", activities: ["Sky gazing", "Yoga Nidra", "Inner silence", "Closing ritual", "Sharing circle"] },
] as const;
