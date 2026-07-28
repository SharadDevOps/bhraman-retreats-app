import { brandAssets } from "@/data/brand";

type BrandLogoProps = {
  tone?: "dark" | "light";
  context?: "retreats" | "admin";
};

export function BrandLogo({ tone = "dark", context = "retreats" }: BrandLogoProps) {
  const source = tone === "light" ? brandAssets.logoLight ?? brandAssets.logo : brandAssets.logo;

  if (source) {
    return <img className="brand-logo-image" src={source} alt={context === "admin" ? "Bhraman Admin" : "Bhraman Retreats"} />;
  }

  return (
    <span className="brand-logo-fallback" aria-label={context === "admin" ? "Bhraman Admin" : "Bhraman Retreats"}>
      <span className="brand-element-mark" aria-hidden="true">
        <i /><i /><i /><i /><i />
      </span>
      <span className="brand-wordmark">
        <strong>Bhraman</strong>
        <small>{context === "admin" ? "Admin" : "Retreats"}</small>
      </span>
    </span>
  );
}
