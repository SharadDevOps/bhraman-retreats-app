export type HeroStage = "opening" | "particles" | "forming" | "breathing" | "elements" | "mist" | "revealed";
export type HeroMode = "full" | "returning" | "reduced";
export type HeroTimeline = Readonly<Record<HeroStage, number>>;
export type HeroCta = Readonly<{ label: string; href: string }>;

export const HERO_SEEN_KEY: string;
export const HERO_STAGES: readonly HeroStage[];
export const FULL_HERO_TIMELINE: HeroTimeline;
export const RETURNING_HERO_TIMELINE: HeroTimeline;
export const HERO_CTAS: Readonly<{ primary: HeroCta; secondary: HeroCta }>;
export function resolveHeroMode(options: { prefersReducedMotion: boolean; hasSeenIntro: boolean }): HeroMode;
export function getHeroTimeline(mode: HeroMode): HeroTimeline;
export function getHeroStage(elapsedMs: number, mode?: HeroMode): HeroStage;
export function getSkipIntroResult(): Readonly<{ stage: "revealed"; persistSeen: true }>;
export function hasAccessibleCtas(ctas?: Readonly<Record<string, HeroCta>>): boolean;