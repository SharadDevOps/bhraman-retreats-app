# CMS migration and rollback

## Migration

Migration directory:

`prisma/migrations/20260728003000_cms_foundation/`

Apply in the normal release process:

```powershell
pnpm prisma migrate deploy
pnpm db:seed
```

The migration:

1. Separates retreat lifecycle status from publication status.
2. Renames `ItineraryDay` to `RetreatDay` while retaining existing rows.
3. Adds structured itinerary sections and activities.
4. Adds testimonials, blogs, founder profiles, quotes, settings and enquiries.
5. Extends media assets with editorial and publication fields.
6. Adds audit timestamps, uniqueness constraints and query indexes.

Existing `User`, `Booking`, `SiteContent`, `Retreat` and `MediaAsset` records
are retained. `SiteContent` remains temporarily for backward compatibility but
new content writes use structured models.

## Rollback

The rollback is intentionally manual because it removes CMS-only records:

```powershell
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f prisma/migrations/20260728003000_cms_foundation/rollback.sql
```

Before rollback:

1. Stop application writes.
2. Take a PostgreSQL backup.
3. Export CMS-only content if it must be retained.
4. Run `rollback.sql`.
5. Redeploy the application version preceding this migration.

The rollback restores the `ItineraryDay` table and original retreat status
shape. Structured sections, activities, testimonials, blogs, founder profiles,
quotes, settings and enquiries are removed.

## Seed assumptions

- Dates use the year 2026, matching the approved Phase 1 catalog.
- The Uttarakhand location is provisionally `Uttarakhand, India`; the client
  has not supplied a more specific venue.
- The same approved five-element itinerary is attached to both initial
  retreats until edition-specific schedules are supplied.
- The founder profile remains a draft placeholder and is not exposed by the
  public founder endpoint until approved and published.
- The blog post remains a draft.
- Existing Phase 1 pricing and capacity are retained as provisional values:
  ₹29,999 per person and 12 guests.
