import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { retreatCatalog, selectFeaturedRetreat } from "@/data/retreat";

async function readContent() {
  const [retreatRows, testimonials, mediaRow] = await Promise.all([
    prisma.retreat.findMany({ where: { slug: { in: retreatCatalog.map((retreat) => retreat.slug) } } }),
    prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteSetting.findUnique({ where: { key: "media.slots" } }),
  ]);
  const retreats = retreatCatalog.map((definition) => {
    const stored = retreatRows.find((row) => row.slug === definition.slug);
    return stored ?? {
      slug: definition.slug,
      title: definition.title,
      edition: definition.edition,
      summary: definition.summary,
      description: definition.description,
      location: definition.location,
      startDate: definition.startDate,
      endDate: definition.endDate,
      priceInPaise: definition.priceInPaise,
      capacity: definition.capacity,
      status: "BOOKING_OPEN",
      publicationStatus: "PUBLISHED",
      heroImageUrl: null,
      highlight: definition.highlight,
    };
  });
  return {
    retreat: selectFeaturedRetreat(retreats),
    testimonials,
    media: mediaRow && typeof mediaRow.value === "object" ? mediaRow.value : {},
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
    const definition = retreatCatalog.find((retreat) => retreat.slug === r.slug) ?? selectFeaturedRetreat(retreatCatalog);
    const priceInPaise = Math.round(Number(r.priceInPaise));
    const capacity = Math.round(Number(r.capacity));
    const startDate = new Date(r.startDate);
    const endDate = new Date(r.endDate);
    if (!r.title || !r.location || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || !priceInPaise || !capacity) {
      return NextResponse.json({ error: "Please fill all retreat fields with valid values." }, { status: 400 });
    }
    await prisma.retreat.upsert({
      where: { slug: definition.slug },
      update: { title: r.title, edition: r.edition ?? null, summary: r.summary ?? "", location: r.location, startDate, endDate, priceInPaise, capacity },
      create: {
        slug: definition.slug,
        title: r.title,
        edition: r.edition ?? null,
        summary: r.summary ?? "",
        description: definition.description,
        location: r.location,
        startDate,
        endDate,
        priceInPaise,
        capacity,
        status: "BOOKING_OPEN",
        publicationStatus: "PUBLISHED",
        publishedAt: new Date(),
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
    await prisma.$transaction(async (tx) => {
      await tx.testimonial.deleteMany({});
      if (clean.length) {
        await tx.testimonial.createMany({
          data: clean.map((testimonial: { name: string; location: string; quote: string }, index: number) => ({
            slug: `guest-${index + 1}-${testimonial.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "anonymous"}`,
            ...testimonial,
            sortOrder: index,
            publicationStatus: "PUBLISHED",
            publishedAt: new Date(),
          })),
        });
      }
    });
  }

  return NextResponse.json(await readContent());
}
