# Homepage Section: Page 2 — Elemental Therapy (3-Level Typography Hierarchy)

## 1. Overview
Page 2 (`<section className="manifesto section" id="philosophy">`) presents the elemental healing philosophy of Bhraman Retreats through an elegant 3-level typography hierarchy that aligns with the luxury spiritual editorial aesthetic.

## 2. 3-Level Typography Hierarchy
| Level | Element | Text | Desktop Font Size | Typography & Style |
|---|---|---|---|---|
| **Level 1** | Eyebrow (`.manifesto-eyebrow`) | `COME BACK TO WHAT YOU’RE MADE OF !` | `18–22px` (`clamp(13px, 1.1vw, 18px)`) | `500`, uppercase, `0.12em` tracking, `--font-sans`, subtle muted sage `var(--mud)` (`#5c705d`) |
| **Level 2** | Title (`.manifesto-title`) | `Elemental Therapy` | `72–88px` (`clamp(52px, 5.5vw, 88px)`) | `400`, normal/roman, `0.95` line-height, `-0.025em` tracking, `--font-display`, terracotta `var(--earth)` (`#7b3a34`) |
| **Level 3** | Tagline (`.manifesto-tagline`) | *`Healing through the 5 great elements`* | `52–64px` (`clamp(36px, 4vw, 64px)`) | `400`, italic, `1.02` line-height, `-0.02em` tracking, `--font-display`, warm burnt orange `#e27c39` |

## 3. Paragraphs (Identical font size 21px, line-height 1.7, font-display, color var(--mud))
- **Paragraph 1**:
  > *"In the heart of the Himalayas, every sound of the forest, every breath of air, and every grain of soil whispers an ancient truth — that all life arises from the Panch Mahābhūta: Earth, Water, Fire, Air, and Space. These five elements are not just outside us — they are the very fabric of our being"*
- **Paragraph 2**:
  > *"When these elements are in balance, the body’s natural intelligence flourishes — digestion strengthens, sleep deepens, hormones align, and the nervous system returns to its natural rhythm of rest and renewal. Through elemental therapy, the senses awaken, pranic flow becomes unobstructed, and the mind begins to mirror the quiet order of nature itself. Each day of this retreat is devoted to one element — allowing you to experience its medicine through carefully curated practices, yogic techniques, and sensory experiences that bring harmony to body, mind, and spirit."*
- **CTA**: "Walk through the five elements" (`#elements`).

## 4. Data & CMS Configuration (`home.content`)
- `philosophyLabel`: "Come back to what you’re made of !"
- `philosophyTitle`: "Elemental Therapy"
- `philosophyEmphasis`: "Healing through the 5 great elements"
- `philosophyParagraphs`: Array of 2 paragraphs matching the exact copy above.
