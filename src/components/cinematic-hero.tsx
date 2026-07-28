"use client";

import { ArrowDown, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigation } from "@/components/navigation";
import { ElementOrbit } from "@/components/hero/element-orbit";
import { HeroBackgroundReveal } from "@/components/hero/hero-background-reveal";
import { HeroContent } from "@/components/hero/hero-content";
import { OmIntro } from "@/components/hero/om-intro";
import { SkipIntroButton } from "@/components/hero/skip-intro-button";
import {
  getHeroStage,
  getSkipIntroResult,
  HERO_SEEN_KEY,
  resolveHeroMode,
  type HeroMode,
  type HeroStage,
} from "@/lib/hero-experience.mjs";
import type { HomeContent } from "@/lib/content";

type AmbientAudio = {
  context: AudioContext;
  gain: GainNode;
  source: AudioBufferSourceNode;
  timers: number[];
};

function persistIntroSeen() {
  try {
    window.localStorage.setItem(HERO_SEEN_KEY, "1");
  } catch {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }
}

export function CinematicHero({
  founderName = "Dr. Pratiksha Shekhawat",
  content,
  backgroundImageUrl,
}: {
  founderName?: string;
  content: HomeContent;
  backgroundImageUrl?: string;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const skippedRef = useRef(false);
  const audioRef = useRef<AmbientAudio | null>(null);
  const [mode, setMode] = useState<HeroMode>("full");
  const [stage, setStage] = useState<HeroStage>("opening");
  const [skipped, setSkipped] = useState(false);
  const [paused, setPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let hasSeenIntro = false;
    try {
      hasSeenIntro = window.localStorage.getItem(HERO_SEEN_KEY) === "1";
    } catch {
      // Treat blocked storage as a first visit.
    }

    const selectedMode = resolveHeroMode({
      prefersReducedMotion: motionPreference.matches,
      hasSeenIntro,
    });
    setMode(selectedMode);
    if (selectedMode === "reduced") {
      setStage("revealed");
      return;
    }

    let frame = 0;
    let startedAt = performance.now();
    let hiddenAt: number | null = null;
    let currentStage: HeroStage = "opening";

    const tick = (now: number) => {
      if (skippedRef.current) return;
      const nextStage = getHeroStage(now - startedAt, selectedMode);
      if (nextStage !== currentStage) {
        currentStage = nextStage;
        setStage(nextStage);
      }
      if (nextStage === "revealed") {
        persistIntroSeen();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const visibilityChanged = () => {
      if (document.hidden) {
        hiddenAt = performance.now();
        setPaused(true);
        cancelAnimationFrame(frame);
      } else {
        if (hiddenAt !== null) startedAt += performance.now() - hiddenAt;
        hiddenAt = null;
        setPaused(false);
        frame = requestAnimationFrame(tick);
      }
    };

    const motionChanged = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      cancelAnimationFrame(frame);
      setMode("reduced");
      setStage("revealed");
    };

    frame = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", visibilityChanged);
    motionPreference.addEventListener("change", motionChanged);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", visibilityChanged);
      motionPreference.removeEventListener("change", motionChanged);
    };
  }, []);

  useEffect(() => {
    const audioVisibilityChanged = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) void audio.context.suspend();
      else void audio.context.resume();
    };
    document.addEventListener("visibilitychange", audioVisibilityChanged);
    return () => {
      document.removeEventListener("visibilitychange", audioVisibilityChanged);
      const audio = audioRef.current;
      if (!audio) return;
      audio.timers.forEach(window.clearTimeout);
      try { audio.source.stop(); } catch { /* Already stopped. */ }
      void audio.context.close();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || stage !== "revealed") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (reducedMotion || coarsePointer || window.innerWidth < 768) return;

    let frame = 0;
    const update = (event?: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const pointerX = event ? (event.clientX / window.innerWidth - 0.5) * 2 : 0;
        const pointerY = event ? (event.clientY / window.innerHeight - 0.5) * 2 : 0;
        const scrollProgress = Math.min(1, window.scrollY / Math.max(hero.offsetHeight, 1));
        hero.style.setProperty("--parallax-x", `${pointerX * -8}px`);
        hero.style.setProperty("--parallax-y", `${scrollProgress * 64 + pointerY * -5}px`);
        frame = 0;
      });
    };
    const pointerMoved = (event: PointerEvent) => update(event);
    const scrolled = () => update();
    window.addEventListener("pointermove", pointerMoved, { passive: true });
    window.addEventListener("scroll", scrolled, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", pointerMoved);
      window.removeEventListener("scroll", scrolled);
    };
  }, [stage]);

  const stopWind = (fadeSeconds = 0.45) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.timers.forEach(window.clearTimeout);
    audio.gain.gain.cancelScheduledValues(audio.context.currentTime);
    audio.gain.gain.setValueAtTime(Math.max(audio.gain.gain.value, 0.001), audio.context.currentTime);
    audio.gain.gain.exponentialRampToValueAtTime(0.001, audio.context.currentTime + fadeSeconds);
    const timer = window.setTimeout(() => {
      try { audio.source.stop(); } catch { /* Already stopped. */ }
      void audio.context.close();
    }, fadeSeconds * 1000 + 100);
    audio.timers = [timer];
    audioRef.current = null;
    setSoundOn(false);
  };

  const toggleWind = () => {
    if (audioRef.current) {
      stopWind();
      return;
    }
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const channel = buffer.getChannelData(0);
    let last = 0;
    for (let index = 0; index < channel.length; index += 1) {
      last = last * 0.985 + (Math.random() * 2 - 1) * 0.015;
      channel[index] = last * 3.2;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = "lowpass";
    filter.frequency.value = 720;
    gain.gain.value = 0.001;
    source.connect(filter).connect(gain).connect(context.destination);
    source.start();
    gain.gain.exponentialRampToValueAtTime(0.09, context.currentTime + 1.3);
    const audio: AmbientAudio = { context, gain, source, timers: [] };
    audioRef.current = audio;
    setSoundOn(true);
  };

  const skipIntro = () => {
    const result = getSkipIntroResult();
    skippedRef.current = true;
    setSkipped(true);
    setStage(result.stage);
    if (result.persistSeen) persistIntroSeen();
    stopWind(0.25);
  };

  return (
    <section
      ref={heroRef}
      className="hero cinematic-hero"
      data-intro-stage={stage}
      data-intro-mode={mode}
      data-paused={paused ? "true" : "false"}
      aria-label="Bhraman Retreats introduction"
    >
      <HeroBackgroundReveal imageUrl={backgroundImageUrl} />
      <div className="hero-opening-shade" aria-hidden="true" />
      <OmIntro mode={mode} skipped={skipped} />
      <ElementOrbit stage={stage} />
      <div className="hero-intro-mist" aria-hidden="true"><i /><i /></div>

      <Navigation />
      <HeroContent content={content} founderName={founderName} />

      <div className="intro-controls" aria-label="Intro controls">
        <button
          className="sound-opt-in"
          type="button"
          onClick={toggleWind}
          aria-pressed={soundOn}
          aria-label={soundOn ? "Disable ambient wind sound" : "Enable ambient wind sound"}
        >
          {soundOn ? <Volume2 size={15} aria-hidden="true" /> : <VolumeX size={15} aria-hidden="true" />}
          {soundOn ? "Sound on" : "Sound opt-in"}
        </button>
        <SkipIntroButton onSkip={skipIntro} hidden={stage === "revealed"} />
      </div>

      <a href="#philosophy" className="scroll-cue"><ArrowDown size={17} aria-hidden="true" /> Scroll to journey</a>
    </section>
  );
}