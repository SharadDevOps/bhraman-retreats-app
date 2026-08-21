# Typography, Font Sizes & Color Palette System Skill

## 1. Executive Summary & Brand Identity
Bhraman Retreats uses a bespoke, luxury editorial design language that pairs classical serif display typography with clean, geometric modern sans-serif typography. The palette is derived from the **Panch Mahābhūta** (Five Elements: Earth, Water, Fire, Air, Space) combined with warm, grounding Himalayan natural neutrals (Sand, Paper, Linen, Mud, Ink).

---

## 2. Font Families & Stack

| Token | Family Stack | Primary Role & Mood |
|---|---|---|
| `--font-display` | `"Iowan Old Style", "Palatino Linotype", Palatino, Baskerville, Georgia, serif` | Editorial headlines, hero H1, section titles, quote blocks, date stamps, brand wordmark, spiritual numerals. |
| `--font-sans` | `"Avenir Next", Avenir, "Segoe UI", Helvetica, Arial, sans-serif` | Clean body copy, buttons, navigation links, eyebrow badges, form labels, inputs, metadata. |

---

## 3. Font Size Scale & Hierarchy

| Font Size Token / Value | Line Height | Letter Spacing | Weight | Typical Element & Used In |
|---|---|---|---|---|
| `clamp(68px, 9.4vw, 146px)` | `0.96` | `-0.055em` | `500` | **Hero Main Title (H1)** — [Page 1 (Hero)](../homepage/page-1/SKILL.md) |
| `clamp(58px, 7.5vw, 108px)` | `0.96` | `-0.045em` | `500` | **Closing Callout Title (H2)** — [Page 11 (Enquiry)](../homepage/page-11/SKILL.md) |
| `clamp(52px, 6.2vw, 94px)` | `0.96` | `-0.04em` | `500` | **Editorial Section Headings (H2)** — [Page 2 (Philosophy)](../homepage/page-2/SKILL.md), [Page 3 (Elements)](../homepage/page-3/SKILL.md), [Page 5 (Retreat)](../homepage/page-5/SKILL.md) |
| `clamp(50px, 5vw, 70px)` | `1.0` | `-0.02em` | `500` | **Itinerary Day Panel Title (H3)** — [Page 7 (Itinerary)](../homepage/page-7/SKILL.md) |
| `45px` | `1.0` | `-0.02em` | `500` | **Five Elements Card Title (H3)** — [Page 3 (Elements)](../homepage/page-3/SKILL.md) |
| `40px` | `1.0` | `normal` | `400` / `500` | **Om Symbol Breathing Glow** (Hero) & **Admin Login Title** |
| `34px` | `1.1` | `normal` | `600` | **Retreat Price Amount strong** (`₹29,999`) & **Booking Success H3** |
| `32px` | `1.15` | `-0.01em` | `500` | **Admin Card Heading (H2)** — [Admin CMS](../admin-cms/SKILL.md) |
| `26px` | `1.0` | `normal` | `600` | **Date Stamp Day Range** (`12—16`) — [Page 5 (Retreat)](../homepage/page-5/SKILL.md) |
| `23px` | `1.0` | `0.06em` | `500` | **Brand Wordmark strong** (`Bhraman`) & **Itinerary Day Tab buttons** |
| `21px` / `20px` | `1.65 - 1.7` | `normal` | `400` | **Editorial Lead Paragraphs**, **Philosophy primary reflection**, **Founder quote block** |
| `18px` | `1.4` | `normal` | `500` | **Itinerary Activity items** (`day-panel li`), **Itinerary Section Titles** |
| `16px` | `1.2` | `0.05em` | `600` | **Testimonial Guest Name strong**, **Admin booking reference strong** |
| `15px` / `14px` | `1.85 - 1.9` | `normal` | `300` / `400` | **Standard Body Copy**, **Philosophy extended accordion copy**, **Form input values** |
| `13px` / `12px` | `1.65` | `normal` | `400` | **Element reveal hover text**, **Retreat location/date metadata**, **Form error messages** |
| `11.5px` | `1.0` | `0.08em` | `500` | **Show More / Read More luxury pill button** — [Page 2 (Philosophy)](../homepage/page-2/SKILL.md) |
| `10px` | `1.0` | `0.15em - 0.24em` | `600` | **Eyebrow badges**, **Buttons (Primary & Secondary)**, **Navigation links**, **Admin tabs** |
| `9px` / `8px` | `1.0` | `0.15em - 0.28em` | `500` / `600` | **Element Sanskrit labels (Prithvi, Jala)**, **Date stamp small label**, **Footer copyright**, **Status pills** |

---

## 4. Color Palette & Elemental Color Tokens

### 4.1. The Five Elements (Panch Mahābhūta)
| Element Token | Hex Code | Dark-Mode / Accent Variant | Meaning & Where Used |
|---|---|---|---|
| `--earth` | `#7b3a34` | `#da9185` (light on dark) | Grounding terracotta. Used for Earth cards, eyebrow badges, primary button gradients, booking IDs, form focus rings. |
| `--earth-deep` | `#54211d` | `#39201d` | Deep Himalayan clay. Used for dark button backgrounds, hero gradient base. |
| `--water` | `#bd7044` | `#e3a16f` | Fluid amber. Used for Water cards, testimonial opening quotation glyphs (`“`), sun gradient stops. |
| `--fire` | `#e27c39` / `#c69b49` | `#e8c870` | Sacred flame & warmth. **Primary brand accent orange**. Used for editorial heading emphasis (`<em>`), active nav indicators, sparkle icons, fireflies. |
| `--air` | `#66775a` | `#aabc91` | Pine & breath. Used for Air cards, botanical marks (`❦`), booking success icons, paid status pills. |
| `--space` | `#4f7185` | `#9eb9ca` | Sky silence & ether. Used for Space cards, focus shadows (`--shadow-focus`), waitlist pills. |

### 4.2. Natural Neutrals & Surfaces
| Token | Hex Code | Role & Usage |
|---|---|---|
| `--ink` | `#2d2823` | High-contrast primary dark text for light surfaces. |
| `--ink-soft` / `--text-muted` | `#5f574e` / `#8a8178` | Secondary body text, caption text, placeholder hints, schedule notes. |
| `--mud` | `#756456` | Warm earthy text for editorial lead paragraphs and form labels. |
| `--sand` | `#d8c8b4` | Subtle borders, light background accents. |
| `--nude` | `#e9ddce` | Background for retreat details section and light button backgrounds. |
| `--linen` | `#f2ebe1` | Background for testimonials section and interactive module panels. |
| `--paper` | `#faf7f1` | Primary site background canvas (`--surface`). |
| `--white` | `#fffdf8` | Pure warm white for cards, inputs, and text over dark hero/founder sections. |
| `--night` | `#282c29` / `#070807` | Deep cinematic background for Hero and Footer. |

---

## 5. Component & Section Usage Matrix

```text
Section / Component              Font Size                     Font Family         Font Color
------------------------------------------------------------------------------------------------------
[Top Nav / Brand Logo]           23px (strong), 10px (links)   Display / Sans      --white / --ink
[Hero H1 Title]                  clamp(68px, 9.4vw, 146px)     Display             --white (<em>: #e8c870)
[Hero Copy]                      clamp(19px, 1.55vw, 24px)     Display             rgba(255,253,248, 0.76)
[Buttons (Primary/Secondary)]    10px (Uppercase 0.15em)       Sans                --white / --earth-deep
[Eyebrows / Section Labels]      10px (Uppercase 0.24em)       Sans                --earth / #e2c886 (on dark)
[Editorial Headings (H2)]        clamp(52px, 6.2vw, 94px)      Display             #e27c39 (Fire Accent)
[Philosophy Lead Paragraph]      21px / line-height 1.7        Display             --mud (#756456)
[Philosophy Accordion Text]      15px / line-height 1.9        Sans                --text-muted (#5f574e)
[Show More / Read More Pill]     11.5px (Uppercase 0.08em)     Sans                #e27c39 on rgba(226,124,57,0.08)
[Element Cards H3]               45px                          Display             --white / #342719 (Fire card)
[Element Card Sub-Verbs]         22px (Italic)                 Display             rgba(255,253,248, 0.78)
[Retreat Lead & Summary]         20px / line-height 1.65       Display             --mud (#756456)
[Retreat Price Strong]           34px                          Display             #3a291c
[Date Stamp Badge]               26px (strong), 9px (small)    Display / Sans      #3a291c
[Founder Section Quote]          22px (Italic)                 Display             #e2d2ab
[Itinerary Day Tabs]             23px (tab), 9px (badge)       Display / Sans      #847a70 (active: --white)
[Itinerary Activity Items]       18px                          Display             --ink (#2d2823)
[Testimonial Quotes]             20px (Italic)                 Display             --ink (#2d2823)
[Testimonial Author Monogram]    18px                          Display             --white on --gradient-sun
[Journal Excerpt]                14px / line-height 1.8        Sans                --text-muted
[Enquiry Form Inputs]            14px                          Sans                --ink on rgba(255,253,248,0.78)
[Footer Tagline]                 15px (Italic)                 Display             rgba(255,253,248, 0.55)
[Footer Links & Copyright]       9px (Uppercase 0.13em)        Sans                rgba(255,253,248, 0.38)
```
