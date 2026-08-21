# Homepage Section: Page 2 — Elemental Therapy: Healing Through the 5 Great Elements

## 1. Overview
Page 2 (`<section className="manifesto section" id="philosophy">`) presents the elemental healing philosophy of Bhraman Retreats, connecting mind, body, and spirit directly to the Panch Mahābhūta.

## 2. Key Components & Implementation
- **Title**: `ELEMENTAL THERAPY` (uppercase, `clamp(52px, 6.2vw, 94px)`, `color: #e27c39`, `--font-display`).
- **Tagline of Title**: `Healing through the 5 great elements` (rendered with `.manifesto-tagline`, `font-size: 0.5em`, `font-style: italic`, `color: #e27c39`).
- **First Paragraph** (`font: 400 21px/1.7 var(--font-display)`, color: `var(--mud)`):
  > *"In the heart of the Himalayas, every sound of the forest, every breath of air, and every grain of soil whispers an ancient truth — that all life arises from the Panch Mahābhūta: Earth, Water, Fire, Air, and Space. These five elements are not just outside us — they are the very fabric of our being"*
- **Second Paragraph** (Identical typography: `font: 400 21px/1.7 var(--font-display)`, color: `var(--mud)`):
  > *"When these elements are in balance, the body’s natural intelligence flourishes — digestion strengthens, sleep deepens, hormones align, and the nervous system returns to its natural rhythm of rest and renewal. Through elemental therapy, the senses awaken, pranic flow becomes unobstructed, and the mind begins to mirror the quiet order of nature itself. Each day of this retreat is devoted to one element — allowing you to experience its medicine through carefully curated practices, yogic techniques, and sensory experiences that bring harmony to body, mind, and spirit."*
- **CTA**: "Walk through the five elements" (`#elements`).

## 3. Data & CMS Configuration (`home.content`)
- `philosophyLabel`: "The Bhraman way"
- `philosophyTitle`: "ELEMENTAL THERAPY"
- `philosophyEmphasis`: "Healing through the 5 great elements"
- `philosophyParagraphs`: Array of 2 paragraphs matching the exact copy above.

## 4. Typography & Styling Rules
- Both paragraphs use identical sizing (`21px`), font family (`var(--font-display)`), and color (`var(--mud)` / `#756456`).
- Section heading tagline is 50% size of the main title, italicized, and colored in brand accent fire `#e27c39`.
