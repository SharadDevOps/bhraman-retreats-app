# Client Requirements Lock — Phase 0

Status: locked for consolidation planning  
Date: 27 July 2026

## Phase 0 objective

Audit and document the existing application and both frontend versions. No redesign or application-behavior change is authorized.

## Authoritative section sources

| Section | Locked source |
|---|---|
| Hero | Newer feature phase version |
| Philosophy | Newer feature phase version |
| Five Elements cards | Current development/client-visible version |
| Meet Your Guide | Current development/client-visible version |
| Itinerary | Current development/client-visible version |
| Booking/enquiry | Preserve for now; redesign in a later phase |
| Footer | Combine strongest parts only after audit/review |

Audit interpretation:

- Current development/client-visible version = `origin/main` at `0086eff`.
- Newer feature phase version = `feature/phase2` working tree.
- Philosophy, Five Elements, Meet Your Guide, Itinerary, Booking, and footer are currently identical across the compared implementations; the source lock still governs future edits.

## Explicit prohibitions

- Do not modify GitHub deployment workflows.
- Do not modify Azure resources or configuration.
- Do not modify Terraform/infrastructure ownership.
- Do not modify branch protection.
- Do not merge branches.
- Do not redesign the website in Phase 0.
- Do not change application behavior.
- Do not change booking, payment, admin, storage, or database behavior.
- Do not remove “forest” terminology without separate approval.
- Do not treat reference-document claims as approved website copy.

## Required Phase 0 deliverables

- `docs/current-architecture.md`
- `docs/frontend-component-map.md`
- `docs/backend-api-map.md`
- `docs/content-inventory.md`
- `docs/media-inventory.md`
- `docs/branch-consolidation-plan.md`
- `docs/client-requirements-lock.md`

## Content facts requiring future client confirmation

1. Whether “Forest Edition” remains the active edition name.
2. Whether all user-visible “forest” phrases should remain.
3. Confirmation of dates: 22–26 December 2026.
4. Confirmation of location wording: Van Tarang, Rajaji National Park/Uttarakhand.
5. Confirmation of price: ₹29,999 per person.
6. Confirmation of capacity: 12.
7. Approved founder biography, credentials, experience-duration claims, and quote.
8. Approved payment instructions; current values are placeholders.
9. Whether the future form is a booking, an enquiry, or a staged enquiry-to-booking flow.
10. Approved Instagram and Contact destinations.
11. Whether testimonials exist and have publication consent.
12. Whether medical/wellness outcome claims in source documents are approved for public use.

## Technical decisions requiring future approval

1. Hero media source of truth:
   - static bundled hero;
   - CMS `mediaSlots.hero`;
   - `Retreat.heroImageUrl`.
2. Whether to keep the full cinematic intro on every visit or remember completion.
3. Performance budget for hero images, particles, and animation duration.
4. Whether to migrate itinerary content into the existing `ItineraryDay` model.
5. Whether to introduce a shared logo/brand component.
6. Whether to remove dormant hero effects only after rollback coverage is established.
7. Whether to add blog/video features; neither exists today.

## Acceptance boundary for the next implementation phase

Any consolidation implementation must:

- preserve the locked section sources;
- keep booking/admin/API behavior unchanged unless separately approved;
- isolate hero changes from content and backend changes;
- include responsive, accessibility, content-fallback, and Azure-container regression testing;
- remain reviewable without merging directly into protected branches.

