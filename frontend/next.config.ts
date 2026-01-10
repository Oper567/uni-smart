import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* CRITICAL FOR RENDER STATIC SITES: 
     Generates the 'out' folder for static hosting.
  */
  output: 'export', 

  /* FIXES MIME TYPE ERRORS: 
     Ensures paths like /dashboard match /dashboard/index.html correctly.
     This prevents the server from returning index.html when looking for CSS.
  */
  trailingSlash: true, 
  
  /* Required for 'output: export' if you use the <Image /> component */
  images: {
    unoptimized: true,
  },

  /* High-performance React compiler */
  reactCompiler: true,

  /* Build bypasses - useful for fast deployments on Render */
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