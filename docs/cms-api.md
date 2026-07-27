# Bhraman CMS API

Phase 2 uses the existing Next.js route-handler, PostgreSQL and Prisma stack.
JSON API responses use one shared envelope.

## Response format

Success:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": {
      "fields": {
        "slug": "Use lowercase letters, numbers and single hyphens only."
      }
    }
  }
}
```

Expected status codes are `200`, `201`, `401`, `403`, `404`, `409`, `422`
and `500`. Internal exception data and environment values are never returned.

## Public endpoints

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/api/public/retreats` | Published retreats; paginated |
| GET | `/api/public/retreats/featured` | Earliest eligible future retreat by date |
| GET | `/api/public/retreats/:slug` | Published retreat with structured itinerary |
| GET | `/api/public/testimonials` | Published testimonials |
| GET | `/api/public/blogs` | Published blog summaries |
| GET | `/api/public/blogs/:slug` | Published blog content |
| GET | `/api/public/founder` | Current published founder profile |
| GET | `/api/public/quotes` | Published quotes |
| GET | `/api/public/site-settings` | Published, non-sensitive settings |
| POST | `/api/public/enquiries` | Creates an enquiry with status `NEW` |

List endpoints support:

- `page` — positive integer, default `1`
- `pageSize` — `1` to `100`, default `20`
- `sort` — endpoint-specific allow-listed field
- `order` — `asc` or `desc`
- `status` — exact status filter where supported
- `search` — case-insensitive title/location/content search where supported

### Public retreat example

```http
GET /api/public/retreats?page=1&pageSize=10&status=booking_open&sort=startDate&order=asc
```

```json
{
  "data": [
    {
      "slug": "ladakh-edition-2-sep-2026",
      "title": "Ladakh Edition 2.0",
      "location": "Sham Valley, Ladakh",
      "startDate": "2026-09-12T00:00:00.000Z",
      "endDate": "2026-09-16T00:00:00.000Z",
      "status": "BOOKING_OPEN",
      "highlight": "Stay at Lamayuru Monastery"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Enquiry example

```http
POST /api/public/enquiries
Content-Type: application/json
```

```json
{
  "name": "A Guest",
  "email": "guest@example.com",
  "phone": "+91 98765 43210",
  "retreatSlug": "ladakh-edition-2-sep-2026",
  "message": "Please share room and arrival details.",
  "source": "website"
}
```

```json
{
  "data": {
    "id": "cm...",
    "status": "NEW",
    "createdAt": "2026-07-28T00:00:00.000Z"
  }
}
```

## Admin authentication and roles

Admin endpoints require the existing signed, HTTP-only `bhraman_admin` cookie.
The password login creates a `SUPER_ADMIN` session. The token format now
contains a signed role while accepting existing valid admin sessions during
the migration period.

Role policy:

| Role | Access |
| --- | --- |
| `CONTENT_EDITOR` | Content models, retreats, itinerary and media |
| `BOOKING_MANAGER` | Enquiries and existing booking operations |
| `SUPER_ADMIN` | All CMS and enquiry operations |

Unauthenticated requests return `401`; authenticated roles outside the entity
policy return `403`.

## Admin CRUD endpoints

All editable models use:

```text
GET    /api/admin/cms/:entity
POST   /api/admin/cms/:entity
GET    /api/admin/cms/:entity/:id
PATCH  /api/admin/cms/:entity/:id
DELETE /api/admin/cms/:entity/:id
```

Supported entity keys:

- `retreats`
- `retreat-days`
- `itinerary-sections`
- `itinerary-activities`
- `testimonials`
- `blogs`
- `founders`
- `quotes`
- `media-assets`
- `site-settings`
- `enquiries`

Admin lists support the public pagination parameters plus:

- `parentId` for retreat days, sections, activities and enquiries
- `publicationStatus` for retreat publication filtering

### Create a blog draft

```http
POST /api/admin/cms/blogs
Content-Type: application/json
Cookie: bhraman_admin=<signed-token>
```

```json
{
  "slug": "why-choose-bhraman-retreats",
  "title": "Why Choose Bhraman Retreats?",
  "excerpt": "A considered approach to elemental wellbeing.",
  "content": "<p>Editorial content...</p>",
  "authorName": "Bhraman Retreats",
  "publicationStatus": "DRAFT"
}
```

### Publish workflow

```http
POST /api/admin/cms/blogs/:id/publish
Content-Type: application/json
Cookie: bhraman_admin=<signed-token>
```

```json
{ "action": "publish" }
```

Actions are `publish`, `draft` and `archive`. Publishing records an audit
timestamp on models that support `publishedAt`.

### Transactional itinerary replacement

```http
PUT /api/admin/cms/retreats/:id/itinerary
Content-Type: application/json
Cookie: bhraman_admin=<signed-token>
```

```json
{
  "days": [
    {
      "dayNumber": 1,
      "element": "Earth",
      "title": "Ground & arrive",
      "description": "Arrive gently and reconnect with the body.",
      "publicationStatus": "PUBLISHED",
      "sections": [
        {
          "title": "Earth practices",
          "sortOrder": 1,
          "publicationStatus": "PUBLISHED",
          "activities": [
            {
              "title": "Opening circle",
              "sortOrder": 1,
              "publicationStatus": "PUBLISHED"
            }
          ]
        }
      ]
    }
  ]
}
```

The complete itinerary is validated before a Prisma transaction replaces the
existing day tree. Any failure rolls back the entire replacement.

## Validation and content safety

- Slugs are globally unique per model and use lowercase kebab-case.
- Sort fields are allow-listed; arbitrary database fields cannot be injected.
- Page size is capped at 100.
- Lifecycle and retreat statuses are allow-listed.
- End dates cannot precede start dates.
- Public enquiry email and required fields are validated.
- Rich content removes executable tags, inline event handlers and JavaScript
  URLs before storage.
- Site-setting keys that resemble credentials or secrets are rejected and
  suppressed from API output.

## Preserved legacy routes

The following existing routes remain available:

- `/api/bookings`
- `/api/admin/bookings`
- `/api/admin/content`
- `/api/admin/login`
- `/api/admin/upload`

The legacy content and upload routes now write testimonials and media slots to
the structured CMS models. No route was removed.
