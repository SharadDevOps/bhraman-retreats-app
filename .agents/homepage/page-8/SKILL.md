# Homepage Section: Page 8 — Moments Carried Home

## 1. Overview
Page 8 (`<section className="memories-section section" id="memories">`) showcases authentic moments and participant photographs from past editions.

## 2. Key Components & Structure
- **Section Heading**: Label (`memoriesLabel`), Title (`memoriesTitle`), and descriptive copy.
- **Memory Grid (`.memory-grid`)**: Responsive grid displaying curated image assets from approved folders (`retreats/ladakh-edition-1/gallery`, `retreats/ladakh-edition-1/participants`, `retreats/ladakh-edition-1/monastery`).

## 3. Data & Media Sourcing
- Extracted from `data.media` via `mediaIn(media, [...])`.
- Fallbacks render an empty-state notice if media assets are pending review.
