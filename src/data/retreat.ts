export const upcomingRetreat = {
  slug: "forest-edition-dec-2026",
  title: "An Elemental Journey",
  edition: "Forest edition",
  summary: "Five immersive days to ground, cleanse, transform, expand and return to stillness.",
  description: "Five elements. Five days. One quiet return to the part of you that never forgot how to be whole.",
  location: "Van Tarang, Rajaji National Park",
  startDate: "2026-12-22T00:00:00.000Z",
  endDate: "2026-12-26T00:00:00.000Z",
  priceInPaise: 2999900,
  capacity: 12,
} as const;

export const paymentInstructions = {
  upiId: "bhramanretreats@upi", // TODO: replace with real UPI ID
  accountName: "Bhraman Retreats",
  accountNumber: "XXXXXXXXXXXX", // TODO: replace with real account number
  ifsc: "XXXXXXXXX", // TODO: replace with real IFSC
  bankName: "Your Bank", // TODO: replace with real bank name
  note: "Use your booking reference as the payment remark. Your spot is confirmed once payment is received.",
} as const;

export const elements = [
  { key: "earth", symbol: "01", name: "Earth", sanskrit: "Prithvi", verb: "Root", practice: "Mud therapy", detail: "Grounding yoga, barefoot forest walks and the healing touch of soil." },
  { key: "water", symbol: "02", name: "Water", sanskrit: "Jala", verb: "Release", practice: "Breathwork", detail: "Fluid movement, sound and breath rituals to soften what you are holding." },
  { key: "fire", symbol: "03", name: "Fire", sanskrit: "Agni", verb: "Transform", practice: "Trataka", detail: "Solar practice, candle gazing and expression to rekindle inner clarity." },
  { key: "air", symbol: "04", name: "Air", sanskrit: "Vāyu", verb: "Expand", practice: "Sound healing", detail: "Prāṇāyāma, mantra and spacious movement to invite lightness." },
  { key: "space", symbol: "05", name: "Space", sanskrit: "Ākāśa", verb: "Observe", practice: "Meditation", detail: "Sky gazing, inner silence and deep rest to return to awareness." },
] as const;

export const itinerary = [
  { day: "Day one", element: "Earth", title: "Ground & arrive", activities: ["Opening circle", "Clay therapy", "Forest herb walk", "Rooted yoga", "Inner silence"] },
  { day: "Day two", element: "Water", title: "Flow & release", activities: ["Chandra Namaskar", "Breathwork + sound", "Ayurvedic kitchen", "Ashram visit", "Yoga Nidra"] },
  { day: "Day three", element: "Fire", title: "Transform & awaken", activities: ["Surya Arghya", "Dynamic yoga", "Agni kriyas", "Trataka", "Kirtan circle"] },
  { day: "Day four", element: "Air", title: "Expand & express", activities: ["Prāṇāyāma", "Heart-opening flow", "Abhyanga", "Herbal tea circle", "Bīja mantra"] },
  { day: "Day five", element: "Space", title: "Integrate & return", activities: ["Sky gazing", "Yoga Nidra", "Inner silence", "Closing ritual", "Sharing circle"] },
] as const;
