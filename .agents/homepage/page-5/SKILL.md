# Homepage Section: Page 5 — Ladakh Edition 2.0 (Featured Retreat)

## 1. Overview
Page 5 (`<section className="retreat-section" id="retreat">`) highlights the primary featured journey currently open for bookings.

## 2. Key Components & Implementation
- **Retreat Visual (`.retreat-art`)**:
  - `ResponsiveMedia`: Full-cover image with high fetch priority (`retreat.heroImageUrl` or slot `mediaSlots.retreat`).
  - `RetreatDateBadge`: Prominent calendar badge displaying retreat start and end dates (e.g. `12—16 SEPT 2026`).
- **Retreat Details (`.retreat-copy`)**:
  - Section Label & Editorial Heading (`retreat.title`).
  - Lead summary & highlight badge (`Highlight · Lamayuru Monastery & Sham Valley`).
  - Meta details: Location (`MapPin`) & formatted date range (`CalendarDays`).
  - Pricing row: Formatted price in Indian Rupees from `priceInPaise / 100` (e.g. `₹29,999 / person`).
  - Action buttons: "Enquire about this retreat" (`#enquiry`) and "See all upcoming retreats" (`/upcoming-retreats`).

## 3. Data Sources
- Loaded via `GET /api/public/retreats/featured` and database table `Retreat`.
- If no retreat is published, renders graceful empty-state notification with enquiry signup.
