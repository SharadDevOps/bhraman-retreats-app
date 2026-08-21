# Homepage & Experience Architecture Skill

## 1. Overview
The homepage (`src/app/page.tsx`) is a server component that presents the full 12-stage elemental journey of Bhraman Retreats.

## 2. 12-Page Section Breakdown

The homepage is modularized into 12 dedicated section skills:

| Page / Section | Name | Anchor ID | Skill Reference |
|---|---|---|---|
| **Page 1** | Remember your natural rhythm | `#top` | [page-1/SKILL.md](page-1/SKILL.md) |
| **Page 2** | Nature is not the backdrop, Nature is the medicine | `#philosophy` | [page-2/SKILL.md](page-2/SKILL.md) |
| **Page 3** | Five pathways back to balance | `#elements` | [page-3/SKILL.md](page-3/SKILL.md) |
| **Page 4** | A slower way to travel within | `#experience` | [page-4/SKILL.md](page-4/SKILL.md) |
| **Page 5** | Ladakh Edition 2.0 | `#retreat` | [page-5/SKILL.md](page-5/SKILL.md) |
| **Page 6** | Rooted in medicine, Guided by nature | `#founder` | [page-6/SKILL.md](page-6/SKILL.md) |
| **Page 7** | A journey that unfolds slowly | `#itinerary` | [page-7/SKILL.md](page-7/SKILL.md) |
| **Page 8** | Moments carried home | `#memories` | [page-8/SKILL.md](page-8/SKILL.md) |
| **Page 9** | What guests carry home | `#testimonials` | [page-9/SKILL.md](page-9/SKILL.md) |
| **Page 10** | Thoughts for the journey within | `#journal` | [page-10/SKILL.md](page-10/SKILL.md) |
| **Page 11** | Your next journey starts here | `#enquiry` | [page-11/SKILL.md](page-11/SKILL.md) |
| **Page 12** | Site Footer | `footer` | [page-12/SKILL.md](page-12/SKILL.md) |

## 3. Data Flow & Rendering
- Loaded via `getHomepageData(origin)` in `src/lib/content.ts`.
- Structured fallback system in `defaultHomeContent` handles partial network or database downtime.
