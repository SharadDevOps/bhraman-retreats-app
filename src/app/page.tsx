import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { BookingForm } from "@/components/booking-form";
import { CinematicHero } from "@/components/cinematic-hero";
import {
  EditorialHeading,
  ElementBadge,
  PrimaryButton,
  QuoteBlock,
  ResponsiveMedia,
  RetreatDateBadge,
  SecondaryButton,
  SectionContainer,
  SectionLabel,
} from "@/components/design-system";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Fireflies } from "@/components/nature-effects";
import { Itinerary } from "@/components/itinerary";
import { formatDateRange, getSiteData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { retreat, testimonials, media, itinerary, founder, elements, content, founderQuote } = await getSiteData();
  const start = new Date(retreat.startDate);
  const end = new Date(retreat.endDate);
  const price = `₹${(retreat.priceInPaise / 100).toLocaleString("en-IN")}`;
  return <main id="top">
    <ScrollReveal />
    <CinematicHero founderName={founder.name} content={content} />

    <section className="manifesto section" id="philosophy">
      <div><SectionLabel>{content.philosophyLabel}</SectionLabel><span className="botanical" aria-hidden="true">❦</span></div>
      <div><EditorialHeading>{content.philosophyTitle}<br /><em>{content.philosophyEmphasis}</em></EditorialHeading>{content.philosophyParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<SecondaryButton href="#elements" showArrow>{content.philosophyCta}</SecondaryButton></div>
    </section>

    <section className="elements-section" id="elements">
      <SectionContainer className="section-heading"><div><SectionLabel>{content.elementsLabel}</SectionLabel><EditorialHeading>{content.elementsTitle}<br /><em>{content.elementsEmphasis}</em></EditorialHeading></div><p>{content.elementsIntro}</p></SectionContainer>
      <SectionContainer className="element-grid">{elements.map((element) => <article className={`element-card ${element.key}`} key={element.key}><ElementBadge number={element.symbol} label={element.sanskrit} /><h3>{element.name}</h3><strong>{element.verb}</strong><div className="element-reveal"><span>{element.practice}</span><p>{element.detail}</p></div></article>)}</SectionContainer>
    </section>

    <section className="retreat-section" id="retreat">
      <div className="retreat-art"><ResponsiveMedia src={media.retreat} alt={retreat.title} fallbackTitle={retreat.title} fallbackHint="Retreat image reference not configured" priority /><RetreatDateBadge start={start} end={end} /></div>
      <div className="retreat-copy"><SectionLabel>Next Bhraman journey</SectionLabel><EditorialHeading>{retreat.title}</EditorialHeading><p className="lead">{retreat.summary}</p>{retreat.highlight && <p className="retreat-highlight"><Sparkles size={16} aria-hidden="true" /> Highlight · {retreat.highlight}</p>}<div className="retreat-meta"><span><MapPin /> {retreat.location}</span><span><CalendarDays /> {formatDateRange(start, end)}</span></div><div className="price-row"><div><small>All-inclusive retreat</small><strong>{price} <i>/ person</i></strong></div><span>Limited to an intimate circle</span></div><PrimaryButton href="#booking">View retreat & reserve</PrimaryButton></div>
    </section>

    <section className="itinerary-section section" id="itinerary"><SectionContainer className="section-heading compact"><div><SectionLabel>{content.itineraryLabel}</SectionLabel><EditorialHeading>{content.itineraryTitle}<br /><em>{content.itineraryEmphasis}</em></EditorialHeading></div><p>{content.itineraryIntro}</p></SectionContainer><Itinerary items={itinerary} scheduleNote={content.itineraryNote} /></section>

    <section className="founder-section" id="founder"><Fireflies /><div className="founder-copy"><Sparkles size={28} /><SectionLabel className="light">{content.founderLabel}</SectionLabel><EditorialHeading>{content.founderTitle}<br /><em>{content.founderEmphasis}</em></EditorialHeading><QuoteBlock>{founderQuote}</QuoteBlock><p>{founder.name} · {founder.title}</p><SecondaryButton href="#booking" onDark showArrow>Begin your journey</SecondaryButton></div><div className="founder-image"><ResponsiveMedia src={media.founder} alt={founder.name} fallbackTitle={`Meet ${founder.name}`} fallbackHint="Guide image reference not configured" /></div></section>

    {testimonials.length > 0 && (
      <section className="testimonials-section section" id="testimonials">
        <SectionContainer className="section-heading compact"><div><SectionLabel>{content.testimonialsLabel}</SectionLabel><EditorialHeading>{content.testimonialsTitle}<br /><em>{content.testimonialsEmphasis}</em></EditorialHeading></div></SectionContainer>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <QuoteBlock className="testimonial-card" key={i} attribution={<><strong>{t.name}</strong>{t.location && <span>{t.location}</span>}</>}>{t.quote}</QuoteBlock>
          ))}
        </div>
      </section>
    )}

    <section className="closing" id="booking">
      <SectionLabel>{content.closingLabel}</SectionLabel>
      <EditorialHeading>{content.closingTitle}<br /><em>{content.closingEmphasis}</em></EditorialHeading>
      <p>{content.closingCopy}</p>
      <BookingForm priceInPaise={retreat.priceInPaise} />
    </section>
    <footer><a className="brand footer-brand" href="#top"><BrandLogo tone="light" /></a><p>{content.footerTagline}</p><div><a href="#retreat">Retreats</a><a href="#itinerary">Itinerary</a><a href="#">Instagram</a><a href="#">Contact</a></div><small>© 2026 Bhraman Retreats. All rights reserved.</small></footer>
  </main>;
}
