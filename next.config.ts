import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Azure App Service deployment: generates .next/standalone/
  // with a self-contained server.js and only the traced node_modules.
  output: "standalone",
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
