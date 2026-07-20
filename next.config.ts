import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lint is run separately (CI/pre-commit); don't fail production builds on
  // lint warnings such as no-img-element on the admin/media pages.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.blob.core.windows.net" },
    ],
  },
};

export default nextConfig;
