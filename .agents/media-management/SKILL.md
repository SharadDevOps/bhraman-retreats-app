# Azure Media & Blob Management Skill

## 1. Overview
Media assets (images, videos, audio) are hosted in Azure Blob Storage container `retreat-media` and tracked in PostgreSQL table `MediaAsset`.

## 2. Upload Workflow
1. **Authorization** (`/api/admin/media/uploads/authorize`): Client submits folder, filename, size, and MIME. Server validates against approved taxonomy and issues a short-lived Azure SAS URL.
2. **Direct Blob Upload**: Client uploads binary directly to Azure Blob Storage via `PUT` with required headers.
3. **Confirmation** (`/api/admin/media/uploads/confirm`): Server checks Blob existence in Azure and transitions `MediaAsset` status to `CONFIRMED`.
4. **Publishing** (`/api/admin/media/assets/[id]/publish`): Assigns media asset to a `SITE_SLOTS` target and marks `publicationStatus` as `PUBLISHED`.

## 3. Approved Media Taxonomy
- Whitelisted folders are maintained in `MEDIA_FOLDERS` in `src/lib/media-validation.mjs`.
- Whitelisted homepage slots are defined in `SITE_SLOTS` in `src/app/api/admin/media/assets/[id]/publish/route.ts`.
- Supported slots: `hero`, `retreat`, `founder`, `bg.philosophy`, `bg.upcoming-retreats`, `bg.testimonials`.

## 4. Local Development Fallback
- When Azure Storage credentials are not set, `/api/admin/media/uploads/local-file-upload` saves files locally to `public/uploads/`.
