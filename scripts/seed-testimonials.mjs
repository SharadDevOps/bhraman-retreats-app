import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const testimonials = [
  {
    name: "Vineeta Garg",
    location: "Lucknow",
    imageUrl: "",
    quote: "Everyone needs to experience this, get rejuvenated and go back to their lives. I had done retreats earlier also but this was different, it was magical, beautiful, calming, comforting and I felt at home. Dr. Pratiksha's approach towards the participants is different, they make you feel like a friend and at home, here I learnt that I need to take the charge of my own life and become so emotionally strong that nothing can waiver me."
  },
  {
    name: "Kabir Mehta",
    location: "New Delhi",
    imageUrl: "",
    quote: "The high-altitude silence of Ladakh combined with the elemental daily structure was profound. I arrived feeling incredibly scattered and left with a deep, grounded sense of clarity. The clay therapy on Day 1 was a revelation. I have never felt so connected to the Earth."
  },
  {
    name: "Ananya Sen",
    location: "Kolkata",
    imageUrl: "",
    quote: "A truly transformative five days. Dr. Pratiksha's guidance during the Fire element meditation (Trataka) helped me release years of accumulated mental tension. The food was nourishing, the monastery visits were serene, and the small circle felt like family."
  },
  {
    name: "Dr. Rohan Deshmukh",
    location: "Mumbai",
    imageUrl: "",
    quote: "As a medical practitioner, I was thoroughly impressed by how scientifically and soulfully the Panch Mahabhuta philosophy was integrated. Every movement, every breathwork session had a clear physiological and energetic purpose. Highly recommended for complete rejuvenation."
  },
  {
    name: "Meera Nair",
    location: "Bengaluru",
    imageUrl: "",
    quote: "I came to Bhraman seeking stillness, and I found so much more. Sky-gazing during the Space element day opened up a sense of inner expansiveness I hadn't felt in decades. Sleeping at the monastery and waking up to the chants was an unforgettable experience."
  },
  {
    name: "Vikram Rathore",
    location: "Jaipur",
    imageUrl: "",
    quote: "The perfect antidote to modern burnout. The Air element day, with heart-opening flows and sound healing, was my favorite. It felt like shedding a heavy armor I didn't even know I was carrying. The attention to detail in every aspect of the retreat is luxury at its finest."
  },
  {
    name: "Pooja Hegde",
    location: "Hyderabad",
    imageUrl: "",
    quote: "Bhraman is not just a holiday; it's a recalibration of the self. The water breathwork session by the stream allowed me to release old emotional blocks. The local Ladakhi hospitality, combined with Dr. Pratiksha's wisdom, makes this a rare gem."
  },
  {
    name: "Arjun Banerjee",
    location: "Pune",
    imageUrl: "",
    quote: "From the very first evening circle, I felt completely supported. The ayurvedic meals were delicious and gentle on the body. We spent five days moving with the elements, sleeping deeply, and laughing often. I am going back to my city life with a renewed spirit."
  },
  {
    name: "Tara D’Souza",
    location: "Goa",
    imageUrl: "",
    quote: "The absolute beauty of the Sham Valley, the silence of the mountains, and the intentional structure of the five days created the perfect container. It has been three weeks since I returned, and the sense of peace I carried back is still completely intact."
  }
];

async function main() {
  console.log("Seeding 9 testimonials...");
  await prisma.$transaction(async (tx) => {
    // Delete existing testimonials
    await tx.testimonial.deleteMany({});
    
    // Create the new ones
    await tx.testimonial.createMany({
      data: testimonials.map((t, index) => ({
        slug: `guest-${index + 1}-${t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        name: t.name,
        location: t.location,
        imageUrl: t.imageUrl,
        quote: t.quote,
        sortOrder: index,
        publicationStatus: "PUBLISHED",
        publishedAt: new Date()
      }))
    });
  });
  console.log("Testimonials seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
