# Admin Panel & CMS Management Skill

## 1. Overview
The admin dashboard at `/admin` (`src/app/admin/page.tsx`) provides authenticated content management for site settings, retreat editions, guest testimonials, and media assignments.

## 2. Architecture & Authentication
- **Authentication** (`src/lib/admin-auth.ts`, `src/app/api/admin/login/route.ts`): HMAC-signed session cookies (`admin_session`) secured with `ADMIN_PASSWORD`.
- **Role Enforcement**: `CONTENT_EDITOR`, `BOOKING_MANAGER`, `SUPER_ADMIN` authorization checks on all API endpoints.

## 3. Tabs & Capabilities
- **Content Tab**: Edit hero copy, tagline, and philosophy reflection paragraphs with direct persistence to the `SiteSetting` key `home.content`.
- **Retreats Tab** (`src/components/admin/retreats-manager.tsx`): Create/edit retreats, pricing in paise, dates, capacities, and itinerary activities.
- **Testimonials Tab**: Add, reorder, and edit guest reflections and portrait URLs.
- **Images Tab**: Review uploaded media and assign assets to designated homepage slots (`hero`, `retreat`, `founder`, `bg.philosophy`, `bg.upcoming-retreats`, `bg.testimonials`).
- **Bookings & Enquiries**: View incoming reservations, payment status, and contact enquiries.

## 4. Best Practices
- Never commit admin secrets to git.
- Validate CMS mutations using `src/lib/cms-validation.mjs`.
