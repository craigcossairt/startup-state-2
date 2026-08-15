import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Next treats 127.0.0.1 as a different host than localhost and blocks
  // /_next/webpack-hmr (and hydration) unless it is on this list.
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    root: path.resolve(__dirname),
  },
  // dataPath() joins process.cwd() at runtime, so NFT cannot see the JSON.
  // Without this, Vercel lambdas ship with empty retrieve/history caches.
  outputFileTracingIncludes: {
    "/*": ["./data/**/*"],
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
