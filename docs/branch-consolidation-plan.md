# Branch Consolidation Plan

This is a manual migration plan only. Phase 0 does not merge, commit, switch, reset, or modify branches.

## Source baselines

- Current merged/client-visible source: `origin/main` at `0086eff`.
- Newer feature source: `feature/phase2` working tree.
- `feature/phase2` currently points to `02b9131`; its Phase 2 work is not represented by a separate commit.

Before any future consolidation, the team should create an explicit reviewable commit for the Phase 2 working tree or otherwise preserve a patch. No branch operation is performed by this audit.

## Exact components and sections to retain

### Retain from newer feature phase

1. **Hero**
   - `src/components/cinematic-hero.tsx`
   - `CinematicHero` usage in `src/app/page.tsx`
   - Phase 2 cinematic CSS block in `src/app/globals.css`
   - `public/hero-himalayan-dawn.png`
   - Shared `Navigation`
   - Hero preload in `src/app/layout.tsx`, subject to performance review

2. **Philosophy**
   - `.manifesto` / `#philosophy` section from the Phase 2 `src/app/page.tsx`.
   - The markup is currently identical to `origin/main`; retain the approved Phase 2 source attribution without rewriting it.

3. **Phase 2 metadata, conditionally**
   - Dynamic absolute Open Graph/Twitter metadata.
   - `public/og.png`.
   - Retain only after verifying host/proxy behavior in Azure and social-card file size.

### Retain from current development version

1. **Five Elements**
   - `.elements-section` markup from `origin/main:src/app/page.tsx`.
   - `elements` from `origin/main:src/data/retreat.ts`.
   - `.element-*` styles from the merged stylesheet.

2. **Meet Your Guide**
   - `.founder-section` markup from `origin/main:src/app/page.tsx`.
   - `Fireflies` from `src/components/nature-effects.tsx`.
   - Existing founder media-slot behavior.

3. **Itinerary**
   - `src/components/itinerary.tsx`.
   - `itinerary` from `src/data/retreat.ts`.
   - Existing itinerary wrapper and styles.

4. **Booking/enquiry, temporarily**
   - Preserve `BookingForm` and `/api/bookings` unchanged until the separately approved redesign.
   - Preserve all persistence/status behavior during visual consolidation.

### Footer

Both compared versions currently use identical footer markup. There are not yet two distinct implementations to combine.

Future footer work should:

- preserve the brand ethos line and useful internal links;
- replace `href="#"` placeholders only after destinations are approved;
- use a shared brand-mark component when refactoring is authorized;
- avoid changing footer behavior during hero/section consolidation.

## Conflicting files

| File | Conflict |
|---|---|
| `src/app/page.tsx` | Inline merged hero/imports versus `CinematicHero` |
| `src/app/globals.css` | Original hero rules coexist with a later Phase 2 `.hero` override block |
| `src/app/layout.tsx` | Static metadata versus request-derived metadata, OG image, and preload |
| `src/components/nature-effects.tsx` | No textual conflict, but `HeroNature` becomes unused |
| `src/lib/content.ts` | Dormant `media.hero` concept conflicts with static Phase 2 hero ownership |
| `src/app/api/admin/upload/route.ts` | Accepts hero slot despite no active consumer/admin control |
| `prisma/schema.prisma` | `Retreat.heroImageUrl` overlaps other hero-media concepts |

## Recommended manual migration order

1. **Freeze review inputs**
   - Record `origin/main` commit.
   - Preserve the Phase 2 working-tree patch/commit.
   - Capture current database content separately; code fallback and deployed content may differ.

2. **Create a dedicated consolidation branch**
   - Branch from the latest reviewed `origin/main`.
   - Do not work directly on `main`.
   - Do not merge Phase 2 wholesale.

3. **Migrate the hero as an isolated change**
   - Add `CinematicHero` and its image.
   - Replace only the inline hero block/imports in `page.tsx`.
   - Keep all later homepage sections byte-for-byte equivalent to the approved sources.

4. **Reconcile hero CSS**
   - Copy only Phase 2 rules required by `CinematicHero`.
   - Initially keep old hero CSS for one rollback-friendly commit.
   - After parity tests pass, remove confirmed-unused wheel/orbit/leaf/mist rules in a separate commit.
   - Do not remove `Fireflies` or founder animation CSS.

5. **Lock the Philosophy section**
   - Confirm the Phase 2 manifesto markup/copy.
   - Do not combine or rewrite it while migrating the hero.

6. **Restore current-development sections explicitly**
   - Five Elements markup/data.
   - Upcoming Retreat behavior.
   - Itinerary component/data.
   - Meet Your Guide markup/Fireflies/media.
   - Testimonials behavior.
   - Booking form/API.

7. **Handle metadata separately**
   - Add OG image/metadata in its own reviewable change.
   - Verify forwarded host/protocol handling under Azure.
   - Optimize the OG image without changing its approved design.

8. **Resolve dormant hero-media concepts later**
   - Product decision required: static asset, `mediaSlots.hero`, or `Retreat.heroImageUrl`.
   - Do not delete schema/API fields until the selected source of truth is approved and data is migrated.

9. **Footer pass**
   - Perform only after the homepage sections are stable.
   - Resolve Instagram and Contact destinations.
   - Extract shared branding only when refactoring is authorized.

10. **Booking/enquiry redesign**
   - Treat as a separate phase with API/data requirements.
   - Do not mix it into visual branch consolidation.

## Rollback steps

### Code rollback

1. Keep hero migration, CSS cleanup, metadata, and footer work as separate commits.
2. If the cinematic hero fails, revert only the hero commit.
3. Restore:
   - baseline inline hero JSX/imports in `page.tsx`;
   - `HeroNature` rendering;
   - baseline hero CSS;
   - static layout metadata.
4. Leave database models/content untouched; the hero migration requires no schema migration.

### Asset rollback

- Remove Phase 2 hero/OG references by reverting their dedicated commits.
- Do not delete deployed Blob assets during a code rollback.

### Deployment rollback

- Use the last known-good commit/container SHA through the existing approved deployment process.
- Do not alter GitHub workflows, Azure resources, Terraform ownership, or branch protection.
- Deployment execution requires separate authorization; this audit performs none.

## Testing requirements

### Build and static checks

- Install with the committed pnpm lockfile.
- Prisma client generation.
- TypeScript/Next production build in the repository’s Node 22 container environment.
- Confirm no deployment-file diff.

### Section-source checks

- Hero and Philosophy match the newer approved source.
- Five Elements, Meet Your Guide, and Itinerary match current development.
- Booking/API behavior is unchanged.
- Testimonials remain conditional.
- Footer changes are reviewed separately.

### Responsive checks

- Desktop: 1440×900 and 1920×1080.
- Tablet: 768×1024 and 1024×768.
- Mobile: 360×800, 390×844, and a short landscape viewport.
- Verify menu, stacked sections, element cards, itinerary overflow, forms, and footer.

### Hero behavior checks

- Full intro order and timing.
- Skip Intro at every stage.
- Sound on/off and browser autoplay restrictions.
- Reduced-motion mode.
- Background tab pause/resume.
- Resize/orientation change.
- Keyboard-only operation.
- Low-end mobile performance profile; target stable frames without long tasks.

### Accessibility checks

- Automated axe/Lighthouse scan.
- Keyboard navigation and visible focus.
- Screen-reader landmarks/headings.
- Menu expanded state and dismissal.
- Proper tab keyboard semantics.
- Colour contrast.
- No content inaccessible during/after intro.

### Content/data checks

- Database available, empty, and unavailable fallback scenarios.
- Malformed `SiteContent` JSON behavior.
- Retreat/founder media present and absent.
- Testimonials empty and populated.
- Dates/prices displayed from DB overrides.

### Backend regression checks

- Booking PENDING and WAITLISTED paths.
- Validation errors.
- Admin login/logout.
- Retreat/testimonial edits.
- Local and Azure image upload paths.
- Booking status/payment updates.

### Azure smoke checks

- Container starts on port 8080.
- Forwarded host/protocol metadata produces valid absolute URLs.
- Blob images load.
- PostgreSQL connectivity and migrations succeed.
- Existing GitHub deployment behavior remains unchanged.

