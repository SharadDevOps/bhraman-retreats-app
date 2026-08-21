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
| **Homepage & Experience** | Public homepage, hero sequence, five elements grid, breathing & intention modules | [.agents/homepage/SKILL.md](.agents/homepage/SKILL.md) | [.claude/homepage/SKILL.md](.claude/homepage/SKILL.md) | [.codex/homepage/SKILL.md](.codex/homepage/SKILL.md) |
| **Admin & CMS** | Authentication, settings editor, testimonials, retreat manager, media slot publishing | [.agents/admin-cms/SKILL.md](.agents/admin-cms/SKILL.md) | [.claude/admin-cms/SKILL.md](.claude/admin-cms/SKILL.md) | [.codex/admin-cms/SKILL.md](.codex/admin-cms/SKILL.md) |
| **Media Management** | Azure Blob Storage integration, upload authorization, taxonomy whitelisting | [.agents/media-management/SKILL.md](.agents/media-management/SKILL.md) | [.claude/media-management/SKILL.md](.claude/media-management/SKILL.md) | [.codex/media-management/SKILL.md](.codex/media-management/SKILL.md) |
| **Retreats & Booking** | Retreat catalog, itinerary day/section/activity hierarchy, bookings and enquiries | [.agents/retreats-booking/SKILL.md](.agents/retreats-booking/SKILL.md) | [.claude/retreats-booking/SKILL.md](.claude/retreats-booking/SKILL.md) | [.codex/retreats-booking/SKILL.md](.codex/retreats-booking/SKILL.md) |
| **Deployment & DevOps** | Azure App Service, Docker containerization, PostgreSQL Flexible Server, CI/CD | [.agents/deployment-devops/SKILL.md](.agents/deployment-devops/SKILL.md) | [.claude/deployment-devops/SKILL.md](.claude/deployment-devops/SKILL.md) | [.codex/deployment-devops/SKILL.md](.codex/deployment-devops/SKILL.md) |
| **Design System** | Cormorant & DM Sans typography, palette variables, micro-interactions, accessibility | [.agents/design-system/SKILL.md](.agents/design-system/SKILL.md) | [.claude/design-system/SKILL.md](.claude/design-system/SKILL.md) | [.codex/design-system/SKILL.md](.codex/design-system/SKILL.md) |

---

## 3. High-Priority Architectural Rules
1. **App Service Startup**: `appCommandLine` on Azure Linux Container WebApp must remain empty `""` to allow container native CMD execution.
2. **Postgres Connection Strings**: `DATABASE_URL` passwords containing special characters (e.g. `@`, `$`) must be URL-encoded (`%40`, `%24`).
3. **Media Taxonomy**: All upload destinations must be explicitly listed in `MEDIA_FOLDERS` in `src/lib/media-validation.mjs` and `SITE_SLOTS` in `src/app/api/admin/media/assets/[id]/publish/route.ts`.
4. **Editorial Design**: Maintain the luxury spiritual brand tone, serif headings (`--font-display`), and sans-serif body (`--font-sans`).
