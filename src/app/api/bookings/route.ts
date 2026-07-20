import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { upcomingRetreat } from "@/data/retreat";

function makeReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `BR-${code}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, phone, guests, dietaryNotes, healthNotes } = (body ?? {}) as Record<string, unknown>;

  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanPhone = typeof phone === "string" ? phone.trim() : "";
  const guestCount = Number(guests);

  if (cleanName.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!/^[+\d][\d\s\-()]{7,17}$/.test(cleanPhone)) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 6) return NextResponse.json({ error: "Guests must be between 1 and 6." }, { status: 400 });

  try {
    // Ensure the retreat exists (seeded from site data on first booking)
    const retreat = await prisma.retreat.upsert({
      where: { slug: upcomingRetreat.slug },
      update: {},
      create: {
        slug: upcomingRetreat.slug,
        title: upcomingRetreat.title,
        edition: upcomingRetreat.edition,
        summary: upcomingRetreat.summary,
        description: upcomingRetreat.description,
        location: upcomingRetreat.location,
        startDate: new Date(upcomingRetreat.startDate),
        endDate: new Date(upcomingRetreat.endDate),
        priceInPaise: upcomingRetreat.priceInPaise,
        capacity: upcomingRetreat.capacity,
        status: "PUBLISHED",
      },
    });

    // Waitlist if capacity is reached
    const active = await prisma.booking.aggregate({
      where: { retreatId: retreat.id, status: { in: ["PENDING", "CONFIRMED"] } },
      _sum: { guests: true },
    });
    const bookedGuests = active._sum.guests ?? 0;
    const status = bookedGuests + guestCount > retreat.capacity ? "WAITLISTED" : "PENDING";

    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: { name: cleanName, phone: cleanPhone },
      create: { email: cleanEmail, name: cleanName, phone: cleanPhone },
    });

    const booking = await prisma.booking.create({
      data: {
        reference: makeReference(),
        userId: user.id,
        retreatId: retreat.id,
        guests: guestCount,
        totalInPaise: retreat.priceInPaise * guestCount,
        status,
        dietaryNotes: typeof dietaryNotes === "string" && dietaryNotes.trim() ? dietaryNotes.trim() : null,
        healthNotes: typeof healthNotes === "string" && healthNotes.trim() ? healthNotes.trim() : null,
      },
    });

    return NextResponse.json({
      reference: booking.reference,
      status: booking.status,
      guests: booking.guests,
      totalInPaise: booking.totalInPaise,
    }, { status: 201 });
  } catch (error) {
    console.error("Booking failed:", error);
    return NextResponse.json({ error: "Something went wrong while saving your booking. Please try again." }, { status: 500 });
  }
}
