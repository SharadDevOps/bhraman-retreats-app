export const HERO_SEEN_KEY = "bhraman.hero.intro.seen.v1";

export const HERO_STAGES = [
  "opening",
  "particles",
  "forming",
  "breathing",
  "elements",
  "mist",
  "revealed",
];

export const FULL_HERO_TIMELINE = Object.freeze({
  opening: 0,
  particles: 1000,
  forming: 4000,
  breathing: 7000,
  elements: 9000,
  mist: 12000,
  revealed: 15000,
});

export const RETURNING_HERO_TIMELINE = Object.freeze({
  opening: 0,
  particles: 250,
  forming: 1000,
  breathing: 2200,
  elements: 3000,
  mist: 4000,
  revealed: 5200,
});

export const HERO_CTAS = Object.freeze({
  primary: Object.freeze({ label: "Explore the Retreat", href: "#retreat" }),
  secondary: Object.freeze({ label: "Take a One-Minute Pause", href: "#experience" }),
});

export function resolveHeroMode({ prefersReducedMotion, hasSeenIntro }) {
  if (prefersReducedMotion) return "reduced";
  return hasSeenIntro ? "returning" : "full";
}

export function getHeroTimeline(mode) {
  return mode === "returning" ? RETURNING_HERO_TIMELINE : FULL_HERO_TIMELINE;
}

export function getHeroStage(elapsedMs, mode = "full") {
  if (mode === "reduced") return "revealed";
  const timeline = getHeroTimeline(mode);
  for (let index = HERO_STAGES.length - 1; index >= 0; index -= 1) {
    const stage = HERO_STAGES[index];
    if (elapsedMs >= timeline[stage]) return stage;
  }
  return "opening";
}

export function getSkipIntroResult() {
  return Object.freeze({ stage: "revealed", persistSeen: true });
}

export function hasAccessibleCtas(ctas = HERO_CTAS) {
  return Object.values(ctas).every((cta) =>
    typeof cta.label === "string" && cta.label.trim().length > 0 &&
    typeof cta.href === "string" && cta.href.startsWith("#") && cta.href.length > 1,
  );
}