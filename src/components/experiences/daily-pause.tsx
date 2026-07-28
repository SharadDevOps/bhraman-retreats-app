"use client";

import { useEffect, useState } from "react";
import { trackAnonymousProductEvent } from "@/lib/anonymous-analytics.mjs";
import { getDailyPause } from "@/lib/experience-model.mjs";
import { ExperiencePanel, RetreatExperienceCta } from "@/components/experiences/experience-shared";

export function DailyPause({ onExit }: { onExit: () => void }) {
  const [pause, setPause] = useState<ReturnType<typeof getDailyPause> | null>(null);
  const [complete, setComplete] = useState(false);
  useEffect(() => { setPause(getDailyPause()); }, []);
  const finish = () => { setComplete(true); trackAnonymousProductEvent("experience_completed", { experience: "daily-pause" }); };
  return (
    <ExperiencePanel eyebrow="Daily pause" title="One small practice for today." element="space" onExit={onExit}>
      <div className="daily-pause-card" aria-live="polite">{pause ? <><p className="eyebrow">Today · {pause.title}</p><blockquote>{pause.activity}</blockquote></> : <p>Your pause is arriving.</p>}</div>
      {!complete ? <button className="button button-light" type="button" onClick={finish} disabled={!pause}>I took this pause</button> : <div className="experience-completion" role="status"><p>That is enough for today.</p><RetreatExperienceCta source="daily-pause" /></div>}
    </ExperiencePanel>
  );
}