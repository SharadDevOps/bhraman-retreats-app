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
import { elements } from "@/data/retreat";
import { formatDateRange, getSiteData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { retreat, testimonials, media } = await getSiteData();
  const start = new Date(retreat.startDate);
  const end = new Date(retreat.endDate);
  const price = `₹${(retreat.priceInPaise / 100).toLocaleString("en-IN")}`;
  return <main id="top">
    <ScrollReveal />
    <CinematicHero />

    <section className="manifesto section" id="philosophy">
      <div><SectionLabel>The Bhraman way</SectionLabel><span className="botanical" aria-hidden="true">❦</span></div>
      <div><EditorialHeading>Nature is not the backdrop.<br /><em>Nature is the medicine.</em></EditorialHeading><p>In the heart of the Himalayas, every breath of air and every grain of soil whispers an ancient truth: all life arises from Earth, Water, Fire, Air and Space.</p><p>Our intimate retreats weave elemental therapy, yoga, sattvik food and slow travel into a rhythm where the body can soften and the mind can become clear.</p><SecondaryButton href="#elements" showArrow>Walk through the five elements</SecondaryButton></div>
    </section>

    <section className="elements-section" id="elements">
      <SectionContainer className="section-heading"><div><SectionLabel>Panch Mahābhūta</SectionLabel><EditorialHeading>Five pathways<br />back to <em>balance.</em></EditorialHeading></div><p>Each element holds a distinct quality. Together, they create a complete journey through body, breath, energy and awareness.</p></SectionContainer>
      <SectionContainer className="element-grid">{elements.map((element) => <article className={`element-card ${element.key}`} key={element.key}><ElementBadge number={element.symbol} label={element.sanskrit} /><h3>{element.name}</h3><strong>{element.verb}</strong><div className="element-reveal"><span>{element.practice}</span><p>{element.detail}</p></div></article>)}</SectionContainer>
    </section>

    <section className="retreat-section" id="retreat">
      <div className="retreat-art"><ResponsiveMedia src={media.retreat} alt={retreat.title} fallbackTitle={retreat.title} fallbackHint="Retreat image reference not configured" priority /><RetreatDateBadge start={start} end={end} /></div>
      <div className="retreat-copy"><SectionLabel>Next Bhraman journey</SectionLabel><EditorialHeading>{retreat.title}</EditorialHeading><p className="lead">{retreat.summary}</p>{retreat.highlight && <p className="retreat-highlight"><Sparkles size={16} aria-hidden="true" /> Highlight · {retreat.highlight}</p>}<div className="retreat-meta"><span><MapPin /> {retreat.location}</span><span><CalendarDays /> {formatDateRange(start, end)}</span></div><div className="price-row"><div><small>All-inclusive retreat</small><strong>{price} <i>/ person</i></strong></div><span>Limited to an intimate circle</span></div><PrimaryButton href="#booking">View retreat & reserve</PrimaryButton></div>
    </section>

    <section className="itinerary-section section" id="itinerary"><SectionContainer className="section-heading compact"><div><SectionLabel>Your five-day rhythm</SectionLabel><EditorialHeading>A journey that<br /><em>unfolds slowly.</em></EditorialHeading></div><p>Every day honours one element through movement, traditional practice, conscious nourishment and reflection.</p></SectionContainer><Itinerary /></section>

    <section className="founder-section" id="founder"><Fireflies /><div className="founder-copy"><Sparkles size={28} /><SectionLabel className="light">Meet your guide</SectionLabel><EditorialHeading>Rooted in medicine.<br /><em>Guided by nature.</em></EditorialHeading><QuoteBlock>Nature holds everything we need to heal. We only have to learn how to listen again.</QuoteBlock><p>Dr. Pratiksha Shekhawat · Doctor, yoga and elemental therapist</p><SecondaryButton href="#booking" onDark showArrow>Begin your journey</SecondaryButton></div><div className="founder-image"><ResponsiveMedia src={media.founder} alt="Dr. Pratiksha Shekhawat" fallbackTitle="Meet Dr. Pratiksha" fallbackHint="Guide image reference not configured" /></div></section>

    {testimonials.length > 0 && (
      <section className="testimonials-section section" id="testimonials">
        <SectionContainer className="section-heading compact"><div><SectionLabel>Voices from the journey</SectionLabel><EditorialHeading>What guests<br /><em>carry home.</em></EditorialHeading></div></SectionContainer>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <QuoteBlock className="testimonial-card" key={i} attribution={<><strong>{t.name}</strong>{t.location && <span>{t.location}</span>}</>}>{t.quote}</QuoteBlock>
          ))}
        </div>
      </section>
    )}

    <section className="closing" id="booking">
      <SectionLabel>Your next journey awaits</SectionLabel>
      <EditorialHeading>Come back to what<br /><em>feels essential.</em></EditorialHeading>
      <p>Join the next Bhraman retreat and experience life in its natural rhythm.</p>
      <BookingForm priceInPaise={retreat.priceInPaise} />
    </section>
    <footer><a className="brand footer-brand" href="#top"><BrandLogo tone="light" /></a><p>Silence as teacher · Element as medicine · Nature as guide</p><div><a href="#retreat">Retreats</a><a href="#itinerary">Itinerary</a><a href="#">Instagram</a><a href="#">Contact</a></div><small>© 2026 Bhraman Retreats. All rights reserved.</small></footer>
  </main>;
}
