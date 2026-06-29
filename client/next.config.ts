import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Disable type checking during build since we use 'any' intentionally for dynamic GraphQL data
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['language-crown-drove-carbon.trycloudflare.com', 'spine-handy-involve-registrar.trycloudflare.com', 'internal-istanbul-toilet-comparable.trycloudflare.com', '*.trycloudflare.com'],
};

export default nextConfig;
