# Retreats Catalog & Booking Pipeline Skill

## 1. Overview
Manages the retreat catalog, five-day elemental itinerary structure, reservation creation, and customer contact enquiries.

## 2. Data Models (`prisma/schema.prisma`)
- **Retreat**: Core retreat record with slug, dates, capacity, location, price in paise (₹1 = 100 paise), and publication status.
- **RetreatDay / ItinerarySection / ItineraryActivity**: Hierarchical day-by-day itinerary mapped to the 5 elements.
- **Booking**: User reservation with unique reference (e.g. `BR-XXXXXX`), guest count, total paise, status, and payment tracking.
- **Enquiry**: General customer inquiries and contact requests.

## 3. Public Endpoints & Flows
- `POST /api/bookings`: Validates availability, creates user if necessary, generates booking reference, and stores reservation.
- `POST /api/public/enquiries`: Validates customer inquiry and stores in database.
- `GET /api/public/retreats/featured`: Returns current featured retreat with full itinerary details.
