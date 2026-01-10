import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete 
    // even if your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Note: If you are on Next.js 15, ESLint errors can also block builds
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;