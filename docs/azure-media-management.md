# Azure media management

## Architecture

Phase 3 uses the repository's existing Next.js route-handler backend. There is
no Express application in this repository, so adding Express would create a
second backend stack.

Binary files are stored only in Azure Blob Storage. PostgreSQL stores the
`MediaAsset` metadata, upload state and publication state.

```text
Admin requests upload permission
        |
Backend validates folder, name, MIME type, size and accessibility metadata
        |
Backend creates a short-lived create/write user-delegation SAS for one blob
        |
Browser uploads directly to Azure Blob Storage
        |
Backend reads Blob properties and confirms exact size, MIME type and blob type
        |
MediaAsset remains DRAFT until a content editor explicitly publishes it
```

The SAS lifetime is clamped to 5-15 minutes and defaults to 10 minutes. It
permits only create/write access to one randomized blob name. The public API
never returns SAS URLs, blob ETags or unreviewed records.

## Blob taxonomy

The storage container remains configurable through
`AZURE_STORAGE_CONTAINER_NAME`. The logical root prefix defaults to
`bhraman-media`, producing paths such as:

```text
bhraman-media/
  retreats/
    ladakh-edition-1/
      cover/
      gallery/
      videos/
      participants/
      monastery/
      thumbnails/
    ladakh-edition-2/
      cover/
      gallery/
      videos/
      thumbnails/
    uttarakhand-december/
      cover/
      gallery/
      videos/
      thumbnails/
  testimonials/
    written/
    videos/
    portraits/
    posters/
  founder/
    profile/
    journey/
    videos/
  blog/
    why-choose-bhraman/
      cover/
      inline/
  audio/
    ambient/
    breathing/
    bells/
    chants/
```

Folder values are an explicit allowlist; arbitrary folders and path traversal
are rejected.

## Environment variables

```env
AZURE_STORAGE_ACCOUNT_NAME="storage-account-name"
AZURE_STORAGE_CONTAINER_NAME="retreat-media"
AZURE_MEDIA_ROOT_PREFIX="bhraman-media"
AZURE_MEDIA_PUBLIC_BASE_URL="https://media.example.com"
AZURE_MEDIA_UPLOAD_BASE_URL=""
AZURE_MEDIA_SAS_TTL_MINUTES="10"
```

`AZURE_MEDIA_PUBLIC_BASE_URL` is optional. When set, persisted URLs use that
Azure Front Door or custom-domain base. Otherwise the Blob endpoint URL is
stored. `AZURE_MEDIA_UPLOAD_BASE_URL` is also optional; leave it empty to upload
directly to the Blob endpoint, or set it to a Front Door upload route that
preserves the signed blob path and query string.

Secrets, storage keys and connection strings are never returned by these APIs.
`DefaultAzureCredential` uses App Service managed identity in Azure and the
existing developer Azure login locally.

## Azure prerequisites

These are runtime prerequisites; Phase 3 does not modify Azure resources:

1. The configured container already exists.
2. The App Service managed identity can create a user-delegation key and read,
   write and delete blobs. Assign the minimum suitable Azure Blob data role at
   the storage account or container scope.
3. Blob service CORS allows the admin origins only, for example the production
   site and `http://localhost:3000` during development.
4. CORS allows `PUT` and `OPTIONS`, request headers `content-type`,
   `x-ms-blob-type` and `x-ms-*`, and exposes `etag` if the UI needs it.
5. An Azure Front Door route, when used, must forward the full blob path and SAS
   query string to the configured container origin.

Do not use a wildcard production CORS origin when credentials or additional
admin surfaces are introduced.

## File policy

| Kind | MIME types | Maximum |
|---|---|---:|
| Image | JPEG, PNG, WebP, AVIF | 20 MiB |
| Video | MP4, WebM, QuickTime | 1 GiB |
| Audio | MP3, WAV, Ogg, M4A | 250 MiB |

The authorization request validates the claimed size and MIME type. Confirmation
then compares those values with Azure Blob properties. A mismatch is rejected,
the blob is deleted, and the record becomes `REJECTED`.

## API workflow

All admin endpoints require `CONTENT_EDITOR` or `SUPER_ADMIN`.

### 1. Request upload permission

`POST /api/admin/media/uploads/authorize`

```json
{
  "folder": "retreats/ladakh-edition-2/cover",
  "fileName": "himalayan-dawn.webp",
  "mimeType": "image/webp",
  "sizeBytes": 2400000,
  "altText": "Morning light over the Ladakh mountains",
  "title": "Ladakh Edition 2.0 cover",
  "width": 2400,
  "height": 1600
}
```

Response data contains an asset ID, draft public URL, SAS upload URL, expiry and
required upload headers.

### 2. Upload directly from the browser

```ts
await fetch(upload.url, {
  method: "PUT",
  headers: upload.requiredHeaders,
  body: file,
});
```

The repository provides `uploadMediaForReview` in
`src/lib/media-upload-client.ts`, which performs authorization, direct upload
and confirmation without sending the binary through the application backend.

### 3. Confirm upload

`POST /api/admin/media/uploads/confirm`

```json
{ "assetId": "media-asset-id" }
```

Successful confirmation sets `uploadStatus` to `CONFIRMED`; publication remains
`DRAFT`.

### 4. Review assets

`GET /api/admin/media/assets?page=1&pageSize=25&uploadStatus=CONFIRMED&publicationStatus=DRAFT`

Optional filters: `folder`, `kind`, `uploadStatus`, `publicationStatus`.

### 5. Publish after review

`POST /api/admin/media/assets/:id/publish`

```json
{ "slot": "retreat" }
```

`slot` is optional and may be `retreat`, `founder` or `hero`. When supplied, the
publish transaction also updates the existing `media.slots` site setting.

### 6. Read published media

`GET /api/public/media?folder=retreats/ladakh-edition-2/gallery&page=1&pageSize=25`

Only `CONFIRMED` and `PUBLISHED` records are returned.

## Database migration

Migration:

```text
prisma/migrations/20260728150000_azure_media_management/migration.sql
```

Apply using the existing migration owner:

```powershell
npx prisma migrate deploy
```

Rollback SQL is provided beside the migration. Flyway must not apply these
migrations because Prisma owns `_prisma_migrations`.
