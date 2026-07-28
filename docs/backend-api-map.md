# Backend API and Data Map

## API routes

### `POST /api/bookings`

File: `src/app/api/bookings/route.ts`  
Authentication: public

Input:

| Field | Validation |
|---|---|
| `name` | Trimmed; minimum two characters |
| `email` | Trimmed/lowercased; basic email regex |
| `phone` | Trimmed; phone regex, 8–18 formatted characters |
| `guests` | Integer from 1 to 6 |
| `dietaryNotes` | Optional trimmed string |
| `healthNotes` | Optional trimmed string |

Behavior:

1. Upserts the single configured retreat from static fallback data if missing.
2. Sums guests for PENDING and CONFIRMED bookings.
3. Chooses PENDING or WAITLISTED.
4. Upserts a user by email, updating name and phone.
5. Creates a booking with a random `BR-XXXXXX` reference.
6. Returns reference, status, guests, and total in paise.

Responses: 201, validation 400, persistence 500.

Risks:

- Capacity check and booking creation are not transactional.
- No rate limit, CAPTCHA, idempotency key, or duplicate-booking protection.
- Random reference uniqueness collision is left to the database error path.
- Existing user contact details are overwritten by later bookings using the same email.

### `POST /api/admin/login`

File: `src/app/api/admin/login/route.ts`  
Authentication: submitted password

- Requires `ADMIN_PASSWORD`.
- Sets `bhraman_admin`, HTTP-only, same-site `lax`, seven-day expiry.
- Returns 401 for incorrect password and 500 when configuration is missing.
- Does not explicitly set `secure`.
- No rate limiting or lockout.

### `DELETE /api/admin/login`

- Clears the admin cookie.

### `GET /api/admin/content`

File: `src/app/api/admin/content/route.ts`  
Authentication: signed admin cookie

Returns:

- retreat row or static fallback;
- parsed `SiteContent["testimonials"]`;
- parsed `SiteContent["mediaSlots"]`.

### `PUT /api/admin/content`

Authentication: signed admin cookie

Accepted payloads:

- `retreat`: title, edition, summary, location, start/end dates, price in paise, capacity;
- `testimonials`: array reduced to trimmed name/location/quote objects.

Behavior:

- Upserts the configured retreat slug.
- Upserts the testimonial JSON row.
- Does not edit retreat description, status, slug, heroImageUrl, or itinerary.
- Does not enforce maximum string lengths.

### `POST /api/admin/upload`

File: `src/app/api/admin/upload/route.ts`  
Runtime: Node.js  
Authentication: signed admin cookie

Input:

- multipart `file`;
- optional `slot`: `retreat`, `founder`, or `hero`;
- optional `altText`.

Validation:

- JPEG, PNG, WebP, AVIF;
- maximum 8 MiB.

Behavior:

- Sanitizes the original filename and prefixes a timestamp.
- Uploads to Azure Blob Storage when configured.
- Otherwise writes under `public/uploads`.
- Creates a `MediaAsset`.
- Optionally updates JSON `mediaSlots`.

Risks:

- Entire file buffered in memory.
- MIME value is trusted; content is not decoded/verified.
- Read-modify-write slot update can lose concurrent changes.
- No delete, replacement cleanup, or orphan cleanup.
- `width` and `height` are not extracted.
- The API accepts a hero slot that is not exposed in the admin UI and is not rendered.

### `GET /api/admin/bookings`

File: `src/app/api/admin/bookings/route.ts`  
Authentication: signed admin cookie

- Returns all bookings, newest first.
- Includes user name, email, and phone.
- No pagination or filtering.

### `PATCH /api/admin/bookings`

Authentication: signed admin cookie

- Requires booking `id`.
- Permits a validated booking status and/or payment status.
- Valid booking statuses: PENDING, CONFIRMED, WAITLISTED, CANCELLED, REFUNDED.
- Valid payment statuses: PENDING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED.
- Does not validate transition order or maintain a status history.

## Prisma models

### `User`

Fields: id, externalId, email, name, phone, role, createdAt, updatedAt.  
Active use: public booking identity/contact.  
Inactive concepts: external identity and role-based authorization.

### `Retreat`

Fields: id, slug, title, edition, summary, description, location, dates, price, capacity, status, heroImageUrl, itinerary relation, bookings relation, timestamps.

Active on homepage/admin:

- title, edition, summary, location, dates, price, capacity.

Present but not managed/rendered:

- description;
- status;
- heroImageUrl;
- itinerary relation.

### `ItineraryDay`

Fields: retreat relation, dayNumber, element, title, description, JSON-string activities.  
Runtime status: unused by homepage and admin; static `src/data/retreat.ts` is authoritative.

### `Booking`

Fields: reference, user, retreat, guests, total, booking status, payment status, dietary/health notes, timestamps.  
Runtime status: active.

### `SiteContent`

Generic string key/value JSON store.

Keys used:

- `testimonials`;
- `mediaSlots`.

The `published` field is set true by admin updates but is not checked by homepage reads.

### `MediaAsset`

Fields: blobName, URL, alt text, MIME type, optional dimensions, createdAt.  
Runtime status: records uploads; no list or delete surface.

## Supporting backend modules

| Module | Responsibility |
|---|---|
| `src/lib/prisma.ts` | Development-safe singleton Prisma client |
| `src/lib/content.ts` | Homepage data aggregation and fallback |
| `src/lib/admin-auth.ts` | HMAC token generation/verification and cookie lookup |
| `src/lib/azure-storage.ts` | Managed-identity Blob client and upload |
| `src/data/retreat.ts` | Static fallback, elements, itinerary, payment instructions |

## Environment variables

| Variable | Required by | Notes |
|---|---|---|
| `DATABASE_URL` | Prisma | Must be PostgreSQL for the committed schema |
| `ADMIN_PASSWORD` | Admin login | Required |
| `ADMIN_SECRET` | Cookie signing | Optional; falls back to admin password |
| `AZURE_STORAGE_ACCOUNT_NAME` | Blob uploads | Presence selects Azure storage |
| `AZURE_STORAGE_CONTAINER_NAME` | Blob uploads | Defaults to `retreat-media` |
| `ENTRA_CLIENT_ID` | Currently unused | Present in `.env.example` |
| `ENTRA_CLIENT_SECRET` | Currently unused | Present in `.env.example` |
| `ENTRA_TENANT_ID` | Currently unused | Present in `.env.example` |

## External/storage integrations

| Integration | Status |
|---|---|
| Azure PostgreSQL | Active through Prisma |
| Azure Blob Storage | Active when account name is configured |
| Managed Identity / DefaultAzureCredential | Active Blob credential path |
| ACR | Active deployment artifact registry |
| Azure App Service | Active container host |
| GitHub Actions OIDC | Active deployment authentication |
| Payment provider | None |
| Email provider | None |
| SMS/WhatsApp provider | None |
| CRM | None |
| Blog CMS | None |
| Video host integration | None |

## API documentation

`mcp/spec.json` documents only `POST /api/bookings`.

Drift:

- Its description says admin/API-key endpoints are to be added.
- Actual admin endpoints exist and use a signed cookie rather than API keys.
- No OpenAPI definitions exist for admin content, upload, login, or booking management.
## Phase 3 Azure media APIs

Detailed lifecycle, security policy, Azure prerequisites and examples are in
[`azure-media-management.md`](./azure-media-management.md).

- `POST /api/admin/media/uploads/authorize`
- `POST /api/admin/media/uploads/confirm`
- `GET /api/admin/media/assets`
- `POST /api/admin/media/assets/:id/publish`
- `GET /api/public/media`
