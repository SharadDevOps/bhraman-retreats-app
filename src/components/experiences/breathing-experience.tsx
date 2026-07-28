"use client";

import { Bell, BellOff, Pause, Play, RefreshCw, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trackAnonymousProductEvent } from "@/lib/anonymous-analytics.mjs";
import { BREATHING_TOTAL_MS, getBreathingState } from "@/lib/experience-model.mjs";
import { ExperiencePanel, RetreatExperienceCta } from "@/components/experiences/experience-shared";

type Status = "ready" | "running" | "paused" | "complete";

export function BreathingExperience({ onExit }: { onExit: () => void }) {
  const [status, setStatus] = useState<Status>("ready");
  const [elapsed, setElapsed] = useState(0);
  const [bellOn, setBellOn] = useState(false);
  const [hapticOn, setHapticOn] = useState(false);
  const [hapticSupported, setHapticSupported] = useState(false);
  const phaseRef = useRef("inhale");
  const completionTrackedRef = useRef(false);
  const bellContextRef = useRef<AudioContext | null>(null);
  const state = getBreathingState(elapsed);

  useEffect(() => {
    setHapticSupported(typeof navigator !== "undefined" && typeof navigator.vibrate === "function");
    return () => { if (bellContextRef.current) void bellContextRef.current.close(); };
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    const baseline = performance.now() - elapsed;
    const timer = window.setInterval(() => {
      const nextElapsed = Math.min(BREATHING_TOTAL_MS, performance.now() - baseline);
      setElapsed(nextElapsed);
      if (nextElapsed >= BREATHING_TOTAL_MS) {
        setStatus("complete");
        if (!completionTrackedRef.current) {
          completionTrackedRef.current = true;
          trackAnonymousProductEvent("experience_completed", { experience: "breathing" });
        }
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status !== "running" || state.phase === phaseRef.current) return;
    phaseRef.current = state.phase;
    if (hapticOn && hapticSupported) navigator.vibrate(state.phase === "exhale" ? 45 : 25);
    if (bellOn && bellContextRef.current) {
      const context = bellContextRef.current;
      void context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = state.phase === "exhale" ? 528 : 660;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.48);
    }
  }, [bellOn, hapticOn, hapticSupported, state.phase, status]);

  const toggleBell = () => {
    const next = !bellOn;
    if (next && !bellContextRef.current && window.AudioContext) bellContextRef.current = new AudioContext();
    setBellOn(next);
  };
  const restart = () => { phaseRef.current = "inhale"; completionTrackedRef.current = false; setElapsed(0); setStatus("running"); };

  return (
    <ExperiencePanel eyebrow="One-minute breathing" title="Return to one quiet rhythm." element="air" onExit={onExit}>
      <div className={`breathing-visual breathing-${state.phase}`} style={{ "--breath-progress": `${state.progress * 100}%` } as React.CSSProperties} aria-hidden="true"><i /><span>{Math.ceil(state.remainingMs / 1000)}</span></div>
      <div className="breathing-readout" aria-live="polite" aria-atomic="true"><strong>{state.label}</strong><span>{status === "complete" ? "Five cycles complete" : `Cycle ${state.cycle} of 5 · ${Math.ceil(state.totalRemainingMs / 1000)} seconds remaining`}</span></div>
      <div className="experience-controls">
        {status === "ready" && <button className="button button-light" type="button" onClick={() => setStatus("running")}><Play aria-hidden="true" /> Begin</button>}
        {status === "running" && <button type="button" onClick={() => setStatus("paused")}><Pause aria-hidden="true" /> Pause</button>}
        {status === "paused" && <button type="button" onClick={() => setStatus("running")}><Play aria-hidden="true" /> Continue</button>}
        <button type="button" onClick={restart}><RefreshCw aria-hidden="true" /> Restart</button>
        <button type="button" aria-pressed={bellOn} onClick={toggleBell}>{bellOn ? <Bell aria-hidden="true" /> : <BellOff aria-hidden="true" />} Bell {bellOn ? "on" : "off"}</button>
        {hapticSupported && <button type="button" aria-pressed={hapticOn} onClick={() => setHapticOn(!hapticOn)}><Smartphone aria-hidden="true" /> Haptic {hapticOn ? "on" : "off"}</button>}
      </div>
      {status === "complete" && <div className="experience-completion"><p>Notice what changed, without needing to name it.</p><RetreatExperienceCta source="breathing" /></div>}
    </ExperiencePanel>
  );
}