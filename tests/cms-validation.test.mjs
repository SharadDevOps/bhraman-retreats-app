import test from "node:test";
import assert from "node:assert/strict";
import {
  isSensitiveSettingKey,
  normalizePublication,
  sanitizeRichContent,
  validateCmsEntity,
} from "../src/lib/cms-validation.mjs";

test("accepts a valid retreat and converts dates", () => {
  const result = validateCmsEntity("retreats", {
    slug: "ladakh-edition-2",
    title: "Ladakh Edition 2.0",
    summary: "A calm elemental retreat.",
    description: "<p>Five days in Ladakh.</p>",
    location: "Sham Valley, Ladakh",
    startDate: "2026-09-12",
    endDate: "2026-09-16",
    priceInPaise: 2999900,
    capacity: 12,
    status: "BOOKING_OPEN",
    publicationStatus: "PUBLISHED",
  });
  assert.equal(result.valid, true);
  assert.ok(result.data.startDate instanceof Date);
});

test("rejects invalid slugs, retreat status and date order", () => {
  const result = validateCmsEntity("retreats", {
    slug: "Invalid Slug",
    title: "Test",
    summary: "Summary",
    description: "Description",
    location: "Ladakh",
    startDate: "2026-09-16",
    endDate: "2026-09-12",
    priceInPaise: 100,
    capacity: 1,
    status: "OPEN",
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.slug);
  assert.ok(result.errors.status);
  assert.ok(result.errors.endDate);
});

test("sanitises dangerous rich content while retaining safe markup", () => {
  const value = sanitizeRichContent('<p onclick="steal()">Calm</p><script>alert(1)</script><a href="javascript:bad()">link</a>');
  assert.equal(value.includes("<script"), false);
  assert.equal(value.includes("onclick"), false);
  assert.equal(value.toLowerCase().includes("javascript:"), false);
  assert.equal(value.includes("<p>Calm</p>"), true);
});

test("rejects secret-like public setting keys", () => {
  assert.equal(isSensitiveSettingKey("payment.apiKey"), true);
  const result = validateCmsEntity("site-settings", {
    key: "payment.apiKey",
    value: "not-allowed",
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.key);
});

test("sets and clears publish timestamps consistently", () => {
  const published = normalizePublication({ publicationStatus: "PUBLISHED" });
  assert.ok(published.publishedAt instanceof Date);
  const draft = normalizePublication({ publicationStatus: "DRAFT", publishedAt: new Date() });
  assert.equal(draft.publishedAt, null);
});

test("validates and sanitises public enquiries", () => {
  const result = validateCmsEntity("enquiries", {
    name: "A Guest",
    email: "guest@example.com",
    message: '<p>I am interested.</p><iframe src="bad"></iframe>',
    retreatSlug: "ladakh-edition-2-sep-2026",
  });
  assert.equal(result.valid, true);
  assert.equal(String(result.data.message).includes("iframe"), false);
});
