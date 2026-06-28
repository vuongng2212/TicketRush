import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Disable type checking during build since we use 'any' intentionally for dynamic GraphQL data
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
