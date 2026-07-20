const LEAVES = [
  { left: "8%", duration: 14, delay: 0, size: 16, tone: "gold" },
  { left: "22%", duration: 18, delay: 5, size: 13, tone: "clay" },
  { left: "38%", duration: 15, delay: 9, size: 18, tone: "gold" },
  { left: "55%", duration: 20, delay: 2, size: 12, tone: "clay" },
  { left: "72%", duration: 16, delay: 12, size: 15, tone: "gold" },
  { left: "88%", duration: 19, delay: 7, size: 14, tone: "clay" },
] as const;

const FIREFLIES = [
  { left: "12%", top: "30%", duration: 9, delay: 0 },
  { left: "28%", top: "62%", duration: 11, delay: 2 },
  { left: "45%", top: "22%", duration: 8, delay: 4 },
  { left: "58%", top: "70%", duration: 12, delay: 1 },
  { left: "68%", top: "38%", duration: 10, delay: 6 },
  { left: "80%", top: "55%", duration: 9, delay: 3 },
  { left: "90%", top: "28%", duration: 13, delay: 8 },
  { left: "35%", top: "80%", duration: 10, delay: 5 },
] as const;

function Leaf({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M22 2C11 2 3 10 3 21c0 .4.02.7.05 1C14.5 22 22 14 22 3.5V2z" />
      <path d="M4.5 20.5C9 14 14 9 20.5 4.5" stroke="rgba(255,255,255,.35)" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

export function HeroNature() {
  return (
    <div className="hero-nature" aria-hidden="true">
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          className={`leaf leaf-${leaf.tone}`}
          style={{ left: leaf.left, animationDuration: `${leaf.duration}s`, animationDelay: `${leaf.delay}s` }}
        >
          <Leaf size={leaf.size} />
        </span>
      ))}
      <div className="mist mist-one" />
      <div className="mist mist-two" />
    </div>
  );
}

export function Fireflies() {
  return (
    <div className="fireflies" aria-hidden="true">
      {FIREFLIES.map((fly, i) => (
        <span
          key={i}
          className="firefly"
          style={{ left: fly.left, top: fly.top, animationDuration: `${fly.duration}s, 3.5s`, animationDelay: `${fly.delay}s, ${fly.delay * 0.6}s` }}
        />
      ))}
    </div>
  );
}
