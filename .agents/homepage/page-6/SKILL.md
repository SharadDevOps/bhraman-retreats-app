# Homepage Section: Page 6 — Rooted in Medicine, Guided by Nature

## 1. Overview
Page 6 (`<section className="founder-section" id="founder">`) introduces the retreat founder and medical/ayurvedic practitioner.

## 2. Key Components & Structure
- **Ambient Effect**: `Fireflies` canvas animation with gentle flickering particles.
- **Copy Column (`.founder-copy`)**:
  - Sparkle icon and Section Label (`founderLabel`).
  - Editorial Heading (`founderTitle` / `founderEmphasis`).
  - `QuoteBlock`: Founder philosophy quote with attribution.
  - Guide Credentials: Founder name, title, and "Begin your journey" button.
- **Portrait Column (`.founder-image`)**:
  - `ResponsiveMedia` rendering founder portrait (`founder.imageUrl` or slot `mediaSlots.founder`).

## 3. Data & CMS Fields
- `founderLabel`: "Meet your guide"
- `founderTitle`: "Rooted in medicine."
- `founderEmphasis`: "Guided by nature."
- API: `/api/public/founder` returning `name`, `title`, `bio`, `imageUrl`.
