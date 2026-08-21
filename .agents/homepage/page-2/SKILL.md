# Homepage Section: Page 2 — Nature Is Not the Backdrop, Nature Is the Medicine

## 1. Overview
Page 2 (`<section className="manifesto section" id="philosophy">`) articulates the core ethos: nature is not merely scenery, but the primary medicine through the Panch Mahābhūta (five elements).

## 2. Key Components & Implementation
- **Left Column**:
  - **With Image**: `<div className="manifesto-art">` rendering the custom image from slot `mediaSlots["bg.philosophy"]` (e.g. `images/background/philosophy.jpeg`).
  - **Fallback**: `<SectionLabel>{content.philosophyLabel}</SectionLabel>` and botanical mark `<span className="botanical">❦</span>`.
- **Right Column**:
  - Heading: `<EditorialHeading>{content.philosophyTitle}<br /><em>{content.philosophyEmphasis}</em></EditorialHeading>`.
  - Content: `PhilosophyParagraphs` (`src/components/philosophy-paragraphs.tsx`) rendering primary lead reflection and expandable secondary paragraph via luxury micro-pill toggle (`Show less / Read more`).
  - CTA: `<SecondaryButton href="#elements" showArrow>{content.philosophyCta}</SecondaryButton>`.

## 3. Data & CMS Fields (`home.content`)
- `philosophyLabel`: "The Bhraman way"
- `philosophyTitle`: "Nature is not the backdrop."
- `philosophyEmphasis`: "Nature is the medicine."
- `philosophyParagraphs`: Array of 2 paragraphs detailing elemental therapy, natural rhythm, and the 5-day devotion to elements.
- `philosophyCta`: "Walk through the five elements" (`#elements`)
- `mediaSlots["bg.philosophy"]`: Configurable via Admin Media slot manager.

## 4. Design & Styling
- Two-column grid (`.manifesto { grid-template-columns: .7fr 1.8fr; }`) with radial paper gradient.
- Smooth CSS grid transition (`grid-template-rows: 0fr -> 1fr`) on accordion expansion.
