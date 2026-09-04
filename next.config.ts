import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // The original WordPress site uses trailing slashes everywhere (/shop/, /product/<slug>/).
  trailingSlash: true,
  // sqlite.ts opens LIEN_DB_PATH / LIEN_SEED_PATH at runtime, which makes Next trace "the whole project" into
  // .next/standalone. Nothing outside the bundled server code is needed there (Dockerfile copies public/ and
  // data/seed.json explicitly), so keep the standalone output small.
  outputFileTracingExcludes: {
    "*": ["./docs/**", "./scripts/**", "./deploy/**", "./data/**", "./public/**", "./src/**", "./*.md", "./.claude/**", "./.next/cache/**"],
  },
};

export default nextConfig;
