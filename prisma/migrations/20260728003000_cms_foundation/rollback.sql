-- Manual rollback for 20260728003000_cms_foundation.
-- Run only after taking a database backup. CMS-only records will be removed.

DROP TABLE IF EXISTS "Enquiry";
DROP TABLE IF EXISTS "SiteSetting";
DROP TABLE IF EXISTS "Quote";
DROP TABLE IF EXISTS "FounderProfile";
DROP TABLE IF EXISTS "BlogPost";
DROP TABLE IF EXISTS "Testimonial";
DROP TABLE IF EXISTS "ItineraryActivity";
DROP TABLE IF EXISTS "ItinerarySection";

DROP INDEX IF EXISTS "RetreatDay_retreatId_publicationStatus_idx";
ALTER TABLE "RetreatDay"
  DROP COLUMN IF EXISTS "publicationStatus",
  DROP COLUMN IF EXISTS "createdAt",
  DROP COLUMN IF EXISTS "updatedAt";
UPDATE "RetreatDay" SET "activities" = '[]' WHERE "activities" IS NULL;
ALTER TABLE "RetreatDay" ALTER COLUMN "activities" SET NOT NULL;
ALTER TABLE "RetreatDay" RENAME TO "ItineraryDay";
ALTER INDEX "RetreatDay_retreatId_dayNumber_key" RENAME TO "ItineraryDay_retreatId_dayNumber_key";
ALTER TABLE "ItineraryDay"
  RENAME CONSTRAINT "RetreatDay_retreatId_fkey" TO "ItineraryDay_retreatId_fkey";

DROP INDEX IF EXISTS "Retreat_publicationStatus_status_startDate_idx";
UPDATE "Retreat"
SET "status" = CASE
  WHEN "publicationStatus" = 'DRAFT' OR "publicationStatus" = 'ARCHIVED' THEN 'DRAFT'
  WHEN "status" IN ('SOLD_OUT', 'COMPLETED', 'CANCELLED') THEN "status"
  ELSE 'PUBLISHED'
END;
ALTER TABLE "Retreat" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "Retreat"
  DROP COLUMN IF EXISTS "publicationStatus",
  DROP COLUMN IF EXISTS "highlight",
  DROP COLUMN IF EXISTS "publishedAt";

ALTER TABLE "MediaAsset"
  DROP COLUMN IF EXISTS "title",
  DROP COLUMN IF EXISTS "caption",
  DROP COLUMN IF EXISTS "credit",
  DROP COLUMN IF EXISTS "publicationStatus",
  DROP COLUMN IF EXISTS "updatedAt";
