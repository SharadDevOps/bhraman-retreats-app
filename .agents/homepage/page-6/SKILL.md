# Homepage Section: Page 6 — The Story Behind Bhraman

## 1. Overview
Page 6 (`<section className="founder-section" id="founder">`) presents the founder introduction on the homepage and provides an interactive entry point into the immersive, full-screen **Founder Story** editorial experience (`<FounderStoryOverlay />`).

## 2. Homepage Founder Section
- **Eyebrow**: `THE STORY BEHIND BHRAMAN`
- **Heading**: `Rooted in medicine.` <br /> *`Guided by nature.`*
- **Quote**: *“Nature holds everything we need to heal. We only have to learn how to listen again.”*
- **Founder Identity**:
  - Name: `Dr. Pratiksha Shekhawat`
  - Role: `Founder · Bhraman Retreats`
- **Trigger Button**: `Discover her journey →` (opens `<FounderStoryOverlay />` without leaving the page).
- **Portrait**: `ResponsiveMedia` with ambient `Fireflies` background particles.

## 3. Full-Screen Editorial Story Overlay (`<FounderStoryOverlay />`)
- **Visual Design**: Warm cream/nude panel (`#f7f9f5` / `#eef2eb`), terracotta headings (`#7b3a34`), burnt orange accents (`#e27c39`).
- **Desktop Split-Screen**: Sticky visual column (45% width) with crossfading chapter imagery, paired with a narrative scroll column (55% width).
- **4-Chapter Story Structure**:
  1. `01 / THE BEGINNING` — *Before Bhraman, there was a search for another way.*
  2. `02 / THE BELIEF` — *Healing was never meant to happen away from nature.* (Panch Mahābhūta, Ayurveda, yogic stillness).
  3. `03 / THE PRACTICE` — *Ancient wisdom. Practised with intention.* (Dynamic medical & yogic credentials).
  4. `04 / BHRAMAN` — *And eventually, Bhraman became the answer.* (Real Himalayan retreat sanctuaries).
- **Epilogue**:
  - *This isn't a retreat you simply attend. It's one you experience.*
  - Primary CTA: `Explore the next retreat →` (closes overlay and navigates to `#retreat`).
  - Secondary CTA: `← Return to the journey` (closes overlay and restores exact scroll position).
- **Mobile Responsive**: Sequential chapter layout (`Image → Label → Headline → Body`) with natural touch scrolling and persistent close navigation.

## 4. Data & CMS Fields (`home.content` & `FounderProfile`)
- `founderLabel`: "THE STORY BEHIND BHRAMAN"
- `founderTitle`: "Rooted in medicine."
- `founderEmphasis`: "Guided by nature."
- API: `/api/public/founder` returning `name`, `title`, `bio`, `imageUrl`, `credentials`.
