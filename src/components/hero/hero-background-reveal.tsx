import type { CSSProperties } from "react";

export function HeroBackgroundReveal({ imageUrl }: { imageUrl?: string }) {
  const style = imageUrl
    ? { "--hero-image": `url("${imageUrl.replaceAll('"', "%22")}")` } as CSSProperties
    : undefined;
  return (
    <>
      <div className="hero-background" style={style} aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />
    </>
  );
}