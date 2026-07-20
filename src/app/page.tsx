import { ArrowDown, ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { BookingForm } from "@/components/booking-form";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Fireflies, HeroNature } from "@/components/nature-effects";
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
    <section className="hero">
      <Navigation /><div className="orbit orbit-one" /><div className="orbit orbit-two" /><HeroNature />
      <div className="hero-content">
        <p className="eyebrow light">Elemental retreats · Himalayas, India</p>
        <h1>Remember your<br /><em>natural rhythm.</em></h1>
        <p className="hero-copy">Five elements. Five days. One quiet return to the part of you that never forgot how to be whole.</p>
        <div className="hero-actions"><a className="button button-light" href="#retreat">Explore the retreat <ArrowRight size={18} /></a><a className="text-link light" href="#philosophy">Discover our philosophy</a></div>
      </div>
      <div className="element-wheel" aria-hidden="true"><span className="wheel-center">ॐ</span><span className="wheel-label earth-label">Earth</span><span className="wheel-label water-label">Water</span><span className="wheel-label fire-label">Fire</span><span className="wheel-label air-label">Air</span><span className="wheel-label space-label">Space</span></div>
      <a href="#philosophy" className="scroll-cue"><ArrowDown size={17} /> Scroll to journey</a>
    </section>

    <section className="manifesto section" id="philosophy">
      <div><p className="eyebrow">The Bhraman way</p><span className="botanical" aria-hidden="true">❦</span></div>
      <div><h2>Nature is not the backdrop.<br /><em>Nature is the medicine.</em></h2><p>In the heart of the Himalayas, every breath of air and every grain of soil whispers an ancient truth: all life arises from Earth, Water, Fire, Air and Space.</p><p>Our intimate retreats weave elemental therapy, yoga, sattvik food and slow travel into a rhythm where the body can soften and the mind can become clear.</p><a className="text-link" href="#elements">Walk through the five elements <ArrowRight size={17} /></a></div>
    </section>

    <section className="elements-section" id="elements">
      <div className="section-heading"><div><p className="eyebrow">Panch Mahābhūta</p><h2>Five pathways<br />back to <em>balance.</em></h2></div><p>Each element holds a distinct quality. Together, they create a complete journey through body, breath, energy and awareness.</p></div>
      <div className="element-grid">{elements.map((element) => <article className={`element-card ${element.key}`} key={element.key}><div className="element-number">{element.symbol}</div><p>{element.sanskrit}</p><h3>{element.name}</h3><strong>{element.verb}</strong><div className="element-reveal"><span>{element.practice}</span><p>{element.detail}</p></div></article>)}</div>
    </section>

    <section className="retreat-section" id="retreat">
      <div className="retreat-art">{media.retreat ? <img className="slot-img" src={media.retreat} alt={retreat.title} /> : <span className="image-placeholder">Your retreat image<br /><small>Manage from admin</small></span>}<div className="date-stamp"><span>{start.getDate()}—{end.getDate()}</span><small>{end.toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}<br />{end.getFullYear()}</small></div></div>
      <div className="retreat-copy"><p className="eyebrow">Upcoming retreat{retreat.edition ? ` · ${retreat.edition}` : ""}</p><h2>An elemental<br /><em>journey.</em></h2><p className="lead">{retreat.summary}</p><div className="retreat-meta"><span><MapPin /> {retreat.location}</span><span><CalendarDays /> {formatDateRange(start, end)}</span></div><div className="price-row"><div><small>All-inclusive retreat</small><strong>{price} <i>/ person</i></strong></div><span>Limited to an intimate circle</span></div><a className="button button-dark" href="#booking">View retreat & reserve <ArrowRight size={18} /></a></div>
    </section>

    <section className="itinerary-section section" id="itinerary"><div className="section-heading compact"><div><p className="eyebrow">Your five-day rhythm</p><h2>A journey that<br /><em>unfolds slowly.</em></h2></div><p>Every day honours one element through movement, traditional practice, conscious nourishment and reflection.</p></div><Itinerary /></section>

    <section className="founder-section"><Fireflies /><div className="founder-copy"><Sparkles size={28} /><p className="eyebrow light">Meet your guide</p><h2>Rooted in medicine.<br /><em>Guided by nature.</em></h2><blockquote>“Nature holds everything we need to heal. We only have to learn how to listen again.”</blockquote><p>Dr. Pratiksha Shekhawat · Doctor, yoga and elemental therapist</p><a className="text-link light" href="#founder">Meet Dr. Pratiksha <ArrowRight size={17} /></a></div><div className="founder-image">{media.founder ? <img className="slot-img" src={media.founder} alt="Dr. Pratiksha Shekhawat" /> : <span className="image-placeholder">Founder portrait<br /><small>Manage from admin</small></span>}</div></section>

    {testimonials.length > 0 && (
      <section className="testimonials-section section" id="testimonials">
        <div className="section-heading compact"><div><p className="eyebrow">Voices from the forest</p><h2>What guests<br /><em>carry home.</em></h2></div></div>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <figure className="testimonial-card" key={i}>
              <blockquote>“{t.quote}”</blockquote>
              <figcaption><strong>{t.name}</strong>{t.location && <span>{t.location}</span>}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    )}

    <section className="closing" id="booking">
      <p className="eyebrow">The forest is waiting</p>
      <h2>Come back to what<br /><em>feels essential.</em></h2>
      <p>Join the first Bhraman Forest Edition and experience life in its natural rhythm.</p>
      <BookingForm priceInPaise={retreat.priceInPaise} />
    </section>
    <footer><a className="brand footer-brand" href="#top"><span className="brand-mark">भ</span><span>Bhraman <i>Retreats</i></span></a><p>Silence as teacher · Element as medicine · Nature as guide</p><div><a href="#retreat">Retreats</a><a href="#itinerary">Itinerary</a><a href="#">Instagram</a><a href="#">Contact</a></div><small>© 2026 Bhraman Retreats. All rights reserved.</small></footer>
  </main>;
}
