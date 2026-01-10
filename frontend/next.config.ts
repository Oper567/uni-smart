import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* High-performance React compiler enabled */
  reactCompiler: true,

  /* Build bypasses - useful for fast deployment */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  /* Optimization for high-end animations and icons */
  transpilePackages: ["framer-motion", "lucide-react"],

  /* Security headers for production */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;