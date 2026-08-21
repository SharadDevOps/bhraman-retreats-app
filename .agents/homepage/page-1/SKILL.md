# Homepage Section: Page 1 — Remember Your Natural Rhythm

## 1. Overview
Page 1 represents the viewport landing and hero experience (`<section className="hero" id="top">`). It establishes the spiritual and elemental atmosphere of Bhraman Retreats through an interactive cinematic journey.

## 2. Key Components & Implementation
- **Component**: `CinematicHero` (`src/components/cinematic-hero.tsx`)
- **Key Props**: `founderName`, `content` (`heroEyebrow`, `heroTitle`, `heroEmphasis`, `heroCopy`, `heroPrimaryCta`, `heroSecondaryCta`), `backgroundImageUrl` (slot `mediaSlots.hero` or fallback `heroMedia?.url`).
- **Cinematic Timeline**: 15-second timeline with stages: *Initial Dawn (0s)* -> *Sacred Sound / Wind* -> *The Call (6s)* -> *Complete Sequence (15s)*.
- **Interactive Controls**:
  - `Sound opt-in` button: Ambient wind audio toggle (`/audio/ambient.mp3`).
  - `Skip Intro` button: Instantly skips animation and stores user preference in `localStorage`.
  - `Scroll Cue`: Animated bobbing cue (`@keyframes cue-bob`) leading to `#philosophy`.

## 3. Data & CMS Fields (`home.content`)
- `heroEyebrow`: "Elemental therapy retreats · Himalayas, India"
- `heroTitle`: "Remember your"
- `heroEmphasis`: "natural rhythm."
- `heroCopy`: "Five elements. Five days. One quiet return to the part of you that never forgot how to be whole."
- `heroPrimaryCta`: "Explore the retreat" (`#retreat`)
- `heroSecondaryCta`: "Discover our philosophy" (`#philosophy`)
- `mediaSlots.hero`: Azure Blob Storage image reference.

## 4. Design & Motion
- Handcrafted CSS in `src/app/globals.css` with `@keyframes wheel-spin`, breathing glow, and responsive background positioning.
- Respects `prefers-reduced-motion` media queries.
