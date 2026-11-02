import type { NextConfig } from "next";

// Server-side destination used by the development rewrite below.
// Must NOT be prefixed with NEXT_PUBLIC_: it is never exposed to the browser.
const API_ORIGIN =
  process.env.API_PROXY_TARGET ?? "https://staging-api.eventradr.app";

const nextConfig: NextConfig = {
  /* config options here */
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
  async rewrites() {
    // Development-only: never forward live/production traffic to staging.
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
