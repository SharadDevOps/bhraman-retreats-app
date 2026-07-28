-- Phase 2 CMS foundation.
-- Existing retreat, booking, user, media and site-content records are preserved.

ALTER TABLE "Retreat"
  ADD COLUMN "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "highlight" TEXT,
  ADD COLUMN "publishedAt" TIMESTAMP(3);

UPDATE "Retreat"
SET
  "publicationStatus" = CASE
    WHEN "status" IN ('PUBLISHED', 'SOLD_OUT', 'COMPLETED', 'CANCELLED') THEN 'PUBLISHED'
    ELSE 'DRAFT'
  END,
  "publishedAt" = CASE
    WHEN "status" IN ('PUBLISHED', 'SOLD_OUT', 'COMPLETED', 'CANCELLED') THEN "updatedAt"
    ELSE NULL
  END,
  "status" = CASE
    WHEN "status" = 'SOLD_OUT' THEN 'SOLD_OUT'
    WHEN "status" = 'COMPLETED' THEN 'COMPLETED'
    WHEN "status" = 'CANCELLED' THEN 'CANCELLED'
    ELSE 'UPCOMING'
  END;

ALTER TABLE "Retreat" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
CREATE INDEX "Retreat_publicationStatus_status_startDate_idx"
  ON "Retreat"("publicationStatus", "status", "startDate");

ALTER TABLE "ItineraryDay" RENAME TO "RetreatDay";
ALTER INDEX "ItineraryDay_retreatId_dayNumber_key" RENAME TO "RetreatDay_retreatId_dayNumber_key";
ALTER TABLE "RetreatDay"
  RENAME CONSTRAINT "ItineraryDay_retreatId_fkey" TO "RetreatDay_retreatId_fkey";
ALTER TABLE "RetreatDay"
  ALTER COLUMN "activities" DROP NOT NULL,
  ADD COLUMN "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "RetreatDay_retreatId_publicationStatus_idx"
  ON "RetreatDay"("retreatId", "publicationStatus");

CREATE TABLE "ItinerarySection" (
  "id" TEXT NOT NULL,
  "retreatDayId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ItinerarySection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ItineraryActivity" (
  "id" TEXT NOT NULL,
  "itinerarySectionId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startTime" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ItineraryActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Testimonial" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "location" TEXT,
  "quote" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogPost" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "coverImageUrl" TEXT,
  "authorName" TEXT,
  "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FounderProfile" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "bio" TEXT NOT NULL,
  "imageUrl" TEXT,
  "credentials" TEXT,
  "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FounderProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Quote" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "attribution" TEXT,
  "context" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteSetting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "description" TEXT,
  "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Enquiry" (
  "id" TEXT NOT NULL,
  "retreatId" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "source" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ItinerarySection"
  ADD CONSTRAINT "ItinerarySection_retreatDayId_fkey"
  FOREIGN KEY ("retreatDayId") REFERENCES "RetreatDay"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ItineraryActivity"
  ADD CONSTRAINT "ItineraryActivity_itinerarySectionId_fkey"
  FOREIGN KEY ("itinerarySectionId") REFERENCES "ItinerarySection"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Enquiry"
  ADD CONSTRAINT "Enquiry_retreatId_fkey"
  FOREIGN KEY ("retreatId") REFERENCES "Retreat"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Testimonial_slug_key" ON "Testimonial"("slug");
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE UNIQUE INDEX "FounderProfile_slug_key" ON "FounderProfile"("slug");
CREATE UNIQUE INDEX "Quote_slug_key" ON "Quote"("slug");
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

CREATE INDEX "ItinerarySection_retreatDayId_sortOrder_idx"
  ON "ItinerarySection"("retreatDayId", "sortOrder");
CREATE INDEX "ItineraryActivity_itinerarySectionId_sortOrder_idx"
  ON "ItineraryActivity"("itinerarySectionId", "sortOrder");
CREATE INDEX "Testimonial_publicationStatus_sortOrder_idx"
  ON "Testimonial"("publicationStatus", "sortOrder");
CREATE INDEX "BlogPost_publicationStatus_publishedAt_idx"
  ON "BlogPost"("publicationStatus", "publishedAt");
CREATE INDEX "FounderProfile_publicationStatus_idx"
  ON "FounderProfile"("publicationStatus");
CREATE INDEX "Quote_publicationStatus_sortOrder_idx"
  ON "Quote"("publicationStatus", "sortOrder");
CREATE INDEX "SiteSetting_publicationStatus_idx"
  ON "SiteSetting"("publicationStatus");
CREATE INDEX "Enquiry_status_createdAt_idx" ON "Enquiry"("status", "createdAt");
CREATE INDEX "Enquiry_retreatId_idx" ON "Enquiry"("retreatId");

ALTER TABLE "MediaAsset"
  ADD COLUMN "title" TEXT,
  ADD COLUMN "caption" TEXT,
  ADD COLUMN "credit" TEXT,
  ADD COLUMN "publicationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
