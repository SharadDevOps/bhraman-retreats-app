import { EditorialHeading, PrimaryButton, SecondaryButton, SectionLabel } from "@/components/design-system";
import { HERO_CTAS } from "@/lib/hero-experience.mjs";
import type { HomeContent } from "@/lib/content";

export function HeroContent({ content, founderName }: { content: HomeContent; founderName: string }) {
  return (
    <div className="hero-content">
      <SectionLabel className="light">{content.heroEyebrow}</SectionLabel>
      <EditorialHeading as="h1">{content.heroTitle}<br /><em>{content.heroEmphasis}</em></EditorialHeading>
      <p className="hero-copy">{content.heroCopy}</p>
      <p className="hero-founder-credit">Founded and guided by <strong>{founderName}</strong></p>
      <div className="hero-actions" aria-label="Hero actions">
        <PrimaryButton href={HERO_CTAS.primary.href} aria-label={HERO_CTAS.primary.label} onDark>{HERO_CTAS.primary.label}</PrimaryButton>
        <SecondaryButton href={HERO_CTAS.secondary.href} aria-label={HERO_CTAS.secondary.label} onDark>{HERO_CTAS.secondary.label}</SecondaryButton>
      </div>
    </div>
  );
}