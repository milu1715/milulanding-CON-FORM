import type { NextConfig } from "next";

const isElectronBuild = process.env.ELECTRON_BUILD === "1";

const nextConfig: NextConfig = {
  // Static export for Electron packaging; normal server for web
  ...(isElectronBuild ? { output: "export" } : { serverExternalPackages: ["@anthropic-ai/sdk"] }),
};

export default nextConfig;
