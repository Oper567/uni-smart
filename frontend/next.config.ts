import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* CRITICAL FOR RENDER STATIC SITES: 
     This tells Next.js to generate a standalone 'out' folder 
  */
  output: 'export', 
  
  /* Required for 'output: export' if you use the <Image /> component */
  images: {
    unoptimized: true,
  },

  /* High-performance React compiler */
  reactCompiler: true,

  /* Build bypasses */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  /* Optimization for animations and icons */
  transpilePackages: ["framer-motion", "lucide-react"],
};

export default nextConfig;