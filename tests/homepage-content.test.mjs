import assert from "node:assert/strict";
import test from "node:test";
import { defaultHomeContent, getHomepageData, mapHomepageResponses } from "../src/lib/content.ts";

const fulfilled = (data) => ({ status: "fulfilled", value: { data } });
const rejected = (message = "unavailable") => ({ status: "rejected", reason: new Error(message) });

const retreat = {
  id: "retreat-1",
  slug: "ladakh-edition-2",
  title: "Ladakh Edition 2.0",
  summary: "A quiet five-day journey.",
  description: "Published retreat detail.",
  location: "Sham Valley, Ladakh",
  startDate: "2026-09-12T00:00:00.000Z",
  endDate: "2026-09-16T00:00:00.000Z",
  priceInPaise: 2999900,
  capacity: 12,
  status: "BOOKING_OPEN",
  itinerary: [{
    id: "day-1",
    dayNumber: 1,
    element: "Earth",
    title: "Ground & arrive",
    sections: [{ id: "section-1", title: "Earth practices", activities: [{ id: "activity-1", title: "Opening circle" }] }],
  }],
};

function completeResults(overrides = {}) {
  return {
    retreat: fulfilled(retreat),
    settings: fulfilled({
      "home.content": { heroTitle: "Return to", philosophyParagraphs: ["A dynamic philosophy."] },
      "home.elements": [{ key: "earth", symbol: "01", name: "Earth", sanskrit: "Prithvi", verb: "Root", practice: "Mud therapy", detail: "Ground through the body." }],
      "media.slots": { hero: "https://media.example/hero.jpg", invalid: 42 },
    }),
    founder: fulfilled({ id: "founder-1", slug: "founder", name: "Guide", title: "Founder", bio: "Bio" }),
    testimonials: fulfilled(Array.from({ length: 5 }, (_, index) => ({ id: `t-${index}`, slug: `t-${index}`, name: `Guest ${index}`, quote: "A reflection", sortOrder: index }))),
    blogs: fulfilled([{ id: "blog-1", slug: "why-bhraman", title: "Why Bhraman", excerpt: "Journal excerpt" }]),
    quotes: fulfilled([{ id: "quote-1", slug: "quote", text: "Listen within.", sortOrder: 1 }]),
    media: fulfilled([
      { id: "image-1", url: "https://media.example/image.jpg", kind: "IMAGE", folder: "retreats/ladakh-edition-1/gallery", altText: "Retreat circle", mimeType: "image/jpeg" },
      { id: "video-1", url: "https://media.example/video.mp4", kind: "VIDEO", folder: "retreats/ladakh-edition-1/videos", altText: "Retreat film", mimeType: "video/mp4" },
    ]),
    ...overrides,
  };
}

test("maps public API payloads into the homepage view model", () => {
  const page = mapHomepageResponses(completeResults());
  assert.equal(page.content.heroTitle, "Return to");
  assert.equal(page.content.heroEmphasis, defaultHomeContent.heroEmphasis);
  assert.deepEqual(page.content.philosophyParagraphs, ["A dynamic philosophy."]);
  assert.equal(page.elements[0].name, "Earth");
  assert.equal(page.retreat?.itinerary[0].sections[0].activities[0].title, "Opening circle");
  assert.equal(page.testimonials.length, 3);
  assert.equal(page.blog?.slug, "why-bhraman");
  assert.equal(page.media.length, 1, "video media must not enter initial homepage rendering");
  assert.deepEqual(page.mediaSlots, { hero: "https://media.example/hero.jpg" });
  assert.deepEqual(page.unavailable, []);
});

test("keeps endpoint errors non-blocking and exposes empty-content fallbacks", () => {
  const page = mapHomepageResponses(completeResults({
    retreat: rejected("retreat failed"),
    founder: rejected("founder failed"),
    testimonials: rejected("testimonials failed"),
    blogs: fulfilled([]),
    media: rejected("media failed"),
  }));
  assert.equal(page.retreat, null);
  assert.equal(page.founder, null);
  assert.deepEqual(page.testimonials, []);
  assert.equal(page.blog, null);
  assert.deepEqual(page.media, []);
  assert.deepEqual(page.unavailable.sort(), ["founder", "media", "retreat", "testimonials"]);
  assert.equal(page.content.heroTitle, "Return to", "healthy settings still render when other endpoints fail");
});

test("uses safe defaults when editable settings have invalid shapes", () => {
  const page = mapHomepageResponses(completeResults({
    settings: fulfilled({ "home.content": { heroTitle: 99, philosophyParagraphs: "invalid" }, "home.elements": [{ name: "Incomplete" }] }),
  }));
  assert.equal(page.content.heroTitle, defaultHomeContent.heroTitle);
  assert.deepEqual(page.content.philosophyParagraphs, defaultHomeContent.philosophyParagraphs);
  assert.deepEqual(page.elements, []);
});

test("requests every required public endpoint and maps their responses", async () => {
  const originalFetch = globalThis.fetch;
  const requested = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(input);
    requested.push(`${url.pathname}${url.search}`);
    const responseByPath = {
      "/api/public/retreats/featured": retreat,
      "/api/public/site-settings": { "home.content": { heroTitle: "API title" }, "home.elements": [] },
      "/api/public/founder": { id: "founder-1", slug: "founder", name: "Guide", title: "Founder", bio: "Bio" },
      "/api/public/testimonials": [],
      "/api/public/blogs": [],
      "/api/public/quotes": [],
      "/api/public/media": [],
    };
    assert.equal(init.cache, "no-store");
    return new Response(JSON.stringify({ data: responseByPath[url.pathname] }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  try {
    const page = await getHomepageData("https://bhraman.example");
    assert.equal(page.content.heroTitle, "API title");
    assert.deepEqual(requested.map((path) => path.split("?")[0]).sort(), [
      "/api/public/blogs",
      "/api/public/founder",
      "/api/public/media",
      "/api/public/quotes",
      "/api/public/retreats/featured",
      "/api/public/site-settings",
      "/api/public/testimonials",
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
