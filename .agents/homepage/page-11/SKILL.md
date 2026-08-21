# Homepage Section: Page 11 — Your Next Journey Starts Here

## 1. Overview
Page 11 (`<section className="closing" id="enquiry">`) invites prospective participants to begin their journey and ask questions.

## 2. Key Components & Implementation
- **Component**: `EnquiryForm` (`src/components/enquiry-form.tsx`).
- **Form Fields**: Full name, email address, optional phone number, guest count, and personalized message / intentions.
- **Submission API**: `POST /api/public/enquiries` saving validated record to PostgreSQL table `Enquiry`.
- **User Feedback**: Instant validation, loading spinners, and success confirmation message.

## 3. Data & CMS Fields (`home.content`)
- `enquiryLabel`: "Begin a conversation"
- `enquiryTitle`: "Your next journey"
- `enquiryEmphasis`: "starts here."
- `enquiryCopy`: "Tell us what is drawing you toward Bhraman. Our team will respond with thoughtful guidance."
