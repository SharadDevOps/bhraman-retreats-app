# Bhraman Retreats — Current Architecture Audit

Audit date: 27 July 2026  
Audit scope: Phase 0, documentation only

## Baselines used

- **Current client-visible merged baseline:** `origin/main` at `0086eff` (`Merge pull request #1 from SharadDevOps/feature/phase1`).
- **Newer unmerged feature version:** the `feature/phase2` working tree. Its branch head is still `02b9131`, the same commit as `feature/phase1`; the Phase 2 hero exists as staged/uncommitted working-tree changes.
- Local `main` is behind `origin/main` and is not used as the client-visible comparison baseline.
- No backend, Prisma, API, storage, deployment, or workflow file differs between `origin/main` and the Phase 2 working tree.
- No branches were merged, rebased, reset, created, deleted, or switched during this audit.

## System overview

```text
Browser
  ├─ /                     Next.js server-rendered homepage
  │   ├─ getSiteData()     Prisma reads with static fallback
  │   └─ client islands    navigation, itinerary, booking, reveal, hero
  ├─ /admin                Client-rendered content/booking manager
  └─ /api/*
      ├─ public booking creation
      └─ cookie-protected admin operations

Next.js application
  ├─ Prisma 6
  │   └─ PostgreSQL in the committed schema and Azure
  ├─ Azure Blob Storage
  │   └─ managed-identity upload path when configured
  └─ local public/uploads fallback

Delivery
  ├─ Docker multi-stage build using Node 22
  ├─ Azure Container Registry
  ├─ Azure Linux App Service
  └─ GitHub Actions on pushes to main
```

## Runtime stack

| Concern | Current implementation |
|---|---|
| Framework | Next.js 15 App Router, React 19, TypeScript |
| Styling | One global handwritten stylesheet: `src/app/globals.css` |
| Icons | `lucide-react` |
| ORM | Prisma 6 |
| Committed database provider | PostgreSQL |
| Cloud database | Azure Database for PostgreSQL Flexible Server |
| Cloud media | Azure Blob Storage through managed identity |
| Local media fallback | Files written beneath `public/uploads` |
| Authentication | Separate password-based admin cookie, not the `User.role` field |
| Hosting | Containerized Azure Linux App Service |
| Container registry | Azure Container Registry |
| CI/CD | GitHub Actions with Azure OIDC |

## Application routes

| Route | Type | Responsibility |
|---|---|---|
| `/` | Server page | Homepage, dynamic retreat/testimonial/media lookup |
| `/admin` | Client page | Login, retreat content, testimonials, images, bookings |
| `/api/bookings` | Public API | Create a booking or waitlist record |
| `/api/admin/login` | Admin API | Create or clear the admin session cookie |
| `/api/admin/content` | Admin API | Read/update retreat fields, testimonials, and media-slot data |
| `/api/admin/upload` | Admin API | Upload an image and optionally bind it to a media slot |
| `/api/admin/bookings` | Admin API | List bookings and update booking/payment status |

There are no blog routes, article routes, video routes, enquiry-only routes, user account routes, or payment-gateway routes.

## Homepage data flow

1. `src/app/page.tsx` is marked `force-dynamic`.
2. `getSiteData()` in `src/lib/content.ts` concurrently requests:
   - the single retreat identified by `upcomingRetreat.slug`;
   - `SiteContent["testimonials"]`;
   - `SiteContent["mediaSlots"]`.
3. If the retreat row is missing, static values from `src/data/retreat.ts` are used.
4. If any database/JSON operation throws, the catch block returns the complete static fallback: no testimonials and no media.
5. The homepage combines those dynamic fields with hardcoded marketing copy and static `elements` and `itinerary` arrays.

## Content ownership

| Content | Source of truth at runtime |
|---|---|
| Retreat title, edition, summary, location, dates, price, capacity | Database when present; `upcomingRetreat` fallback |
| Testimonials | `SiteContent["testimonials"]`; empty by default |
| Retreat/founder media | `SiteContent["mediaSlots"]`; empty by default |
| Hero media in merged version | CSS-generated background/effects; `media.hero` is not consumed |
| Hero media in newer version | Tracked working-tree asset `public/hero-himalayan-dawn.png` |
| Five Elements copy | Static `elements` array |
| Itinerary | Static `itinerary` array; the `ItineraryDay` model is not read |
| Philosophy, founder, footer, booking surrounding copy | Hardcoded JSX |
| Payment instructions | Static placeholders in `src/data/retreat.ts` |

## Backend persistence

The schema contains six models: `User`, `Retreat`, `ItineraryDay`, `Booking`, `SiteContent`, and `MediaAsset`. String fields represent roles and statuses rather than Prisma enums.

Important implementation gaps:

- `ItineraryDay` exists in the database but the homepage uses the static array.
- `Retreat.heroImageUrl` is not read or written by the active UI/API.
- `SiteContent["mediaSlots"].hero` is supported by types and the upload API but not by the admin image UI or homepage.
- `User.role` and `User.externalId` are not used for admin authorization.
- `MediaAsset.width` and `height` are never populated.
- The application supports one configured retreat slug rather than retreat CRUD/routing.

## Authentication and authorization

- `POST /api/admin/login` compares a submitted password with `ADMIN_PASSWORD`.
- A seven-day HMAC-signed, HTTP-only, same-site `lax` cookie named `bhraman_admin` is created.
- Admin APIs call `isAdmin()` before accessing data.
- The cookie does not explicitly set `secure`.
- There is no login rate limiting, account lockout, CSRF token, or user/role-based admin authorization.
- `ADMIN_SECRET` falls back to `ADMIN_PASSWORD`, then to a development string inside the signing helper; the login route itself refuses login when `ADMIN_PASSWORD` is absent.

## Storage integration

- When `AZURE_STORAGE_ACCOUNT_NAME` exists, `DefaultAzureCredential` connects to `https://<account>.blob.core.windows.net`.
- The container defaults to `retreat-media`.
- Uploads accept JPEG, PNG, WebP, or AVIF up to 8 MiB.
- The entire file is buffered in application memory before upload.
- Uploaded assets are recorded in `MediaAsset`.
- Media-slot assignments are stored as JSON in `SiteContent["mediaSlots"]`.
- Without Azure configuration, uploads are written beneath ignored `public/uploads`.
- The code assumes anonymous blob-read access.
- There is no media listing, deletion, replacement cleanup, duplicate detection, or orphan cleanup.

## Deployment architecture — observed, not modified

- `.github/workflows/deploy-app.yml` builds a Docker image, pushes both commit-SHA and `latest` tags to ACR, applies Prisma migrations, and restarts the App Service.
- The workflow triggers on `main` pushes or manual dispatch.
- Azure authentication uses OIDC.
- `Dockerfile` builds and runs on Node 22 Bookworm.
- The runner executes `next start` on port 8080.
- Terraform owns container/app settings outside this repository.

No workflow, Docker, Azure, infrastructure, secret, or branch-protection change was made.

## Documentation drift

The README is useful but not fully authoritative:

- It describes SQLite local configuration while the committed Prisma schema is PostgreSQL.
- `.env.example` also gives `file:./dev.db`, which is incompatible with the committed PostgreSQL provider.
- It refers to a Next.js standalone output even though `next.config.ts` does not set `output: "standalone"` and the current Dockerfile deliberately ships the complete dependency tree.
- It describes Blob Storage as planned/not wired in one area, while `/api/admin/upload` currently invokes `uploadMedia`.
- It documents a default admin password that is not present in `.env.example` and should not be treated as an approved secret.

## Primary architectural risks

1. **Capacity race:** aggregate-then-create booking logic is not transactional, so concurrent requests can exceed capacity.
2. **Silent content fallback:** broad error handling can hide database or malformed-JSON failures by rendering defaults.
3. **Single retreat coupling:** slug usage is duplicated across APIs and fallback reads.
4. **Static/dynamic model split:** itinerary and hero concepts exist in both schema and static content but only one side is active.
5. **Admin security:** no rate limiting and no explicit secure cookie setting.
6. **Public endpoint abuse:** booking creation has validation but no bot protection or throttling.
7. **Upload memory/cleanup:** uploads are fully buffered and never deleted.
8. **No automated tests:** repository documentation confirms there are no automated application tests.
