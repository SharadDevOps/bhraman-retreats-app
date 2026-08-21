# Homepage Section: Page 3 — Five Pathways Back to Balance

## 1. Overview
Page 3 (`<section className="elements-section" id="elements">`) introduces the foundational Panch Mahābhūta framework.

## 2. Key Components & Structure
- **Section Heading**: Section label "Panch Mahābhūta", editorial heading "Five pathways back to balance.", and introductory description.
- **Element Grid**: 5 interactive cards (`.element-card`):
  1. `01 Earth (Prithvi)` — **Root** (Grounding yoga, barefoot nature walks, soil therapy).
  2. `02 Water (Jala)` — **Release** (Fluid movement, sound and breath rituals).
  3. `03 Fire (Agni)` — **Transform** (Solar practice, candle gazing / Trataka, clarity).
  4. `04 Air (Vāyu)` — **Expand** (Prāṇāyāma, mantra, spacious movement, sound healing).
  5. `05 Space (Ākāśa)` — **Observe** (Sky gazing, inner silence, deep meditation).

## 3. Data & CMS Fields (`home.elements`)
- Configured as a structured JSON list in `SiteSetting` key `home.elements`.
- Fallbacks are maintained in `defaultHomeContent.elements`.
- Each element contains `key`, `symbol`, `name`, `sanskrit`, `verb`, `practice`, and `detail`.

## 4. Design & Hover Interactions
- Distinct ambient gradients for each element (`.earth`, `.water`, `.fire`, `.air`, `.space`).
- `.element-reveal` card hover animation revealing in-depth practice description.
