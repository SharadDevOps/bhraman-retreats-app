import type { HeroStage } from "@/lib/hero-experience.mjs";

const ELEMENTS = [
  { key: "earth", label: "Earth" },
  { key: "water", label: "Water" },
  { key: "fire", label: "Fire" },
  { key: "air", label: "Air" },
  { key: "space", label: "Space" },
] as const;

export function ElementOrbit({ stage }: { stage: HeroStage }) {
  return (
    <div className="element-orbit" data-stage={stage} aria-hidden="true">
      <span className="element-orbit-om">{"ॐ"}</span>
      {ELEMENTS.map((element, index) => (
        <span className={`element-ring element-ring-${element.key}`} style={{ "--ring-index": index } as React.CSSProperties} key={element.key}>
          <i /><small>{element.label}</small>
        </span>
      ))}
    </div>
  );
}