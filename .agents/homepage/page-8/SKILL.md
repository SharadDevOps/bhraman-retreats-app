# Homepage Section: Page 8 — Previous Retreat Memories (Moments Carried Home)

## 1. Overview
Page 8 (`<section className="memories-section section" id="memories">`) is a dynamic, editorial visual journal of past journeys lived. It builds trust for upcoming retreats by showcasing where past retreats took place, what the venue and experiences felt like, and authentic reflections from participants.

## 2. Key Components & Editorial Structure
1. **Section Intro**: Eyebrow `PREVIOUS RETREAT MEMORIES`, Heading `Moments carried home.`, Subtitle copy.
2. **Past Retreat Selector Tabs**: Lightweight pills (`.memories-retreat-selector`) allowing seamless switching between past completed editions (`LADAKH EDITION 1.0`, etc.) without page reload.
3. **Selected Retreat Hero & Metadata**:
   - Cover hero photograph with soft gradient overlay.
   - Edition badge, title, location, venue (e.g. `Lamayuru Monastery`), dates span, participant count (`18 travellers`).
   - Highlight blockquote with burnt-orange accent.
4. **Retreat Story Narrative**: Editorial headline (`storyTitle`) and narrative paragraphs (`storyBody`).
5. **Category Filter Chips**: Dynamic filters (`All`, `Arrival`, `Practice`, `Yoga`, `Meditation`, `Nature`, `Monastery`, `Food`, `Community`, `Ceremony`, `Closing`).
6. **Asymmetric Editorial Journal Grid**: Travel journal / magazine layout with landscape moments, paired portrait photographs, full-width monastery highlights, and hover zoom reveals.
7. **Full-Screen Interactive Lightbox**:
   - High-res photo viewer with category tag, caption, photographer credit, index counter.
   - Keyboard navigation (`ArrowLeft`, `ArrowRight`, `Escape` to close), previous/next buttons, and mobile swipe.
8. **Video Memories**: Non-autoplay cards with poster preview, duration badge, and modal video player.
9. **Participant Reflection Quotes**: Interspersed testimonials and guest reflections.
10. **Closing CTA**: *Some journeys end. Some stay with you.* → `EXPLORE THE NEXT RETREAT →` (smoothly navigates to `#retreat`).
11. **Graceful Empty State**: *“More Bhraman stories will arrive here soon.”* (No broken UI or large generic placeholders).

## 3. Data & Dynamic Admin Media Management
- **Backend Model**: `Retreat` (with `venue`, `storyTitle`, `storyBody`, `participantCount`, `displayOrder`, `media: MediaAsset[]`) and `MediaAsset` (with `retreatId`, `category`, `isCover`, `isFeatured`, `displayOrder`, `posterUrl`).
- **Admin Panel**:
  - Full CRUD for completed retreats with past retreat status.
  - Multi-file batch upload directly to Azure Blob storage (`retreats/:slug/gallery`, `retreats/:slug/videos`).
  - Categorization, captions, alt-text editing, cover photo selection, and reordering.
- **Public API**:
  - `GET /api/public/retreats/completed`
  - `GET /api/public/retreats/[slug]/media`
  - `GET /api/public/retreats/[slug]/testimonials`
