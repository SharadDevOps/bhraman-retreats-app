"use client";

import { ArrowDown, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigation } from "@/components/navigation";
import { EditorialHeading, PrimaryButton, SecondaryButton, SectionLabel } from "@/components/design-system";

type Particle = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  targetX: number;
  targetY: number;
  scatterX: number;
  scatterY: number;
  size: number;
  phase: number;
};

const FORM_START = 900;
const FORM_END = 3200;
const DISSOLVE_START = 5200;
const DISSOLVE_END = 6800;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);
const easeInOut = (value: number) => value < 0.5
  ? 4 * value * value * value
  : 1 - Math.pow(-2 * value + 2, 3) / 2;

export function CinematicHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const skipRef = useRef(false);
  const audioRef = useRef<{ context: AudioContext; gain: GainNode; source: AudioBufferSourceNode } | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => () => {
    if (!audioRef.current) return;
    audioRef.current.source.stop();
    audioRef.current.context.close();
    audioRef.current = null;
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      hero.classList.add("intro-complete");
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let animationFrame = 0;
    let startedAt = performance.now();
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let visible = true;
    let parallaxFrame = 0;

    const createParticles = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const sampleSize = Math.min(390, Math.max(270, width * 0.3));
      const buffer = document.createElement("canvas");
      buffer.width = sampleSize;
      buffer.height = sampleSize;
      const bufferContext = buffer.getContext("2d");
      if (!bufferContext) return;

      bufferContext.clearRect(0, 0, sampleSize, sampleSize);
      bufferContext.fillStyle = "#fff";
      bufferContext.textAlign = "center";
      bufferContext.textBaseline = "middle";
      bufferContext.font = `500 ${sampleSize * 0.72}px Georgia, serif`;
      bufferContext.fillText("ॐ", sampleSize / 2, sampleSize / 2);

      const pixels = bufferContext.getImageData(0, 0, sampleSize, sampleSize).data;
      const targets: Array<[number, number]> = [];
      const step = width < 640 ? 7 : 6;
      for (let y = 0; y < sampleSize; y += step) {
        for (let x = 0; x < sampleSize; x += step) {
          if (pixels[(y * sampleSize + x) * 4 + 3] > 90) targets.push([x, y]);
        }
      }

      const maxParticles = width < 640 ? 430 : 760;
      const stride = Math.max(1, Math.ceil(targets.length / maxParticles));
      const chosenTargets = targets.filter((_, index) => index % stride === 0).slice(0, maxParticles);
      const centerX = width / 2;
      const centerY = height / 2;

      particles = chosenTargets.map(([targetX, targetY], index) => {
        const edge = index % 4;
        const homeX = edge === 0 ? Math.random() * width : edge === 1 ? width + 50 : edge === 2 ? Math.random() * width : -50;
        const homeY = edge === 2 ? height + 50 : edge === 3 ? -50 : Math.random() * height;
        const dx = targetX - sampleSize / 2;
        const dy = targetY - sampleSize / 2;
        const length = Math.hypot(dx, dy) || 1;
        return {
          x: homeX,
          y: homeY,
          homeX,
          homeY,
          targetX: centerX + dx,
          targetY: centerY + dy,
          scatterX: (dx / length) * (120 + Math.random() * 240) + (Math.random() - 0.5) * 80,
          scatterY: (dy / length) * (120 + Math.random() * 240) + (Math.random() - 0.5) * 80,
          size: 0.7 + Math.random() * 1.3,
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const draw = (now: number) => {
      if (!visible) return;
      if (skipRef.current) startedAt = now - DISSOLVE_END - 500;
      const elapsed = now - startedAt;
      context.clearRect(0, 0, width, height);

      const formation = easeOut(clamp((elapsed - FORM_START) / (FORM_END - FORM_START)));
      const dissolve = easeInOut(clamp((elapsed - DISSOLVE_START) / (DISSOLVE_END - DISSOLVE_START)));
      const appear = clamp((elapsed - 250) / 900);
      const breathing = elapsed > FORM_END && elapsed < DISSOLVE_START
        ? 1 + Math.sin((elapsed - FORM_END) / 430) * 0.025
        : 1;
      const centerX = width / 2;
      const centerY = height / 2;

      for (const particle of particles) {
        const driftX = Math.sin(elapsed * 0.00055 + particle.phase) * 18;
        const driftY = Math.cos(elapsed * 0.00042 + particle.phase) * 12;
        const formedX = centerX + (particle.targetX - centerX) * breathing;
        const formedY = centerY + (particle.targetY - centerY) * breathing;
        particle.x = particle.homeX + driftX + (formedX - particle.homeX - driftX) * formation + particle.scatterX * dissolve;
        particle.y = particle.homeY + driftY + (formedY - particle.homeY - driftY) * formation + particle.scatterY * dissolve;

        const alpha = appear * (1 - dissolve) * (0.48 + Math.sin(elapsed * 0.003 + particle.phase) * 0.24);
        if (alpha <= 0.01) continue;
        context.beginPath();
        context.fillStyle = `rgba(231, 197, 114, ${alpha})`;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      if (elapsed < DISSOLVE_END + 350) {
        animationFrame = requestAnimationFrame(draw);
      } else {
        hero.classList.add("intro-canvas-complete");
        context.clearRect(0, 0, width, height);
      }
    };

    const updateParallax = (event?: Event) => {
      if (parallaxFrame) return;
      parallaxFrame = requestAnimationFrame(() => {
        const scrollProgress = clamp(window.scrollY / Math.max(hero.offsetHeight, 1));
        const pointerEvent = event instanceof PointerEvent ? event : null;
        const pointerX = pointerEvent ? (pointerEvent.clientX / width - 0.5) * 2 : 0;
        const pointerY = pointerEvent ? (pointerEvent.clientY / height - 0.5) * 2 : 0;
        hero.style.setProperty("--parallax-x", `${pointerX * -8}px`);
        hero.style.setProperty("--parallax-y", `${scrollProgress * 72 + pointerY * -5}px`);
        parallaxFrame = 0;
      });
    };

    const handleVisibility = () => {
      visible = !document.hidden;
      if (visible) animationFrame = requestAnimationFrame(draw);
    };

    createParticles();
    animationFrame = requestAnimationFrame(draw);
    window.addEventListener("resize", createParticles);
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("pointermove", updateParallax, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(parallaxFrame);
      window.removeEventListener("resize", createParticles);
      window.removeEventListener("scroll", updateParallax);
      window.removeEventListener("pointermove", updateParallax);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const startWind = () => {
    if (audioRef.current) {
      const { context, gain, source } = audioRef.current;
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.7);
      window.setTimeout(() => {
        source.stop();
        context.close();
      }, 800);
      audioRef.current = null;
      setSoundOn(false);
      return;
    }

    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const length = context.sampleRate * 3;
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const channel = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = last * 0.985 + white * 0.015;
      channel[i] = last * 3.2;
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
    gain.gain.exponentialRampToValueAtTime(0.11, context.currentTime + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.025, context.currentTime + 6);
    const audio = { context, gain, source };
    audioRef.current = audio;
    setSoundOn(true);
    window.setTimeout(() => {
      if (audioRef.current !== audio) return;
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1.2);
      window.setTimeout(() => {
        if (audioRef.current !== audio) return;
        source.stop();
        context.close();
        audioRef.current = null;
        setSoundOn(false);
      }, 1300);
    }, 6500);
  };

  const skipIntro = () => {
    skipRef.current = true;
    setSkipped(true);
    heroRef.current?.classList.add("intro-complete");
    if (audioRef.current) {
      const { context, gain, source } = audioRef.current;
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.4);
      window.setTimeout(() => {
        source.stop();
        context.close();
      }, 500);
      audioRef.current = null;
      setSoundOn(false);
    }
  };

  return (
    <section ref={heroRef} className={skipped ? "hero intro-skipped" : "hero"} aria-label="Bhraman Retreats introduction">
      <div className="hero-background" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />
      <canvas ref={canvasRef} className="om-particles" aria-hidden="true" />
      <div className="intro-wordmark" aria-hidden="true">
        <span>ॐ</span>
        <small>Breathe in · Return within</small>
      </div>
      <div className="intro-founder">
        <span>Founded & guided by</span>
        <strong>Dr. Pratiksha Shekhawat</strong>
      </div>

      <Navigation />

      <div className="hero-content">
        <SectionLabel className="light">Elemental retreats · Himalayas, India</SectionLabel>
        <EditorialHeading as="h1">Remember your<br /><em>natural rhythm.</em></EditorialHeading>
        <p className="hero-copy">Five elements. Five days. One quiet return to the part of you that never forgot how to be whole.</p>
        <div className="hero-actions">
          <PrimaryButton href="#retreat" onDark>Explore the retreat</PrimaryButton>
          <SecondaryButton href="#philosophy" onDark>Discover our philosophy</SecondaryButton>
        </div>
      </div>

      <div className="intro-controls">
        <button type="button" onClick={startWind} aria-pressed={soundOn}>
          {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          {soundOn ? "Wind on" : "Listen"}
        </button>
        <button type="button" onClick={skipIntro}>Skip intro</button>
      </div>

      <a href="#philosophy" className="scroll-cue"><ArrowDown size={17} /> Scroll to journey</a>
    </section>
  );
}
