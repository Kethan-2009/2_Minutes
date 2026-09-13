import type { NextConfig } from "next";

/**
 * A production build without Supabase credentials would compile cleanly and
 * then 500 on the first request, because every page that reads a session is
 * dynamic and so is never evaluated at build time.
 *
 * Fail here instead, while someone is still watching the deploy log.
 * Development is exempt on purpose — see `isPreviewMode` in src/lib/env.ts.
 */
if (process.env.NODE_ENV === "production") {
  const missing = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ].filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Cannot build for production without ${missing.join(" and ")}. ` +
        `Set them in your hosting environment (on Vercel: Project Settings → ` +
        `Environment Variables), or in .env.local for a local production build. ` +
        `See README.md.`,
    );
  }
}

const nextConfig: NextConfig = {};

export default nextConfig;
