"use client";

import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { trackAnonymousProductEvent } from "@/lib/anonymous-analytics.mjs";
import type { ElementKey } from "@/lib/experience-model.mjs";

export function ExperiencePanel({ eyebrow, title, element, onExit, children }: { eyebrow: string; title: string; element: ElementKey; onExit: () => void; children: ReactNode }) {
  return (
    <article className="experience-panel" data-element={element}>
      <header>
        <div><p className="eyebrow">{eyebrow}</p><h3>{title}</h3></div>
        <button className="experience-exit" type="button" onClick={onExit}><ArrowLeft aria-hidden="true" /> All experiences</button>
      </header>
      {children}
    </article>
  );
}

export function RetreatExperienceCta({ source }: { source: string }) {
  return <a className="button button-light experience-retreat-cta" href="#retreat" onClick={() => trackAnonymousProductEvent("retreat_cta_clicked", { source })}>Explore the Retreat <ArrowRight aria-hidden="true" /></a>;
}