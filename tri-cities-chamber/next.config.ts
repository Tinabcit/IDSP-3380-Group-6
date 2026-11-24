import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
    // The Settings page saves its profile picture (up to 1 MB, sent as a
    // base64 data: URL, so about 1.4 MB) through a server action. The default
    // limit is 1 MB.
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
