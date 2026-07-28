"use client";

import { useEffect, useState } from "react";
import { trackAnonymousProductEvent } from "@/lib/anonymous-analytics.mjs";
import { INTENTIONS } from "@/lib/experience-model.mjs";
import { ExperiencePanel, RetreatExperienceCta } from "@/components/experiences/experience-shared";

const INTENTION_KEY = "bhraman.experience.intention.v1";

export function IntentionExperience({ onExit }: { onExit: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { try { setSelected(localStorage.getItem(INTENTION_KEY)); } catch { /* Optional storage. */ } }, []);
  const intention = INTENTIONS.find((item) => item.id === selected);
  const choose = (id: string) => {
    setSelected(id);
    try { localStorage.setItem(INTENTION_KEY, id); } catch { /* Optional storage. */ }
    trackAnonymousProductEvent("intention_selected", { intention: id });
    trackAnonymousProductEvent("experience_completed", { experience: "intention" });
  };
  return (
    <ExperiencePanel eyebrow="Choose your intention" title="What would you like to make room for?" element={(intention?.element ?? "space")} onExit={onExit}>
      <fieldset className="experience-options"><legend>Choose one intention</legend>{INTENTIONS.map((item) => <button className={selected === item.id ? "selected" : ""} type="button" aria-pressed={selected === item.id} key={item.id} onClick={() => choose(item.id)}><span>{item.label}</span></button>)}</fieldset>
      {intention && <div className="intention-result" role="status"><p className="eyebrow">Your intention · {intention.label}</p><blockquote>{intention.response}</blockquote><RetreatExperienceCta source="intention" /></div>}
    </ExperiencePanel>
  );
}