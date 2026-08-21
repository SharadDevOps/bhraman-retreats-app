# Homepage Section: Page 4 — A Slower Way to Travel Within

## 1. Overview
Page 4 (`<section className="experience-teaser section" id="experience">`) provides visitors with immediate, self-guided mindful practices right in the browser.

## 2. Interactive Modalities
1. **01 One-Minute Breathing** (`breathing-experience.tsx`): Five guided 4-2-6 breathing cycles with visual countdown and chime audio.
2. **02 Choose Your Intention** (`intention-experience.tsx`): Interactive selection of personal intentions (Clarity, Stillness, Release, Vitality).
3. **03 Which Element Needs Attention?** (`questionnaire-experience.tsx`): 5 reflective questions scoring user alignment with elemental invitations.
4. **04 Daily Pause** (`daily-pause-experience.tsx`): Deterministic daily micro-meditation that rotates each day.

## 3. Data & CMS Fields (`home.content`)
- `experienceLabel`: "Experience Bhraman"
- `experienceTitle`: "A slower way to travel within."
- `experienceCopy`: "Small circles, elemental practice and meaningful Himalayan immersion create room for genuine rest."

## 4. Visual Identity & Viewport Fit
- **Background**: Deep muddy olive / earthy forest-green tone (`linear-gradient(165deg, #1e2820 0%, #243226 50%, #1a241c 100%)` with subtle warm ember illumination `rgba(200, 160, 90, 0.08)`).
- **Typography & Colors**:
  - Eyebrow: Muted warm gold / sand `var(--sand, #cbb994)`
  - Heading: Warm burnt-orange / terracotta `#e27c39` (`--font-display`)
  - Body copy: Warm cream / off-white `rgba(240, 244, 238, 0.78)`
  - Card titles: Warm cream `#f5f8f3`
- **Layout & Sizing**:
  - Fits comfortably within ~100vh on desktop displays (1366×768, 1440×900, 1920×1080) without clipping.
  - 2 × 2 grid composition with ~20-25% compressed card height (`min-height: clamp(150px, 18.5vh, 195px)`).
  - Common translucent earthy card surface (`rgba(38, 52, 41, 0.44)`) with subtle warm border (`rgba(215, 226, 210, 0.12)`).
  - Small elemental accent cues (Earth: `#94493f`, Water: `#bd7044`, Fire: `#c69b49`, Air: `#6a8c5c`, Space: `#557766`).

## 5. Design & Accessibility
- Full keyboard navigation and ARIA live regions for screen readers (`aria-live="polite"`).
- Respects audio opt-in preferences and reduced-motion settings.
