# Bhraman Retreats

A responsive Next.js website for an elemental wellness-retreat business in the
Himalayas, India. Visitors explore the retreat concept (the five elements —
Earth, Water, Fire, Air, Space), read the day-by-day itinerary, and book a spot.
A password-protected admin panel lets the owner edit content, manage
testimonials, upload images, and review bookings.

This README is written so a human or an AI agent can pick the project up cold.
It covers the stack, layout, data model, local development, the admin panel,
the database story, and the full Azure deployment (app + infrastructure).

---

## 1. Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + React 19, TypeScript |
| Styling | Hand-written CSS in `src/app/globals.css` (CSS variables, no Tailwind) |
| Icons | `lucide-react` |
| ORM | Prisma 6 |
| Database | SQLite locally, Azure PostgreSQL Flexible Server in the cloud |
| Package manager | pnpm 11 |
| Media (planned) | Azure Blob Storage (`@azure/storage-blob`, `@azure/identity`) |
| Hosting | Azure Linux App Service (Node 20, `output: "standalone"`) |
| IaC | Terraform (azurerm ~> 3.100), state in Azure Storage |
| CI/CD | GitHub Actions, OIDC auth to Azure (no client secret) |

Node 20+ and pnpm are required.

---

## 2. Repositories

There are **two** repos under `D:\Projects\Brahman\`:

- **`BhramanRetreats`** (this repo) — the Next.js application.
- **`Bhraman-Infrastructure`** — Terraform + pipelines that provision the Azure
  resources. GitHub: `SharadDevOps/bhraman-infrastructure`. See its own
  `docs/deployment-strategy.md` and `foundation/README.md`.

The app deploys onto infrastructure created by the infra repo.

---

## 3. Application structure

```text
BhramanRetreats/
  src/
    app/
      layout.tsx            # Root layout, fonts (Cormorant Garamond + DM Sans), metadata
      page.tsx              # Homepage (server component; reads content from DB)
      globals.css           # ALL styling + animations
      admin/page.tsx        # Admin panel (client component, tabbed)
      api/
        bookings/route.ts        # POST public booking endpoint
        admin/
          login/route.ts         # POST/DELETE password login (sets signed cookie)
          content/route.ts       # GET/PUT retreat content + testimonials
          upload/route.ts        # POST image upload (writes public/uploads, records MediaAsset)
          bookings/route.ts      # GET all bookings, PATCH status/paymentStatus
    components/
      navigation.tsx        # Top nav (client; mobile menu). NOTE: no "Sign in" link (removed by request)
      itinerary.tsx         # Interactive day tabs (client)
      booking-form.tsx      # Booking form + confirmation w/ payment instructions (client)
      scroll-reveal.tsx     # IntersectionObserver: fade-in sections on scroll (client)
      nature-effects.tsx    # Falling leaves, drifting mist (hero) + fireflies (founder section)
    data/
      retreat.ts            # Static fallback data: elements[], itinerary[], upcomingRetreat, paymentInstructions
    lib/
      prisma.ts             # Prisma client singleton
      content.ts            # getSiteData() — reads retreat/testimonials/media from DB w/ fallback
      admin-auth.ts         # HMAC-signed cookie helpers, isAdmin()
      azure-storage.ts      # getMediaContainer() (blob helper; not yet wired into uploads)
  prisma/
    schema.prisma           # Data model (provider: postgresql; was sqlite in early dev)
    migrations/             # PostgreSQL migration (hand-written init)
  scripts/
    deploy-local.ps1        # One-shot build + migrate + deploy to App Service from your machine
  .github/workflows/
    deploy-app.yml          # CI: build, migrate, deploy to App Service via OIDC
  next.config.ts            # output: standalone; eslint.ignoreDuringBuilds; blob image domain
```

### Homepage sections (in `page.tsx`)
Hero (with animated element wheel + nature effects) → Manifesto → Five elements
grid → Upcoming retreat (image + price + dates from DB) → Itinerary tabs →
Founder → Testimonials (only if any exist) → Booking (closing section).

### Animations (all in `globals.css`, all respect `prefers-reduced-motion`)
- Rotating element wheel (`@keyframes wheel-spin`, 90s) with counter-rotating labels.
- Breathing ॐ glow, drifting background orbits, bobbing scroll cue.
- Scroll-reveal fade-ups + staggered element cards.
- Nature: falling gold/clay leaves, drifting mist (hero), blinking fireflies (founder).
- A birds animation was added then **removed** at the user's request — do not re-add.

---

## 4. Data model (`prisma/schema.prisma`)

Enums are stored as plain strings (a carry-over from the SQLite phase; valid
values are documented in comments at the top of the schema).

- **User** — `id`, `externalId?`, `email` (unique), `name?`, `phone?`, `role`
  (default `GUEST`), timestamps.
- **Retreat** — `slug` (unique), `title`, `edition?`, `summary`, `description`,
  `location`, `startDate`, `endDate`, `priceInPaise` (int), `capacity`,
  `status` (default `DRAFT`), `heroImageUrl?`, timestamps.
- **ItineraryDay** — belongs to Retreat (cascade delete); `dayNumber`,
  `element`, `title`, `description?`, `activities` (JSON string). Unique
  `(retreatId, dayNumber)`.
- **Booking** — `reference` (unique, e.g. `BR-7KQ2NC`), FK `user`, FK `retreat`,
  `guests`, `totalInPaise`, `status` (default `PENDING`), `paymentStatus`
  (default `PENDING`), `dietaryNotes?`, `healthNotes?`, timestamps.
- **SiteContent** — key/value store (`value` is a JSON string). Keys in use:
  `testimonials` (array of `{name, location, quote}`) and `mediaSlots`
  (`{retreat?, founder?, hero?}` → image URLs).
- **MediaAsset** — uploaded image records: `blobName` (unique), `url`,
  `altText`, `mimeType`, `width?`, `height?`.

Prices are stored in **paise** (₹1 = 100 paise). `priceInPaise: 2999900` = ₹29,999.

---

## 5. Local development

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate dev      # applies migration to the local DB
pnpm dev                     # http://localhost:3000
```

`.env` (local) minimally needs:

```
DATABASE_URL="file:./dev.db"     # SQLite for local dev
ADMIN_PASSWORD="bhraman2026"     # /admin login password
```

> The committed schema uses `provider = "postgresql"`. For a **pure local SQLite**
> workflow you can temporarily switch it back to `sqlite`, but the deployed app
> and migration are PostgreSQL. Keep `postgresql` for anything cloud-bound.

Always stop the dev server before building/deploying — a running dev server locks
Prisma's query engine on Windows (`EPERM ... query_engine-windows.dll.node`).

---

## 6. Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | app runtime | Prisma connection string. Cloud: `postgresql://bhraman_admin:<urlencoded-pw>@psql-bhr-ret-<env>-cin.postgres.database.azure.com:5432/bhraman?sslmode=require` |
| `ADMIN_PASSWORD` | app runtime | Password for `/admin`. |
| `ADMIN_SECRET` | app runtime (optional) | HMAC key for the admin cookie; falls back to `ADMIN_PASSWORD`. |
| `AZURE_STORAGE_ACCOUNT_NAME` | app runtime | For the (planned) blob upload path. |
| `AZURE_STORAGE_CONTAINER_NAME` | app runtime | Defaults to `retreat-media`. |

In Azure these are set as App Service **application settings** by Terraform
(`foundation/deployments/modules/app-service` app_settings). Passwords in the
DB URL must be URL-encoded (`@` → `%40`, etc.).

---

## 7. Admin panel (`/admin`)

- Login posts to `/api/admin/login`; on success an HTTP-only, HMAC-signed cookie
  (`bhraman_admin`, 7-day expiry) is set. `isAdmin()` verifies it on every admin API.
- Four tabs:
  - **Content** — edit the upcoming retreat (title, edition, location, dates,
    price, capacity, summary). Saved to the `Retreat` row (upserted by slug
    `forest-edition-dec-2026`).
  - **Testimonials** — add/edit/remove; saved to `SiteContent["testimonials"]`.
    They appear on the homepage only when at least one exists.
  - **Images** — upload retreat/founder images. Saved under `public/uploads`,
    recorded as `MediaAsset`, and the slot URL stored in `SiteContent["mediaSlots"]`.
  - **Bookings** — list all bookings with guest details; mark Confirmed / Paid / Cancelled.
- The homepage reads all of this via `getSiteData()` (`src/lib/content.ts`),
  which falls back to the static values in `src/data/retreat.ts` if the DB is
  empty or unreachable. `page.tsx` is `force-dynamic` so edits show immediately.

Default password is `bhraman2026` (change via `ADMIN_PASSWORD`).

---

## 8. Deployment

The app runs on Azure Linux App Service as a Next.js **standalone** bundle
(`output: "standalone"`; startup command `HOSTNAME=0.0.0.0 node server.js` so it
binds to all interfaces). Resource names per environment: RG
`rg-bhr-ret-<env>-cin`, web app `app-bhr-ret-<env>-cin`, Postgres
`psql-bhr-ret-<env>-cin`, storage `stbhrret<env>cin` (Central India).

Two deployment paths:

### A. One-shot from your machine — `scripts/deploy-local.ps1`
```powershell
az login
cd D:\Projects\Brahman\BhramanRetreats
.\scripts\deploy-local.ps1 -Environment dev -DbPassword '<db-admin-password>'
```
It builds, opens a temporary Postgres firewall rule for your IP, runs
`prisma migrate deploy`, removes the rule, sets the startup command, zips the
standalone bundle, and `az webapp deploy`s it. Password is URL-encoded internally.

### B. GitHub Actions — `.github/workflows/deploy-app.yml`
Triggers on push to `main` (or manual dispatch with an environment choice).
Uses OIDC (`azure/login`), applies migrations behind a temporary firewall rule,
and deploys with `az webapp deploy`. Requires, in the app repo:
- Secrets: `ARM_CLIENT_ID`, `ARM_TENANT_ID`, `ARM_SUBSCRIPTION_ID`, `DATABASE_URL`.
- Federated credentials on the deployment app registration for this repo
  (run the infra repo's `scripts/setup-oidc.ps1 -Repo <app-repo> -UseImmutableIds $true`).
- Protected environments `dev` / `prod`.

Live URL (dev): **https://app-bhr-ret-dev-cin.azurewebsites.net**

---

## 9. Infrastructure (summary — full detail in the infra repo)

Provisioned by `Bhraman-Infrastructure` with Terraform:
- Resource group, Linux App Service (plan + web app), PostgreSQL Flexible Server
  (v16, db `bhraman`, admin `bhraman_admin`), and a private `retreat-media`
  storage account — one set each for `dev` and `prod`, in Central India.
- Terraform state in Azure Storage (`bhr-tfstate-cin-rg` / `bhrtfstatecin` /
  `tfstate`) with `use_azuread_auth`.
- Auth to Azure is **OIDC federated credentials** (the tenant uses the
  immutable-ID subject form) — no client secret anywhere.
- Naming: `rg-`, `asp-`, `app-`, `psql-` prefixes + `<brand>-<project>-<env>-<loc>`
  (`bhr-ret-dev-cin`); storage has no hyphens (`stbhrretdevcin`).
- Pipelines: `terraform-plan` (PR), `terraform-apply` (manual, env-gated),
  `terraform-destroy` (manual), `pre-checks` (fmt/TFLint/KICS, fails only on
  high/critical).

The deployment app-registration (service principal) id currently in use:
`670d871f-0cc2-40c6-b144-1f16bda9e391`.

---

## 10. Known limitations / TODO for the next agent

1. **Image uploads.** In Azure, `/api/admin/upload` stores images in the
   `retreat-media` blob container via the App Service managed identity
   (`src/lib/azure-storage.ts` → `uploadMedia`) and returns the public blob URL.
   Locally (no `AZURE_STORAGE_ACCOUNT_NAME`) it falls back to writing
   `public/uploads`. The container allows anonymous blob read so image URLs work
   in `<img>`; the app identity has `Storage Blob Data Contributor` (granted in
   the infra env `main.tf`). Requires the storage/role-assignment infra changes
   to be applied (`terraform apply`).
2. **Single retreat.** The site models one "upcoming retreat" (slug
   `forest-edition-dec-2026`). Multi-retreat support would need routing +
   admin CRUD over `Retreat` rows.
3. **No automated tests.** Consider adding a booking-flow test and a build check.
4. **Payment is manual.** Booking shows UPI/bank details (placeholders in
   `src/data/retreat.ts` — replace with real values). No payment gateway.
5. **Enums as strings.** Fine, but if you reintroduce a fresh Postgres-only
   schema you could use native Prisma enums.

### Conventions to preserve
- Keep all styling and animations in `globals.css`; keep components single-file.
- Respect `prefers-reduced-motion` for any new animation.
- Do not re-add the birds animation.
- Do not add a "Sign in" link to the public nav.
- Prices are in paise (integer). Store secrets only in env/GitHub secrets — never in files.
- Public marketing site: do NOT enable App Service AAD auth or client-cert auth.
