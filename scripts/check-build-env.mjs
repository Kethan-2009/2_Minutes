/**
 * Refuses a production build that has no Supabase credentials.
 *
 * Without this the build succeeds and the app 500s on its first request:
 * every page that reads a session is dynamic, so nothing is evaluated at build
 * time and nothing throws until a real user arrives. Failing here puts the
 * error in the deploy log instead, while someone is still watching.
 *
 * This lives in its own script rather than in next.config.ts because
 * `next typegen` loads the config under the same production build phase, and
 * refusing to generate route types without database credentials would break
 * `npm run typecheck` on a fresh clone.
 */
// @next/env is CommonJS, so it has to come in through the default export.
import nextEnv from "@next/env";

// Same .env resolution Next itself uses, so a local production build against
// .env.local behaves the way you would expect.
nextEnv.loadEnvConfig(process.cwd(), false);

const REQUIRED = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];

const missing = REQUIRED.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(
    `\nCannot build without ${missing.join(" and ")}.\n\n` +
      `  • Deploying? Set them in your hosting environment.\n` +
      `    On Vercel: Project Settings → Environment Variables.\n` +
      `  • Building locally? Put them in .env.local (copy .env.example).\n\n` +
      `Running the app in development needs no keys at all — see "Preview\n` +
      `mode" in README.md.\n`,
  );
  process.exit(1);
}
