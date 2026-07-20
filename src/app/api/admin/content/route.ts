import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { upcomingRetreat } from "@/data/retreat";

async function readContent() {
  const [retreat, testimonialsRow, mediaRow] = await Promise.all([
    prisma.retreat.findUnique({ where: { slug: upcomingRetreat.slug } }),
    prisma.siteContent.findUnique({ where: { key: "testimonials" } }),
    prisma.siteContent.findUnique({ where: { key: "mediaSlots" } }),
  ]);
  return {
    retreat: retreat ?? {
      title: upcomingRetreat.title,
      edition: upcomingRetreat.edition,
      summary: upcomingRetreat.summary,
      location: upcomingRetreat.location,
      startDate: upcomingRetreat.startDate,
      endDate: upcomingRetreat.endDate,
      priceInPaise: upcomingRetreat.priceInPaise,
      capacity: upcomingRetreat.capacity,
    },
    testimonials: testimonialsRow ? JSON.parse(testimonialsRow.value) : [],
    media: mediaRow ? JSON.parse(mediaRow.value) : {},
  };
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await readContent());
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (body.retreat) {
    const r = body.retreat;
    const priceInPaise = Math.round(Number(r.priceInPaise));
    const capacity = Math.round(Number(r.capacity));
    const startDate = new Date(r.startDate);
    const endDate = new Date(r.endDate);
    if (!r.title || !r.location || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || !priceInPaise || !capacity) {
      return NextResponse.json({ error: "Please fill all retreat fields with valid values." }, { status: 400 });
    }
    await prisma.retreat.upsert({
      where: { slug: upcomingRetreat.slug },
      update: { title: r.title, edition: r.edition ?? null, summary: r.summary ?? "", location: r.location, startDate, endDate, priceInPaise, capacity },
      create: {
        slug: upcomingRetreat.slug,
        title: r.title,
        edition: r.edition ?? null,
        summary: r.summary ?? "",
        description: upcomingRetreat.description,
        location: r.location,
        startDate,
        endDate,
        priceInPaise,
        capacity,
        status: "PUBLISHED",
      },
    });
  }

  if (Array.isArray(body.testimonials)) {
    const clean = body.testimonials
      .filter((t: Record<string, unknown>) => typeof t?.quote === "string" && t.quote.trim())
      .map((t: Record<string, unknown>) => ({
        name: String(t.name ?? "").trim(),
        location: String(t.location ?? "").trim(),
        quote: String(t.quote).trim(),
      }));
    await prisma.siteContent.upsert({
      where: { key: "testimonials" },
      update: { value: JSON.stringify(clean), published: true },
      create: { key: "testimonials", value: JSON.stringify(clean), published: true },
    });
  }

  return NextResponse.json(await readContent());
}
