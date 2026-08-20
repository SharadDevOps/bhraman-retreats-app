import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { retreatCatalog, selectFeaturedRetreat } from "@/data/retreat";

async function readContent() {
  const [retreatRows, testimonials, mediaRow, videosRow, homeContentRow] = await Promise.all([
    prisma.retreat.findMany({ where: { slug: { in: retreatCatalog.map((retreat) => retreat.slug) } } }),
    prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteSetting.findUnique({ where: { key: "media.slots" } }),
    prisma.siteSetting.findUnique({ where: { key: "testimonials.videos" } }),
    prisma.siteSetting.findUnique({ where: { key: "home.content" } }),
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
  const homeContent = homeContentRow?.value && typeof homeContentRow.value === "object" && !Array.isArray(homeContentRow.value)
    ? homeContentRow.value as Record<string, unknown>
    : {};
  const philosophyParagraphs = Array.isArray(homeContent.philosophyParagraphs)
    ? homeContent.philosophyParagraphs as string[]
    : [
        "When these elements are in balance, the body's natural intelligence flourishes — digestion strengthens, sleep deepens, hormones align, and the nervous system returns to its natural rhythm of rest and renewal.",
        "Through elemental therapy, the senses awaken, pranic flow becomes unobstructed, and the mind begins to mirror the quiet order of nature itself. Each day of this retreat is devoted to one element — allowing you to experience its medicine through carefully curated practices, yogic techniques, and sensory experiences that bring harmony to body, mind, and spirit.",
      ];
  return {
    retreat: selectFeaturedRetreat(retreats),
    testimonials,
    media: mediaRow && typeof mediaRow.value === "object" ? mediaRow.value : {},
    videos: Array.isArray(videosRow?.value) ? videosRow.value : [],
    philosophyParagraphs,
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

  if (Array.isArray(body.philosophyParagraphs)) {
    const clean = body.philosophyParagraphs
      .filter((p: unknown) => typeof p === "string" && (p as string).trim())
      .map((p: unknown) => (p as string).trim());
    const current = await prisma.siteSetting.findUnique({ where: { key: "home.content" } });
    const existing = (current?.value && typeof current.value === "object" && !Array.isArray(current.value))
      ? current.value as Record<string, unknown>
      : {};
    await prisma.siteSetting.upsert({
      where: { key: "home.content" },
      update: { value: { ...existing, philosophyParagraphs: clean }, publicationStatus: "PUBLISHED", publishedAt: new Date() },
      create: { key: "home.content", value: { philosophyParagraphs: clean }, publicationStatus: "PUBLISHED", publishedAt: new Date() },
    });
  }

  if (Array.isArray(body.testimonials)) {
    const clean = body.testimonials
      .filter((t: Record<string, unknown>) => typeof t?.quote === "string" && t.quote.trim())
      .map((t: Record<string, unknown>) => ({
        name: String(t.name ?? "").trim(),
        location: String(t.location ?? "").trim(),
        imageUrl: t.imageUrl && typeof t.imageUrl === "string" ? t.imageUrl.trim() : null,
        quote: String(t.quote).trim(),
      }));
    await prisma.$transaction(async (tx) => {
      await tx.testimonial.deleteMany({});
      if (clean.length) {
        await tx.testimonial.createMany({
          data: clean.map((testimonial: { name: string; location: string; imageUrl: string | null; quote: string }, index: number) => ({
            slug: `guest-${index + 1}-${testimonial.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "anonymous"}`,
            name: testimonial.name,
            location: testimonial.location,
            imageUrl: testimonial.imageUrl,
            quote: testimonial.quote,
            sortOrder: index,
            publicationStatus: "PUBLISHED",
            publishedAt: new Date(),
          })),
        });
      }
    });
  }

  if (Array.isArray(body.videos)) {
    const cleanVideos = body.videos
      .filter((v: Record<string, unknown>) => typeof v?.url === "string" && v.url.trim())
      .slice(0, 9)
      .map((v: Record<string, unknown>) => ({
        title: String(v.title ?? "").trim(),
        url: String(v.url).trim(),
      }));
    await prisma.siteSetting.upsert({
      where: { key: "testimonials.videos" },
      update: { value: cleanVideos, publicationStatus: "PUBLISHED", publishedAt: new Date() },
      create: { key: "testimonials.videos", value: cleanVideos, publicationStatus: "PUBLISHED", publishedAt: new Date() },
    });
  }

  return NextResponse.json(await readContent());
}
