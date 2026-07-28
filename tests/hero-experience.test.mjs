import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  FULL_HERO_TIMELINE,
  getHeroStage,
  getSkipIntroResult,
  hasAccessibleCtas,
  HERO_CTAS,
  HERO_SEEN_KEY,
  resolveHeroMode,
  RETURNING_HERO_TIMELINE,
} from "../src/lib/hero-experience.mjs";

test("full cinematic timeline follows the approved 15-second sequence", () => {
  assert.equal(getHeroStage(0), "opening");
  assert.equal(getHeroStage(999), "opening");
  assert.equal(getHeroStage(1000), "particles");
  assert.equal(getHeroStage(4000), "forming");
  assert.equal(getHeroStage(7000), "breathing");
  assert.equal(getHeroStage(9000), "elements");
  assert.equal(getHeroStage(12000), "mist");
  assert.equal(getHeroStage(15000), "revealed");
  assert.equal(FULL_HERO_TIMELINE.revealed, 15000);
});

test("reduced motion bypasses the cinematic sequence", () => {
  const mode = resolveHeroMode({ prefersReducedMotion: true, hasSeenIntro: false });
  assert.equal(mode, "reduced");
  assert.equal(getHeroStage(0, mode), "revealed");

  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.hero-opening-shade, \.om-intro, \.element-orbit, \.hero-intro-mist, \.skip-intro-button \{ display: none; \}/);
});

test("skip intro completes immediately and persists the visitor preference", () => {
  assert.deepEqual(getSkipIntroResult(), { stage: "revealed", persistSeen: true });
  assert.equal(HERO_SEEN_KEY, "bhraman.hero.intro.seen.v1");

  const controller = readFileSync(new URL("../src/components/cinematic-hero.tsx", import.meta.url), "utf8");
  const button = readFileSync(new URL("../src/components/hero/skip-intro-button.tsx", import.meta.url), "utf8");
  assert.match(controller, /if \(result\.persistSeen\) persistIntroSeen\(\)/);
  assert.match(button, /type="button"/);
  assert.match(button, />Skip Intro</);
});

test("returning visitors receive the shortened complete sequence", () => {
  const mode = resolveHeroMode({ prefersReducedMotion: false, hasSeenIntro: true });
  assert.equal(mode, "returning");
  assert.ok(RETURNING_HERO_TIMELINE.revealed < FULL_HERO_TIMELINE.revealed);
  assert.equal(RETURNING_HERO_TIMELINE.revealed, 5200);
  assert.equal(getHeroStage(3000, mode), "elements");
  assert.equal(getHeroStage(5200, mode), "revealed");
});

test("hero CTAs have exact accessible labels and valid in-page destinations", () => {
  assert.equal(hasAccessibleCtas(), true);
  assert.deepEqual(HERO_CTAS.primary, { label: "Explore the Retreat", href: "#retreat" });
  assert.deepEqual(HERO_CTAS.secondary, { label: "Take a One-Minute Pause", href: "#philosophy" });

  const heroContent = readFileSync(new URL("../src/components/hero/hero-content.tsx", import.meta.url), "utf8");
  assert.match(heroContent, /aria-label=\{HERO_CTAS\.primary\.label\}/);
  assert.match(heroContent, /aria-label=\{HERO_CTAS\.secondary\.label\}/);
  assert.match(heroContent, /aria-label="Hero actions"/);
});