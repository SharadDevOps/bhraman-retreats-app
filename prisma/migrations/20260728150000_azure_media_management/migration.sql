-- Phase 3 Azure media management metadata.
-- Binary media remains in Azure Blob Storage; PostgreSQL stores metadata only.

ALTER TABLE "MediaAsset"
  ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'IMAGE',
  ADD COLUMN "folder" TEXT NOT NULL DEFAULT 'legacy',
  ADD COLUMN "originalFileName" TEXT,
  ADD COLUMN "sizeBytes" INTEGER,
  ADD COLUMN "durationSeconds" INTEGER,
  ADD COLUMN "uploadStatus" TEXT NOT NULL DEFAULT 'AUTHORIZED',
  ADD COLUMN "etag" TEXT,
  ADD COLUMN "uploadedAt" TIMESTAMP(3),
  ADD COLUMN "publishedAt" TIMESTAMP(3);

UPDATE "MediaAsset"
SET
  "kind" = CASE
    WHEN "mimeType" LIKE 'video/%' THEN 'VIDEO'
    WHEN "mimeType" LIKE 'audio/%' THEN 'AUDIO'
    ELSE 'IMAGE'
  END,
  "originalFileName" = "blobName",
  "uploadStatus" = 'CONFIRMED',
  "uploadedAt" = "createdAt",
  "publishedAt" = CASE WHEN "publicationStatus" = 'PUBLISHED' THEN "updatedAt" ELSE NULL END;

CREATE INDEX "MediaAsset_publicationStatus_folder_createdAt_idx"
  ON "MediaAsset"("publicationStatus", "folder", "createdAt");
CREATE INDEX "MediaAsset_uploadStatus_createdAt_idx"
  ON "MediaAsset"("uploadStatus", "createdAt");
