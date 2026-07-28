"use client";

import { useEffect, useRef } from "react";
import { getHeroTimeline, type HeroMode } from "@/lib/hero-experience.mjs";

type Particle = {
  homeX: number;
  homeY: number;
  targetX: number;
  targetY: number;
  scatterX: number;
  scatterY: number;
  size: number;
  phase: number;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const easeInOut = (value: number) => value < 0.5
  ? 4 * value * value * value
  : 1 - Math.pow(-2 * value + 2, 3) / 2;
const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);

export function OmIntro({ mode, skipped }: { mode: HeroMode; skipped: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || skipped || mode === "reduced") return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const timeline = getHeroTimeline(mode);
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let startedAt = performance.now();
    let hiddenAt: number | null = null;

    const resize = () => {
      const mobile = window.innerWidth < 768;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5);
      width = window.innerWidth;
      height = Math.max(window.innerHeight, canvas.parentElement?.clientHeight ?? 0);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const sampleSize = mobile ? 250 : Math.min(390, Math.max(300, width * 0.3));
      const buffer = document.createElement("canvas");
      buffer.width = sampleSize;
      buffer.height = sampleSize;
      const bufferContext = buffer.getContext("2d");
      if (!bufferContext) return;
      bufferContext.fillStyle = "#fff";
      bufferContext.textAlign = "center";
      bufferContext.textBaseline = "middle";
      bufferContext.font = `500 ${sampleSize * 0.72}px Georgia, serif`;
      bufferContext.fillText("\u0950", sampleSize / 2, sampleSize / 2);

      const pixels = bufferContext.getImageData(0, 0, sampleSize, sampleSize).data;
      const targets: Array<[number, number]> = [];
      const step = mobile ? 7 : 6;
      for (let y = 0; y < sampleSize; y += step) {
        for (let x = 0; x < sampleSize; x += step) {
          if (pixels[(y * sampleSize + x) * 4 + 3] > 80) targets.push([x, y]);
        }
      }

      const maximum = mobile ? 260 : 680;
      const stride = Math.max(1, Math.ceil(targets.length / maximum));
      const centerX = width / 2;
      const centerY = height / 2;
      particles = targets.filter((_, index) => index % stride === 0).slice(0, maximum).map(([x, y], index) => {
        const edge = index % 4;
        const homeX = edge === 0 ? Math.random() * width : edge === 1 ? width + 36 : edge === 2 ? Math.random() * width : -36;
        const homeY = edge === 2 ? height + 36 : edge === 3 ? -36 : Math.random() * height;
        const dx = x - sampleSize / 2;
        const dy = y - sampleSize / 2;
        const length = Math.hypot(dx, dy) || 1;
        return {
          homeX,
          homeY,
          targetX: centerX + dx,
          targetY: centerY + dy,
          scatterX: (dx / length) * (90 + Math.random() * 210),
          scatterY: (dy / length) * (90 + Math.random() * 210),
          size: mobile ? 0.75 + Math.random() * 0.8 : 0.7 + Math.random() * 1.25,
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const draw = (now: number) => {
      const elapsed = now - startedAt;
      context.clearRect(0, 0, width, height);
      if (elapsed >= timeline.revealed) return;

      const appear = clamp((elapsed - timeline.particles) / Math.max(1, timeline.forming - timeline.particles));
      const formation = easeOut(clamp((elapsed - timeline.forming) / Math.max(1, timeline.breathing - timeline.forming)));
      const dissolve = easeInOut(clamp((elapsed - timeline.mist) / Math.max(1, timeline.revealed - timeline.mist)));
      const breathingActive = elapsed >= timeline.breathing && elapsed < timeline.mist;
      const breathing = breathingActive ? 1 + Math.sin((elapsed - timeline.breathing) / 430) * 0.025 : 1;
      const centerX = width / 2;
      const centerY = height / 2;
      context.fillStyle = "rgb(231, 197, 114)";

      for (const particle of particles) {
        const driftX = Math.sin(elapsed * 0.0005 + particle.phase) * 14;
        const driftY = Math.cos(elapsed * 0.00038 + particle.phase) * 10;
        const formedX = centerX + (particle.targetX - centerX) * breathing;
        const formedY = centerY + (particle.targetY - centerY) * breathing;
        const x = particle.homeX + driftX + (formedX - particle.homeX - driftX) * formation + particle.scatterX * dissolve;
        const y = particle.homeY + driftY + (formedY - particle.homeY - driftY) * formation + particle.scatterY * dissolve;
        context.globalAlpha = appear * (1 - dissolve) * (0.45 + Math.sin(elapsed * 0.0025 + particle.phase) * 0.2);
        context.beginPath();
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    const visibilityChanged = () => {
      if (document.hidden) {
        hiddenAt = performance.now();
        cancelAnimationFrame(frame);
      } else {
        if (hiddenAt !== null) startedAt += performance.now() - hiddenAt;
        hiddenAt = null;
        frame = requestAnimationFrame(draw);
      }
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibilityChanged);
      context.clearRect(0, 0, width, height);
    };
  }, [mode, skipped]);

  return <canvas ref={canvasRef} className="om-intro" aria-hidden="true" />;
}