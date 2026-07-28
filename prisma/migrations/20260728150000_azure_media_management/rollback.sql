DROP INDEX IF EXISTS "MediaAsset_uploadStatus_createdAt_idx";
DROP INDEX IF EXISTS "MediaAsset_publicationStatus_folder_createdAt_idx";

ALTER TABLE "MediaAsset"
  DROP COLUMN IF EXISTS "publishedAt",
  DROP COLUMN IF EXISTS "uploadedAt",
  DROP COLUMN IF EXISTS "etag",
  DROP COLUMN IF EXISTS "uploadStatus",
  DROP COLUMN IF EXISTS "durationSeconds",
  DROP COLUMN IF EXISTS "sizeBytes",
  DROP COLUMN IF EXISTS "originalFileName",
  DROP COLUMN IF EXISTS "folder",
  DROP COLUMN IF EXISTS "kind";
