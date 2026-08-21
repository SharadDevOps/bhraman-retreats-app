# Design System, Typography & Styles Skill

## 1. Philosophy & Architecture
Bhraman Retreats uses a bespoke hand-written CSS architecture in `src/app/globals.css` with CSS variables and no CSS framework dependencies.

## 2. Color Palette & Elemental Tokens
- `--sand` / `--paper` / `--nude` / `--linen`: Natural background tones.
- `--mud` (`#2b2520`): Deep grounding text color.
- `--fire` (`#e27c39` / `#c96d36`): Sacred warmth and primary accent orange.
- `--air` / `--water` / `--earth` / `--space`: Dedicated elemental therapy accents.

## 3. Typography
- **Display Headings**: `var(--font-display)` (Cormorant Garamond, serif, italic accents).
- **Body & UI**: `var(--font-sans)` (DM Sans, sans-serif, precise tracking).

## 4. UI Components & Micro-Interactions
- **Brand Logo** (`src/components/brand-logo.tsx`, `public/logo.png`): Circular emblem with terracotta contour and transparent background.
- **Show More Pill**: Luxury glassmorphism pill button with rotating chevron.
- **Scroll Reveal & Parallax**: Subtle fade-ups and ambient particles.
