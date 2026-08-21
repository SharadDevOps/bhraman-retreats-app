# Homepage Section: Page 9 — What Guests Carry Home

## 1. Overview
Page 9 (`<section className="testimonials-section section" id="testimonials">`) highlights real visitor stories and transformative experiences.

## 2. Key Components & Structure
- **Testimonials Grid (`.testimonial-grid`)**: 3-column card grid rendering `QuoteBlock` with quote text, attendee name, location, and circular photo avatar / monogram.
- **Video Links**: Support for verified video reflections from past participants.

## 3. Data & CMS Fields
- `testimonialsLabel`: "Voices from the journey"
- `testimonialsTitle`: "What guests"
- `testimonialsEmphasis`: "carry home."
- API: `/api/public/testimonials` returning published `Testimonial` rows ordered by `sortOrder`.
