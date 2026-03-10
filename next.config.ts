import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse and mammoth are Node.js-only packages that ship CJS builds.
  // Turbopack would try to bundle their ESM builds (which lack a default export),
  // so we mark them as external to let Node.js load the CJS version at runtime.
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
