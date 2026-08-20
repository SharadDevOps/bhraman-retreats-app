import assert from "node:assert/strict";
import test from "node:test";
import {
  MEDIA_FOLDERS,
  MEDIA_LIMITS,
  expectedKindForFolder,
  sanitizeMediaFileName,
  validateMediaUploadRequest,
} from "../src/lib/media-validation.mjs";
import { validateCmsEntity } from "../src/lib/cms-validation.mjs";

test("approved taxonomy contains every requested Bhraman media folder", () => {
  assert.ok(MEDIA_FOLDERS.length >= 27);
  assert.ok(MEDIA_FOLDERS.includes("retreats/ladakh-edition-1/participants"));
  assert.ok(MEDIA_FOLDERS.includes("retreats/ladakh-edition-1/monastery"));
  assert.ok(MEDIA_FOLDERS.includes("testimonials/posters"));
  assert.ok(MEDIA_FOLDERS.includes("blog/why-choose-bhraman/inline"));
  assert.ok(MEDIA_FOLDERS.includes("audio/chants"));
});

test("accepts valid image, video and audio metadata", () => {
  const image = validateMediaUploadRequest({
    folder: "retreats/ladakh-edition-2/cover",
    fileName: "Himalayan Dawn.webp",
    mimeType: "image/webp",
    sizeBytes: 2_400_000,
    altText: "Morning light over the Ladakh mountains",
    width: 2400,
    height: 1600,
  });
  const video = validateMediaUploadRequest({
    folder: "testimonials/videos",
    fileName: "guest-story.mp4",
    mimeType: "video/mp4",
    sizeBytes: 120_000_000,
    title: "Guest story",
    durationSeconds: 90,
  });
  const audio = validateMediaUploadRequest({
    folder: "audio/bells",
    fileName: "temple-bells.mp3",
    mimeType: "audio/mpeg",
    sizeBytes: 4_000_000,
    title: "Temple bells",
  });

  assert.equal(image.valid && image.value.kind, "IMAGE");
  assert.equal(video.valid && video.value.kind, "VIDEO");
  assert.equal(audio.valid && audio.value.kind, "AUDIO");
});

test("rejects unapproved paths and path traversal", () => {
  for (const folder of ["retreats/unknown/gallery", "../private", "audio/chants/../../secrets"]) {
    const result = validateMediaUploadRequest({
      folder,
      fileName: "image.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 100,
      altText: "Retreat image",
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.folder);
  }
});

test("rejects MIME, folder kind and extension mismatches", () => {
  const wrongFolder = validateMediaUploadRequest({
    folder: "audio/ambient",
    fileName: "ambient.mp4",
    mimeType: "video/mp4",
    sizeBytes: 1000,
  });
  const wrongExtension = validateMediaUploadRequest({
    folder: "founder/profile",
    fileName: "portrait.exe",
    mimeType: "image/jpeg",
    sizeBytes: 1000,
    altText: "Founder portrait",
  });
  assert.equal(wrongFolder.valid, false);
  assert.ok(wrongFolder.errors.mimeType);
  assert.equal(wrongExtension.valid, false);
  assert.ok(wrongExtension.errors.fileName);
});

test("enforces media size limits and image alt text", () => {
  const oversized = validateMediaUploadRequest({
    folder: "founder/videos",
    fileName: "journey.mp4",
    mimeType: "video/mp4",
    sizeBytes: MEDIA_LIMITS.VIDEO + 1,
  });
  const missingAlt = validateMediaUploadRequest({
    folder: "founder/profile",
    fileName: "portrait.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 1000,
  });
  assert.equal(oversized.valid, false);
  assert.ok(oversized.errors.sizeBytes);
  assert.equal(missingAlt.valid, false);
  assert.ok(missingAlt.errors.altText);
});

test("sanitises file names and maps folder media kinds", () => {
  assert.equal(sanitizeMediaFileName("  Śacred bells (final).MP3  "), "sacred-bells-final.mp3");
  assert.equal(expectedKindForFolder("retreats/ladakh-edition-1/videos"), "VIDEO");
  assert.equal(expectedKindForFolder("audio/breathing"), "AUDIO");
  assert.equal(expectedKindForFolder("testimonials/posters"), "IMAGE");
});

test("generic CMS edits cannot replace controlled Blob identity or upload state", () => {
  const result = validateCmsEntity("media-assets", {
    title: "Approved title",
    blobName: "other-container/uncontrolled.exe",
    url: "https://untrusted.example/file",
    mimeType: "application/octet-stream",
    uploadStatus: "CONFIRMED",
    publicationStatus: "PUBLISHED",
  }, { partial: true });

  assert.equal(result.valid, true);
  assert.deepEqual(result.data, { title: "Approved title" });
});
