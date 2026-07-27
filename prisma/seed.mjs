import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const itinerary = [
  {
    dayNumber: 1,
    element: "Earth",
    title: "Ground & arrive",
    description: "Arrive gently, meet the circle and reconnect with the steadiness of the body.",
    activities: ["Opening circle", "Clay therapy", "Herb walk", "Rooted yoga", "Inner silence"],
  },
  {
    dayNumber: 2,
    element: "Water",
    title: "Flow & release",
    description: "Explore softness, rhythm and release through breath, movement and nourishment.",
    activities: ["Chandra Namaskar", "Breathwork and sound", "Ayurvedic kitchen", "Ashram visit", "Yoga Nidra"],
  },
  {
    dayNumber: 3,
    element: "Fire",
    title: "Transform & awaken",
    description: "Cultivate clear energy through solar practice, ritual and focused awareness.",
    activities: ["Surya Arghya", "Dynamic yoga", "Agni kriyas", "Trataka", "Kirtan circle"],
  },
  {
    dayNumber: 4,
    element: "Air",
    title: "Expand & express",
    description: "Create space around the heart and voice with breath, sound and restorative touch.",
    activities: ["Prāṇāyāma", "Heart-opening flow", "Abhyanga", "Herbal tea circle", "Bīja mantra"],
  },
  {
    dayNumber: 5,
    element: "Space",
    title: "Integrate & return",
    description: "Rest in spacious awareness and carry the elemental journey into daily life.",
    activities: ["Sky gazing", "Yoga Nidra", "Inner silence", "Closing ritual", "Sharing circle"],
  },
];

const retreats = [
  {
    slug: "ladakh-edition-2-sep-2026",
    title: "Ladakh Edition 2.0",
    edition: "Edition 2.0",
    summary: "Five elemental days shaped by high-altitude stillness, monastery rhythms and the vast landscapes of Ladakh.",
    description: "A five-element Bhraman retreat through the silence, culture and mountain wisdom of Ladakh.",
    location: "Sham Valley, Ladakh",
    startDate: new Date("2026-09-12T00:00:00.000Z"),
    endDate: new Date("2026-09-16T00:00:00.000Z"),
    priceInPaise: 2999900,
    capacity: 12,
    status: "BOOKING_OPEN",
    publicationStatus: "PUBLISHED",
    highlight: "Stay at Lamayuru Monastery",
    publishedAt: new Date(),
  },
  {
    slug: "uttarakhand-retreat-dec-2026",
    title: "Uttarakhand Retreat",
    edition: null,
    summary: "Five restorative days of elemental practice, conscious nourishment and quiet immersion in the Himalayan foothills.",
    description: "An intimate five-element Bhraman retreat rooted in the natural rhythms of Uttarakhand.",
    location: "Uttarakhand, India",
    startDate: new Date("2026-12-25T00:00:00.000Z"),
    endDate: new Date("2026-12-29T00:00:00.000Z"),
    priceInPaise: 2999900,
    capacity: 12,
    status: "UPCOMING",
    publicationStatus: "PUBLISHED",
    highlight: null,
    publishedAt: new Date(),
  },
];

function dayCreate(day) {
  return {
    dayNumber: day.dayNumber,
    element: day.element,
    title: day.title,
    description: day.description,
    publicationStatus: "PUBLISHED",
    sections: {
      create: [{
        title: `${day.element} practices`,
        description: `The day unfolds through ${day.element.toLowerCase()}-led practices and reflection.`,
        sortOrder: 1,
        publicationStatus: "PUBLISHED",
        activities: {
          create: day.activities.map((title, index) => ({
            title,
            sortOrder: index + 1,
            publicationStatus: "PUBLISHED",
          })),
        },
      }],
    },
  };
}

async function seedRetreat(definition) {
  const retreat = await prisma.retreat.upsert({
    where: { slug: definition.slug },
    update: definition,
    create: definition,
  });

  await prisma.$transaction(async (tx) => {
    await tx.retreatDay.deleteMany({ where: { retreatId: retreat.id } });
    for (const day of itinerary) {
      await tx.retreatDay.create({
        data: {
          retreatId: retreat.id,
          ...dayCreate(day),
        },
      });
    }
  });
}

async function main() {
  for (const retreat of retreats) await seedRetreat(retreat);

  await prisma.blogPost.upsert({
    where: { slug: "why-choose-bhraman-retreats" },
    update: {},
    create: {
      slug: "why-choose-bhraman-retreats",
      title: "Why Choose Bhraman Retreats?",
      excerpt: "A considered approach to elemental wellbeing, intimate groups and meaningful Himalayan journeys.",
      content: "<p>Bhraman Retreats brings together the five elements, thoughtful guidance and unhurried travel. This draft is ready for the client’s complete editorial copy.</p>",
      authorName: "Bhraman Retreats",
      publicationStatus: "DRAFT",
    },
  });

  await prisma.founderProfile.upsert({
    where: { slug: "founder" },
    update: {},
    create: {
      slug: "founder",
      name: "Dr. Pratiksha Shekhawat",
      title: "Doctor, yoga and elemental therapist",
      bio: "<p>Founder profile copy and approved portrait are awaiting final client content.</p>",
      publicationStatus: "DRAFT",
    },
  });

  await prisma.quote.upsert({
    where: { slug: "nature-as-guide" },
    update: {},
    create: {
      slug: "nature-as-guide",
      text: "Nature holds everything we need to heal. We only have to learn how to listen again.",
      attribution: "Dr. Pratiksha Shekhawat",
      context: "Founder philosophy",
      sortOrder: 1,
      publicationStatus: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "brand.identity" },
    update: {},
    create: {
      key: "brand.identity",
      value: {
        name: "Bhraman Retreats",
        positioning: "Elemental retreats in the Himalayas",
      },
      description: "Public brand identity settings.",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "home.content" },
    update: {},
    create: {
      key: "home.content",
      value: {
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
          "Our intimate retreats weave elemental therapy, yoga, sattvik food and slow travel into a rhythm where the body can soften and the mind can become clear."
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
        footerTagline: "Silence as teacher · Element as medicine · Nature as guide"
      },
      description: "Editable homepage copy.",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "home.elements" },
    update: {},
    create: {
      key: "home.elements",
      value: [
        { key: "earth", symbol: "01", name: "Earth", sanskrit: "Prithvi", verb: "Root", practice: "Mud therapy", detail: "Grounding yoga, barefoot nature walks and the healing touch of soil." },
        { key: "water", symbol: "02", name: "Water", sanskrit: "Jala", verb: "Release", practice: "Breathwork", detail: "Fluid movement, sound and breath rituals to soften what you are holding." },
        { key: "fire", symbol: "03", name: "Fire", sanskrit: "Agni", verb: "Transform", practice: "Trataka", detail: "Solar practice, candle gazing and expression to rekindle inner clarity." },
        { key: "air", symbol: "04", name: "Air", sanskrit: "Vāyu", verb: "Expand", practice: "Sound healing", detail: "Prāṇāyāma, mantra and spacious movement to invite lightness." },
        { key: "space", symbol: "05", name: "Space", sanskrit: "Ākāśa", verb: "Observe", practice: "Meditation", detail: "Sky gazing, inner silence and deep rest to return to awareness." }
      ],
      description: "Editable five-element homepage cards.",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
}

main()
  .then(() => console.info("Bhraman CMS seed completed."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
