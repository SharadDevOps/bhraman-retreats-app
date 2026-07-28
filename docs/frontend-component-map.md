# Frontend Component Map

## Version comparison baseline

| Label used in this audit | Repository source |
|---|---|
| Current development/client-visible version | `origin/main` at `0086eff` |
| Newer feature phase version | `feature/phase2` working tree |

The only Phase 2 file differences are:

- added `src/components/cinematic-hero.tsx`;
- added `public/hero-himalayan-dawn.png`;
- added `public/og.png`;
- modified `src/app/page.tsx`;
- modified `src/app/globals.css`;
- modified `src/app/layout.tsx`.

All other frontend components are shared with the merged baseline.

## Route-level components

| File | Rendering mode | Responsibility |
|---|---|---|
| `src/app/layout.tsx` | Server | Document shell and metadata |
| `src/app/page.tsx` | Server | Homepage composition and dynamic site-data read |
| `src/app/admin/page.tsx` | Client | Password login and four-tab admin interface |

## Homepage section map

| Order | Section / selector | Implemented in | Supporting component/data | Version comparison | Approved source |
|---:|---|---|---|---|---|
| 1 | Hero `.hero` | Baseline: inline in `page.tsx`; Phase 2: `CinematicHero` | `Navigation`; baseline `HeroNature`; Phase 2 canvas/Web Audio/static image | Materially different | Newer feature phase |
| 2 | Philosophy `.manifesto`, `#philosophy` | `page.tsx` | No extracted component | JSX is identical in both versions | Newer feature phase |
| 3 | Five Elements `.elements-section`, `#elements` | `page.tsx` | `elements` from `src/data/retreat.ts` | Identical in both versions | Current development |
| 4 | Upcoming retreat `.retreat-section`, `#retreat` | `page.tsx` | `getSiteData()`, `formatDateRange()`, retreat media slot | Identical in both versions | Not explicitly locked; preserve until directed |
| 5 | Itinerary `.itinerary-section`, `#itinerary` | `page.tsx` | `Itinerary`, static `itinerary` array | Identical in both versions | Current development |
| 6 | Meet Your Guide `.founder-section`, `#founder` | `page.tsx` | `Fireflies`, founder media slot | Identical in both versions | Current development |
| 7 | Testimonials `.testimonials-section` | `page.tsx` | Dynamic testimonials from `SiteContent` | Identical; omitted when empty | Not explicitly locked; preserve until directed |
| 8 | Booking `.closing`, `#booking` | `page.tsx` | `BookingForm`, `/api/bookings` | Identical in both versions | Temporary only; redesign later |
| 9 | Footer `footer` | `page.tsx` | Repeated glyph/text logo | Identical in both versions | Combine strongest parts after audit |

## Shared components

### `Navigation`

- File: `src/components/navigation.tsx`
- Client state controls the mobile menu.
- Used by both hero implementations.
- Links to Philosophy, Elements, Upcoming Retreat, and Itinerary.
- Logo is hardcoded as the Devanagari glyph `भ` plus text.

### `CinematicHero`

- File: `src/components/cinematic-hero.tsx`
- Exists only in the newer feature working tree.
- Uses:
  - canvas particles and `requestAnimationFrame`;
  - a sampled `ॐ` glyph;
  - pointer/scroll parallax through CSS custom properties;
  - Web Audio-generated wind noise;
  - timed founder, mountain, content, and CTA reveals;
  - skip and sound controls;
  - Page Visibility and reduced-motion handling.
- Wraps the shared `Navigation`.

### `Itinerary`

- File: `src/components/itinerary.tsx`
- Client-side tab state.
- Reads the static `itinerary` array.
- Renders five tab buttons and one active panel.

### `BookingForm`

- File: `src/components/booking-form.tsx`
- Client-side form submission, loading, error, confirmation, waitlist, copy-reference, and payment-instruction states.
- Posts JSON to `/api/bookings`.
- Uses hardcoded guest options 1–6 and static payment instructions.

### `ScrollReveal`

- File: `src/components/scroll-reveal.tsx`
- Uses `IntersectionObserver`.
- Adds `will-reveal` and `revealed` classes to hardcoded section selectors.
- Skips behavior when reduced motion is requested.

### `nature-effects.tsx`

- `Fireflies` remains active in Meet Your Guide.
- `HeroNature` is active in the merged hero only.
- In Phase 2, `HeroNature`, `Leaf`, `LEAVES`, and the mist/leaf hero branch are unused.

## Duplicate, unused, and conflicting frontend code

### Unused in the newer feature version

- `HeroNature` export and its private `Leaf` renderer.
- `LEAVES` data.
- CSS for `.hero-nature`, `.leaf*`, and `.mist*`.
- Old hero wheel/orbit markup is removed, leaving CSS for:
  - `.element-wheel`;
  - `.wheel-center`;
  - `.wheel-label` and five label positions;
  - `.orbit`, `.orbit-one`, `.orbit-two`.
- `MediaSlots.hero` is typed/read, and the upload API accepts it, but no current homepage consumes it.

### Duplicate concepts

- Logo markup appears in Navigation, footer, admin login, and admin header.
- INR formatting is implemented independently in homepage, booking form, and admin page.
- Retreat fallback mapping is repeated in `content.ts`, booking creation, and admin content.
- Testimonial/media/retreat TypeScript shapes are independently declared in frontend and backend files.
- Hero media has three competing concepts:
  - `Retreat.heroImageUrl`;
  - `SiteContent["mediaSlots"].hero`;
  - Phase 2 static `public/hero-himalayan-dawn.png`.

### Direct conflicts during consolidation

- `src/app/page.tsx`: inline merged hero versus `CinematicHero` import/use.
- `src/app/globals.css`: original hero rules remain near the top, while Phase 2 overrides append a second `.hero` ruleset and additional timed states.
- `src/app/layout.tsx`: static metadata versus request-derived metadata, social image, and hero preload.
- `nature-effects.tsx`: not textually changed, but its hero exports change from active to dead code.

## Animation implementation

There is **no third-party animation library**.

| Mechanism | Location | Usage |
|---|---|---|
| CSS keyframes/transitions | `globals.css` | Wheel, glow, orbits, cue, reveal, leaves, mist, fireflies, Phase 2 cinematic timing |
| IntersectionObserver | `scroll-reveal.tsx` | One-time section reveal |
| Canvas + requestAnimationFrame | `cinematic-hero.tsx` | Particle Om formation/breath/dissolve |
| CSS transforms/custom properties | `cinematic-hero.tsx`, `globals.css` | Pointer/scroll parallax |
| Web Audio API | `cinematic-hero.tsx` | Optional generated wind |
| Page Visibility API | `cinematic-hero.tsx` | Pause/resume canvas |

## Responsiveness audit

Existing responsive behavior:

- Breakpoints at 1080 px and 640 px.
- Navigation collapses below 1080 px.
- Five Elements changes from five columns to two and then one.
- Retreat/founder split layouts stack.
- Itinerary tabs become horizontally scrollable.
- Testimonials and footer collapse to one column.
- Phase 2 caps particle count lower on screens below 640 px.

Risks:

- Mobile navigation has no `aria-expanded`, Escape handling, focus trap, or focus return.
- Horizontal itinerary tabs have no visible overflow affordance.
- Hero canvas uses viewport dimensions rather than measured section bounds.
- Large headings and fixed animation timing may crowd short mobile landscapes.
- Dynamic uploaded images have no dimensions or responsive sources, creating layout-shift risk.
- There is no browser/device regression suite.

## Performance audit

- Phase 2 hero PNG is 1,673,203 bytes and used as a full-screen CSS background.
- Phase 2 OG PNG is 1,904,956 bytes; it does not affect page rendering but is large for link unfurls.
- Hero background is manually preloaded.
- CSS backgrounds bypass Next image sizing/optimization.
- Phase 2 runs up to 760 canvas particles plus full-screen CSS opacity/filter animations.
- Pointer and scroll work is requestAnimationFrame-throttled and uses transforms, which is positive.
- Canvas DPR is capped at 1.5 and mobile particle count is reduced, which is positive.
- Full-screen blur/filter work can still be expensive on low-end mobile GPUs.
- The particle target map is rebuilt on every resize.
- `force-dynamic` and database reads prevent a fully static/cached homepage.
- Raw uploaded `<img>` elements omit width/height and optimization.

## Accessibility audit

Positive:

- Semantic sections and headings are present.
- Form controls are associated with labels.
- Form errors use `role="alert"`.
- Hero canvas/decorative effects are hidden from assistive technology.
- Phase 2 includes Skip Intro, sound state, reduced-motion handling, and no autoplay audio.
- Itinerary exposes `tablist`, `tab`, `tabpanel`, and `aria-selected`.

Risks:

- Itinerary tabs lack `id`, `aria-controls`, roving `tabIndex`, and arrow-key navigation.
- Mobile menu lacks expanded-state semantics and keyboard dismissal.
- Timed Phase 2 content remains hidden for roughly eight seconds unless skipped.
- Phase 2 animation can exceed five seconds; Skip Intro helps, but there is no persistent pause/resume control.
- Some muted text/overlay combinations need measured contrast testing.
- Booking success is not announced with an `aria-live` region.
- Footer Instagram and Contact links use `href="#"`.
- Image fallback text such as “Manage from admin” is visible to public users when media is absent.
- Admin tab controls do not use tab semantics.

