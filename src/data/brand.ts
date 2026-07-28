export const brandAssets = {
  logo: process.env.NEXT_PUBLIC_BHRAMAN_LOGO_URL?.trim() || null,
  logoLight: process.env.NEXT_PUBLIC_BHRAMAN_LOGO_LIGHT_URL?.trim() || null,
  founderFallback: process.env.FOUNDER_IMAGE_URL?.trim() || null,
} as const;
