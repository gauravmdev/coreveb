import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module — keep it out of the bundler so Node
  // loads its compiled binding at runtime.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
