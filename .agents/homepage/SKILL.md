# Homepage & Experience Architecture Skill

## 1. Overview
The homepage (`src/app/page.tsx`) is a server component that aggregates data across multiple public API endpoints (`/api/public/*`) using resilient `Promise.allSettled` fetching. It presents the elemental healing philosophy of Bhraman Retreats.

## 2. Key Components
- **Cinematic Hero** (`src/components/cinematic-hero.tsx`): 15-second cinematic intro sequence, ambient wind audio toggle, skip intro capability with localStorage persistence.
- **Manifesto & Philosophy** (`src/app/page.tsx`, `src/components/philosophy-paragraphs.tsx`): Two-column layout with left media slot (`manifesto-art`) and luxury accordion disclosure for expandable reflection copy.
- **Panch Mahābhūta Grid**: Interactive showcase of Earth, Water, Fire, Air, Space with elemental badges and practices.
- **Experience Modules** (`src/components/experiences/`): 1-minute breathing timer, intention selector, elemental questionnaire, daily pause card.
- **Retreat Feature & Itinerary**: Featured retreat details, schedule summary, and guest voices.

## 3. Data Flow & Fallbacks
- Homepage data is loaded via `getHomepageData()` in `src/lib/content.ts`.
- If public APIs or database settings are temporarily unavailable, fallback values from `defaultHomeContent` are gracefully displayed.

## 4. Key Rules
- Always preserve mobile responsiveness and reduced-motion accessibility (`prefers-reduced-motion`).
- Editorial text styles use `--font-display` (Cormorant Garamond) for headings and `--font-sans` (DM Sans) for body.
