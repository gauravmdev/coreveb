import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the pg driver out of the bundler; loaded natively at runtime.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
