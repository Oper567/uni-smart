import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Ensure 'output: export' is GONE from here */
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // If you see an 'eslint: { ... }' block, delete it too
};

export default nextConfig;