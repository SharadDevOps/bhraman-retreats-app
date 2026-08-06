import type { Metadata } from "next";
import { ArrowDown, CalendarDays, MapPin } from "lucide-react";
import { headers } from "next/headers";
import {
  EditorialHeading,
  PrimaryButton,
  ResponsiveMedia,
  RetreatDateBadge,
  SecondaryButton,
  SectionLabel,
} from "@/components/design-system";
import { formatDateRange, getUpcomingRetreats } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upcoming Retreats | Bhraman Retreats",
  description: "Explore every upcoming Bhraman journey — dates, locations and booking status.",
};

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  BOOKING_OPEN: { label: "Booking Open", className: "status-open" },
  SOLD_OUT: { label: "Sold Out", className: "status-soldout" },
  ENQUIRY: { label: "By Enquiry", className: "status-enquiry" },
  UPCOMING: { label: "Booking Opens Soon", className: "status-soon" },
};

function statusBadge(status: string) {
  return STATUS_BADGES[status] ?? STATUS_BADGES.UPCOMING;
}

async function origin() {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "localhost:3000";
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export default async function UpcomingRetreatsPage() {
  const retreats = await getUpcomingRetreats(await origin());

  return (
    <main className="retreats-page">
      <section className="retreats-hero">
        <SectionLabel className="light">Bhraman journeys</SectionLabel>
        <h1 className="retreats-hero-title">Upcoming <em>Retreats</em></h1>
        <p>Three intimate journeys through the Himalayas. Choose the one that calls to you — the soonest departure leads, with more to follow.</p>
        {retreats.length > 0 && <a className="retreats-scroll-cue" href="#all"><ArrowDown size={16} aria-hidden="true" /> Scroll to explore</a>}
      </section>

      {retreats.length > 0 ? (
        <section id="all" className="retreats-list">
          {retreats.map((item, index) => {
            const badge = statusBadge(item.status);
            return (
              <article className={`upcoming-card${index === 0 ? " is-lead" : ""}`} key={item.slug}>
                <div className="upcoming-card-art">
                  <ResponsiveMedia
                    src={item.heroImageUrl ?? undefined}
                    alt={item.title}
                    fallbackTitle={item.title}
                    fallbackHint="Retreat imagery is being prepared"
                  />
                  <RetreatDateBadge start={new Date(item.startDate)} end={new Date(item.endDate)} />
                  <span className={`retreat-status ${badge.className}`}>{badge.label}</span>
                </div>
                <div className="upcoming-card-copy">
                  {index === 0 && <span className="upcoming-lead-tag">Next departure</span>}
                  {item.edition && <span className="upcoming-edition">{item.edition}</span>}
                  <h3>{item.title}</h3>
                  <p className="upcoming-summary">{item.summary}</p>
                  <div className="upcoming-meta">
                    <span><MapPin /> {item.location}</span>
                    <span><CalendarDays /> {formatDateRange(new Date(item.startDate), new Date(item.endDate))}</span>
                  </div>
                  <div className="upcoming-card-foot">
                    <strong>₹{(item.priceInPaise / 100).toLocaleString("en-IN")} <i>/ person</i></strong>
                    <SecondaryButton href="/#enquiry" showArrow>Enquire</SecondaryButton>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="retreats-page-empty">
          <EditorialHeading>New journeys are taking shape.</EditorialHeading>
          <p>No retreats are scheduled right now. Leave an enquiry and we will share details as soon as they are ready.</p>
          <PrimaryButton href="/#enquiry">Enquire about a future journey</PrimaryButton>
        </section>
      )}
    </main>
  );
}
