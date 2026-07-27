# Phase 1 replacement report

Date: 28 July 2026  
Implementation branch: `feature/phase3`

## Scope completed

- Preserved the Phase 0-approved homepage layouts.
- Introduced a muted elemental palette and reusable design tokens for colour,
  typography, spacing, widths, borders, shadows, radii, durations and
  responsive breakpoints.
- Added reusable brand and editorial UI components.
- Replaced the legacy glyph logo treatment with a configurable Bhraman logo
  component.
- Made the guide image configurable through the existing media content slot,
  with `FOUNDER_IMAGE_URL` as an environment fallback.
- Added the approved Ladakh and Uttarakhand retreat content.
- Replaced fixed featured-retreat behaviour with chronological, date-driven
  selection.
- Updated the social preview to the Phase 1 nature palette.

## Asset configuration

The supplied Bhraman logo files and final guide photograph were not present in
the repository during implementation. No substitute client logo or founder
portrait was fabricated.

Configure:

- `NEXT_PUBLIC_BHRAMAN_LOGO_URL`
- `NEXT_PUBLIC_BHRAMAN_LOGO_LIGHT_URL`
- `FOUNDER_IMAGE_URL`

The logo component displays a restrained Bhraman text fallback until its asset
URLs are configured. The guide and retreat media slots display labelled
placeholders until configured through the admin media settings or environment.

## Retreat selection

The retreat catalog contains:

1. Ladakh Edition 2.0 — Sham Valley, Ladakh — 12–16 September 2026 — highlight:
   Stay at Lamayuru Monastery.
2. Uttarakhand Retreat — 25–29 December 2026.

The homepage, admin content endpoint and booking endpoint select the earliest
retreat whose end date has not passed. If every retreat has passed, the most
recent retreat is selected. There is no hardcoded `featured` flag or featured
slug.

## Terminology replacement

User-visible replacements:

- “forest bathing” → “barefoot nature walks”
- “forest walk” → “herb walk”
- “forest” journey language → contextual “Bhraman journey” language

Verification: case-insensitive search across `src`, `public` and `prisma`
returned zero runtime occurrences of `forest`. Historical Phase 0 audit
documents and database records were not blindly rewritten.

## Validation

- TypeScript: passed with `tsc --noEmit`.
- Production build: passed with Next.js 15.5.20 using an isolated build output
  directory because the normal `.next` directory contained development-server
  cache files.
- Browser console: zero warnings or errors during homepage review.
- Responsive checks: passed at 375, 768, 1024 and 1440 pixels with no
  horizontal overflow.
- `git diff --check`: passed; line-ending notices only.

## Manual approval required

- Confirm the final light and dark logo assets after their URLs are supplied.
- Confirm the final Meet Your Guide photograph and crop.
- Confirm the final retreat photograph and crop.
- Confirm the generated Phase 1 social preview artwork.

Reference screenshots are in `docs/screenshots/`.

## Protected infrastructure

No Azure resources, container files, GitHub Actions workflows, deployment
configuration, branch protection or branch strategy files were changed.
