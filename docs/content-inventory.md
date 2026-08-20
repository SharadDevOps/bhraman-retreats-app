# Content Inventory

This inventory distinguishes **runtime-visible content**, **database-editable content**, and **reference documents that are not rendered**.

## Brand and logo references

There is no logo image, SVG, favicon, or reusable logo component.

| Location | Hardcoded representation |
|---|---|
| `src/components/navigation.tsx` | `भ` + “Bhraman” + “Retreats” |
| `src/app/page.tsx` footer | `भ` + “Bhraman” + “Retreats” |
| `src/app/admin/page.tsx` login | `भ` |
| `src/app/admin/page.tsx` header | `भ` + “Bhraman” + “Admin” |
| `src/components/cinematic-hero.tsx` | Separate `ॐ` ritual glyph, not the `भ` brand mark |
| `src/app/layout.tsx` | Brand name in metadata and OG alt text |

The repeated logo markup risks visual drift and should eventually become one shared brand component, but no refactor is part of Phase 0.

## Retreat defaults and editable fields

File: `src/data/retreat.ts`

| Field | Hardcoded fallback | Runtime override |
|---|---|---|
| slug | `forest-edition-dec-2026` | No admin control; used as fixed lookup key |
| title | `An Elemental Journey` | Retreat database row/admin |
| edition | `Forest edition` | Retreat database row/admin |
| summary | `Five immersive days to ground, cleanse, transform, expand and return to stillness.` | Retreat database row/admin |
| description | `Five elements. Five days. One quiet return to the part of you that never forgot how to be whole.` | Stored on first retreat creation; not editable in admin or rendered from DB |
| location | `Van Tarang, Rajaji National Park` | Retreat database row/admin |
| start | `2026-12-22T00:00:00.000Z` | Retreat database row/admin |
| end | `2026-12-26T00:00:00.000Z` | Retreat database row/admin |
| price | `2999900` paise = ₹29,999 | Retreat database row/admin |
| capacity | `12` | Retreat database row/admin |

Additional hardcoded date/year content:

- Footer copyright: `© 2026 Bhraman Retreats`.
- README and source documents repeat December 22–26, 2026.

## Philosophy and hero copy

### Shared/approved hero copy

- “Elemental therapy retreats · Himalayas, India”
- “Remember your natural rhythm.”
- “Five elements. Five days. One quiet return to the part of you that never forgot how to be whole.”
- CTA: “Explore the retreat”
- Secondary link: “Discover our philosophy”
- Scroll cue: “Scroll to journey”

Phase 2 additional hardcoded strings:

- “Breathe in · Return within”
- “Founded & guided by”
- “Dr. Pratiksha Shekhawat”
- “Listen” / “Wind on”
- “Skip intro”

### Philosophy section

- Eyebrow: “The Bhraman way”
- Heading: “Nature is not the backdrop. Nature is the medicine.”
- Paragraph 1: “In the heart of the Himalayas, every breath of air and every grain of soil whispers an ancient truth: all life arises from Earth, Water, Fire, Air and Space.”
- Paragraph 2: “Our intimate retreats weave elemental therapy, yoga, sattvik food and slow travel into a rhythm where the body can soften and the mind can become clear.”
- CTA: “Walk through the five elements”

## Five Elements static content

File: `src/data/retreat.ts`  
Runtime editability: none

| Element | Sanskrit | Verb | Practice | Detail |
|---|---|---|---|---|
| Earth | Prithvi | Root | Mud therapy | Grounding yoga, barefoot forest walks and the healing touch of soil. |
| Water | Jala | Release | Breathwork | Fluid movement, sound and breath rituals to soften what you are holding. |
| Fire | Agni | Transform | Trataka | Solar practice, candle gazing and expression to rekindle inner clarity. |
| Air | Vāyu | Expand | Sound healing | Prāṇāyāma, mantra and spacious movement to invite lightness. |
| Space | Ākāśa | Observe | Meditation | Sky gazing, inner silence and deep rest to return to awareness. |

Section copy:

- “Panch Mahābhūta”
- “Five pathways back to balance.”
- “Each element holds a distinct quality. Together, they create a complete journey through body, breath, energy and awareness.”

## Itinerary static content

File: `src/data/retreat.ts`  
Runtime editability: none  
Database `ItineraryDay` model: currently ignored

| Day | Element | Title | Activities |
|---|---|---|---|
| Day one | Earth | Ground & arrive | Opening circle; Clay therapy; Forest herb walk; Rooted yoga; Inner silence |
| Day two | Water | Flow & release | Chandra Namaskar; Breathwork + sound; Ayurvedic kitchen; Ashram visit; Yoga Nidra |
| Day three | Fire | Transform & awaken | Surya Arghya; Dynamic yoga; Agni kriyas; Trataka; Kirtan circle |
| Day four | Air | Expand & express | Prāṇāyāma; Heart-opening flow; Abhyanga; Herbal tea circle; Bīja mantra |
| Day five | Space | Integrate & return | Sky gazing; Yoga Nidra; Inner silence; Closing ritual; Sharing circle |

Surrounding copy:

- “Your five-day rhythm”
- “A journey that unfolds slowly.”
- “Every day honours one element through movement, traditional practice, conscious nourishment and reflection.”
- “The complete time-by-time schedule becomes available in your retreat account after booking.”

The final sentence refers to a “retreat account,” but no visitor account route or account UI exists.

## Founder details and quotes

Runtime homepage:

- Name: Dr. Pratiksha Shekhawat
- Role: “Doctor, yoga and elemental therapist”
- Heading: “Rooted in medicine. Guided by nature.”
- Quote: “Nature holds everything we need to heal. We only have to learn how to listen again.”
- CTA: “Begin your journey”

Reference document `docs/Google Keep document.docx` contains additional unimplemented claims:

- doctor by training and seeker by spirit;
- living amidst nature for over seven years;
- practicing medicine for eight years;
- guiding yoga and elemental wisdom for five years;
- a longer first-person quote about not taking pills;
- a full founder biography.

Those claims are not treated as approved runtime content by this audit.

## Testimonials

- No testimonials are hardcoded in the runtime fallback.
- Testimonials come from `SiteContent["testimonials"]`.
- Each record has name, location, and quote.
- The section is completely omitted when the array is empty.
- Admin users can create, edit, and remove records.
- Section heading copy is hardcoded:
  - “Voices from the forest”
  - “What guests carry home.”

## Booking and enquiry settings

There is no separate enquiry system. The current form creates a booking.

Hardcoded form fields/settings:

- Full name: required, minimum two characters.
- Email: required, HTML email input plus server regex.
- Phone: required, server regex.
- Guests: hardcoded options 1–6.
- Dietary preferences: optional.
- Health notes: optional.
- Endpoint: `/api/bookings`.
- Success behavior: PENDING reservation or WAITLISTED.
- No online payment is taken.
- Booking reference can be copied.

Hardcoded payment placeholders:

| Setting | Value |
|---|---|
| UPI ID | `bhramanretreats@upi` |
| Account name | `Bhraman Retreats` |
| Account number | `XXXXXXXXXXXX` |
| IFSC | `XXXXXXXXX` |
| Bank | `Your Bank` |
| Note | “Use your booking reference as the payment remark. Your spot is confirmed once payment is received.” |

These values are static and not admin-editable. They must not be treated as production-ready payment details.

Hardcoded booking/closing copy includes:

- “The forest is waiting”
- “Come back to what feels essential.”
- “Join the first Bhraman Forest Edition and experience life in its natural rhythm.”
- “No payment is taken online. You’ll receive payment instructions after reserving.”
- Waitlist and reservation confirmation messages in `BookingForm`.

## Footer content

- Logo: repeated `भ` + Bhraman Retreats markup.
- Ethos: “Silence as teacher · Element as medicine · Nature as guide”
- Links:
  - Retreats → `#retreat`
  - Itinerary → `#itinerary`
  - Instagram → `#`
  - Contact → `#`
- Copyright: `© 2026 Bhraman Retreats. All rights reserved.`

The two placeholder links are user-visible but nonfunctional.

## All user-visible runtime uses of “forest”

| User-visible text | Source |
|---|---|
| `Forest edition` | Retreat fallback/database edition displayed in Upcoming Retreat |
| `Grounding yoga, barefoot forest walks and the healing touch of soil.` | Earth element card |
| `Forest herb walk` | Day-one itinerary |
| `Voices from the forest` | Testimonials eyebrow |
| `The forest is waiting` | Booking eyebrow |
| `Join the first Bhraman Forest Edition and experience life in its natural rhythm.` | Booking introduction |

Non-user-visible/runtime-internal uses:

- slug `forest-edition-dec-2026`;
- README examples and limitations.

Reference documents contain many additional “forest” phrases, but those documents are not served by the application.

## Image, video, and blog content references

- Phase 2 CSS URL: `/hero-himalayan-dawn.png`.
- Phase 2 metadata URL: `/og.png`.
- Dynamic image URLs: `media.retreat` and `media.founder`.
- Dormant dynamic slot: `media.hero`.
- Azure Blob URL template: `https://<account>.blob.core.windows.net/<container>/<blobName>`.
- No hardcoded deployed blob URL exists in application source.
- No video URL or video component exists.
- No blog article, blog route, post model, author model, category, tag, or CMS integration exists.

## Reference-document content

### `docs/HomeIntroduction.pdf`

Three-page source covering:

- elemental-therapy introduction;
- proposed names for element-specific retreats;
- imbalance symptoms and healing-pathway copy for all five elements;
- a request to replace older “complete renewal” positioning.

### `docs/Google Keep document.docx`

Source covering:

- full five-day timed itinerary;
- retreat ethos;
- poster content;
- mission and approach;
- founder bio;
- inclusions and outcomes;
- price ₹29,999;
- Forest, Ladakh, and Mountain edition concepts.

### `docs/five days retreat schedule..docx`

Source covering:

- separate three-day retreat outlines for each element;
- suggested focus, journaling, meditation, and support claims.

These documents are content references only. They are not rendered, parsed, or exposed by the running app.

## Hardcoded colour inventory

Primary design tokens in `src/app/globals.css`:

| Token | Value |
|---|---|
| `--earth` | `#7f2f27` |
| `--earth-deep` | `#54211d` |
| `--water` | `#c96d36` |
| `--fire` | `#d5a538` |
| `--air` | `#657c56` |
| `--space` | `#466b83` |
| `--ink` | `#2d2823` |
| `--ink-soft` | `#5f574e` |
| `--mud` | `#756456` |
| `--sand` | `#d8c8b4` |
| `--nude` | `#e9ddce` |
| `--linen` | `#f2ebe1` |
| `--paper` | `#faf7f1` |
| `--white` | `#fffdf8` |
| `--night` | `#282c29` |

Additional unique hardcoded hex colours in `globals.css`:

```text
#000 #050505 #242824 #242925 #263b42 #29414d #303b34 #304755
#342719 #343c35 #345467 #355369 #39201d #3a291c #43594d #46583c
#4b6243 #53675b #657866 #6b2924 #705519 #768b84 #83786e #847a70
#879486 #8a8178 #9c4a32 #9eb9ca #a94d27 #aa7621 #aabc91 #da9185
#e2c886 #e2d2ab #e2d4c2 #e3a16f #e7c572 #e7dac8 #e8c870 #eadbca
#edd78e #efe5d7 #f2e9dc #f7f1e7
```

Additional component colour:

- `#fff` in `cinematic-hero.tsx` when sampling the Om glyph.

All unique hardcoded RGBA values:

```text
rgba(5,5,5,.35)
rgba(5,5,5,.48)
rgba(6,8,8,.8)
rgba(7,9,9,.16)
rgba(10,12,12,.52)
rgba(38,44,41,.42)
rgba(39, 31, 24, 0.2)
rgba(40,44,41,.22)
rgba(40,44,41,.98)
rgba(52,39,25,.25)
rgba(52,39,25,.7)
rgba(62, 45, 31, 0.12)
rgba(70,107,131,.08)
rgba(70,107,131,.16)
rgba(70,107,131,.58)
rgba(72, 59, 49, 0.17)
rgba(72,45,24,.25)
rgba(74,45,22,.14)
rgba(101,124,86,.08)
rgba(101,124,86,.16)
rgba(127,47,39,.08)
rgba(127,47,39,.11)
rgba(201, 109, 54, 0.18)
rgba(201,109,54,.08)
rgba(201,109,54,.1)
rgba(201,109,54,.5)
rgba(213, 165, 56, 0.18)
rgba(213, 165, 56, 0.35)
rgba(213,165,56,0)
rgba(213,165,56,.1)
rgba(213,165,56,.12)
rgba(213,165,56,.14)
rgba(213,165,56,.18)
rgba(213,165,56,.23)
rgba(213,165,56,.27)
rgba(213,165,56,.28)
rgba(213,165,56,.58)
rgba(213,165,56,.65)
rgba(231, 197, 114, ${alpha})
rgba(237,215,142,.75)
rgba(242,235,225,.18)
rgba(255, 253, 248, 0.18)
rgba(255,253,248,.38)
rgba(255,253,248,.55)
rgba(255,253,248,.56)
rgba(255,253,248,.6)
rgba(255,253,248,.62)
rgba(255,253,248,.74)
rgba(255,253,248,.76)
rgba(255,253,248,.78)
rgba(255,255,255,.025)
rgba(255,255,255,.035)
rgba(255,255,255,.05)
rgba(255,255,255,.07)
rgba(255,255,255,.08)
rgba(255,255,255,.1)
rgba(255,255,255,.13)
rgba(255,255,255,.18)
rgba(255,255,255,.2)
rgba(255,255,255,.22)
rgba(255,255,255,.3)
rgba(255,255,255,.32)
rgba(255,255,255,.35)
rgba(255,255,255,.42)
rgba(255,255,255,.45)
rgba(255,255,255,.48)
rgba(255,255,255,.78)
```

Most colour literals are centralized in `globals.css`, but many component-state shades are not represented by reusable tokens.

