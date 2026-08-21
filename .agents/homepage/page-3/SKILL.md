# Homepage Section: Page 3 — The Five-Day Journey (Five Elements)

## 1. Overview
Page 3 (`<section className="elements-section" id="elements">`) transitions the visitor from understanding Elemental Therapy into experiencing the retreat as a progressive five-day journey.

## 2. Heading & Introduction
- **Eyebrow**: `THE FIVE-DAY JOURNEY`
- **Heading**: (`.journey-title`)
  - `Five elements.` (large roman serif, `clamp(56px, 5.2vw, 82px)`, `line-height: 0.98`, `letter-spacing: -0.035em`, `font-weight: 400`)
  - `Five days.` (same large roman serif)
  - *`One journey inward.`* (`.journey-title em`, `font-size: 0.92em`, `font-weight: 400`, `line-height: 1`, `color: #e27c39`)
- **Intro Copy**: *"Each day is devoted to one element — experienced through movement, breath, ritual, nature and stillness. Together, they unfold as one journey back to yourself."*

## 3. Five Elemental Cards (Interactive & Clickable)
| Element | Key | Symbol | Sanskrit | Verb | Practice | Detail | Palette |
|---|---|---|---|---|---|---|---|
| **Earth** | `earth` | `01` | `Prithvi` | `Root` | `Mud therapy` | Grounding yoga, barefoot nature walks and the healing touch of soil. | Deep Terracotta (`#6b2924` / `--earth`) |
| **Water** | `water` | `02` | `Jala` | `Release` | `Breathwork` | Fluid movement, sound and breath rituals to soften what you are holding. | Earthy Amber (`#a94d27` / `--water`) |
| **Fire** | `fire` | `03` | `Agni` | `Transform` | `Trataka` | Solar practice, candle gazing and expression to rekindle inner clarity. | Golden Sun (`#aa7621` / `--fire`) |
| **Air** | `air` | `04` | `Vāyu` | `Expand` | `Sound healing` | Prāṇāyāma, mantra and spacious movement to invite lightness. | Forest Green (`#4b6243` / `--air`) |
| **Space** | `space` | `05` | `Ākāśa` | `Observe` | `Meditation` | Sky gazing, inner silence and deep rest to return to awareness. | Himalayan Blue (`#345467` / `--space`) |

## 4. UI Architecture & Navigation
- 5-column grid layout on desktop.
- Subtle card borders and radial backdrop illumination.
- Hover lift animation (`translateY(-10px)` + shadow lift).
- Full card clickable navigation targeting itinerary days (`#day-earth`, `#day-water`, `#day-fire`, `#day-air`, `#day-space`).
- Smoothly scrolls to the Itinerary section and automatically switches to the corresponding active day tab.
