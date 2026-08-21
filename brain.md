# Bhraman Retreats — Project Brain Architecture

Welcome to the central intelligence and architectural map for **Bhraman Retreats**.

---

## 1. Project Overview
Bhraman Retreats is a luxury, elemental therapy wellness platform built for Himalayan spiritual and restorative journeys.

- **Production / Dev Host**: [https://app-bhr-ret-dev-cin.azurewebsites.net](https://app-bhr-ret-dev-cin.azurewebsites.net)
- **Frontend Stack**: Next.js 15 (App Router), React 19, TypeScript
- **Styling Architecture**: Handcrafted pure CSS (`src/app/globals.css`), CSS variables, Lucide icons
- **Database & ORM**: PostgreSQL Flexible Server (Azure) & SQLite (Local), Prisma ORM
- **Media Management**: Azure Blob Storage (`@azure/storage-blob`) with SAS authorization & strict taxonomy
- **Infrastructure**: Azure Linux App Service, Docker, Azure Container Registry, Terraform

---

## 2. Core Modules & Agent Skills Directory

All domain intelligence and system operations are documented in modular agent skills under `.agents/` and referenced by `.claude/` and `.codex/`.

| Module | Purpose | Skill Definition (Source of Truth) | Claude Link | Codex Link |
|---|---|---|---|---|
| **Homepage & Experience** | Master homepage documentation (with 12 sub-page skills) | [.agents/homepage/SKILL.md](.agents/homepage/SKILL.md) | [.claude/homepage/SKILL.md](.claude/homepage/SKILL.md) | [.codex/homepage/SKILL.md](.codex/homepage/SKILL.md) |
| **Admin & CMS** | Authentication, settings editor, testimonials, retreat manager, media slot publishing | [.agents/admin-cms/SKILL.md](.agents/admin-cms/SKILL.md) | [.claude/admin-cms/SKILL.md](.claude/admin-cms/SKILL.md) | [.codex/admin-cms/SKILL.md](.codex/admin-cms/SKILL.md) |
| **Media Management** | Azure Blob Storage integration, upload authorization, taxonomy whitelisting | [.agents/media-management/SKILL.md](.agents/media-management/SKILL.md) | [.claude/media-management/SKILL.md](.claude/media-management/SKILL.md) | [.codex/media-management/SKILL.md](.codex/media-management/SKILL.md) |
| **Retreats & Booking** | Retreat catalog, itinerary day/section/activity hierarchy, bookings and enquiries | [.agents/retreats-booking/SKILL.md](.agents/retreats-booking/SKILL.md) | [.claude/retreats-booking/SKILL.md](.claude/retreats-booking/SKILL.md) | [.codex/retreats-booking/SKILL.md](.codex/retreats-booking/SKILL.md) |
| **Deployment & DevOps** | Azure App Service, Docker containerization, PostgreSQL Flexible Server, CI/CD | [.agents/deployment-devops/SKILL.md](.agents/deployment-devops/SKILL.md) | [.claude/deployment-devops/SKILL.md](.claude/deployment-devops/SKILL.md) | [.codex/deployment-devops/SKILL.md](.codex/deployment-devops/SKILL.md) |
| **Design System** | Cormorant & DM Sans typography, palette variables, micro-interactions, accessibility | [.agents/design-system/SKILL.md](.agents/design-system/SKILL.md) | [.claude/design-system/SKILL.md](.claude/design-system/SKILL.md) | [.codex/design-system/SKILL.md](.codex/design-system/SKILL.md) |

---

## 3. Homepage 12-Page Section Architecture

| Page | Section Name | Description & Key Features | Section Skill |
|---|---|---|---|
| **Page 1** | Remember your natural rhythm | Cinematic hero sequence, ambient sound toggle, skip intro, scroll cue | [.agents/homepage/page-1/SKILL.md](.agents/homepage/page-1/SKILL.md) |
| **Page 2** | Nature is not the backdrop, Nature is the medicine | Philosophy manifesto, left media slot (`manifesto-art`), expandable reflection | [.agents/homepage/page-2/SKILL.md](.agents/homepage/page-2/SKILL.md) |
| **Page 3** | Five pathways back to balance | Panch Mahābhūta five elements grid & practice details | [.agents/homepage/page-3/SKILL.md](.agents/homepage/page-3/SKILL.md) |
| **Page 4** | A slower way to travel within | Interactive 1-min breathing, intention picker, questions, daily pause | [.agents/homepage/page-4/SKILL.md](.agents/homepage/page-4/SKILL.md) |
| **Page 5** | Ladakh Edition 2.0 | Featured retreat showcase, calendar date badge, pricing in paise | [.agents/homepage/page-5/SKILL.md](.agents/homepage/page-5/SKILL.md) |
| **Page 6** | Rooted in medicine, Guided by nature | Founder profile, fireflies particle effect, guide bio & portrait | [.agents/homepage/page-6/SKILL.md](.agents/homepage/page-6/SKILL.md) |
| **Page 7** | A journey that unfolds slowly | Five-day elemental itinerary tabs & practice rhythm | [.agents/homepage/page-7/SKILL.md](.agents/homepage/page-7/SKILL.md) |
| **Page 8** | Moments carried home | Authentic memory photographs & previous edition gallery | [.agents/homepage/page-8/SKILL.md](.agents/homepage/page-8/SKILL.md) |
| **Page 9** | What guests carry home | Guest reflections, testimonials card grid, video reflections | [.agents/homepage/page-9/SKILL.md](.agents/homepage/page-9/SKILL.md) |
| **Page 10** | Thoughts for the journey within | Featured journal & mindful travel blog preview | [.agents/homepage/page-10/SKILL.md](.agents/homepage/page-10/SKILL.md) |
| **Page 11** | Your next journey starts here | Closing reservation enquiry form & validation pipeline | [.agents/homepage/page-11/SKILL.md](.agents/homepage/page-11/SKILL.md) |
| **Page 12** | Site Footer | Brand logo light, elemental tagline, anchor navigation & copyright | [.agents/homepage/page-12/SKILL.md](.agents/homepage/page-12/SKILL.md) |

---

## 4. High-Priority Architectural Rules
1. **App Service Startup**: `appCommandLine` on Azure Linux Container WebApp must remain empty `""` to allow container native CMD execution.
2. **Postgres Connection Strings**: `DATABASE_URL` passwords containing special characters (e.g. `@`, `$`) must be URL-encoded (`%40`, `%24`).
3. **Media Taxonomy**: All upload destinations must be explicitly listed in `MEDIA_FOLDERS` in `src/lib/media-validation.mjs` and `SITE_SLOTS` in `src/app/api/admin/media/assets/[id]/publish/route.ts`.
4. **Editorial Design**: Maintain the luxury spiritual brand tone, serif headings (`--font-display`), and sans-serif body (`--font-sans`).
