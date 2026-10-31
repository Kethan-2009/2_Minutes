/**
 * Next.js only inlines `process.env.LITERAL_NAME`. A computed lookup like
 * `process.env[someVar]` is left untouched by the bundler and reads as
 * undefined in the Edge runtime, which is why middleware used to throw even
 * with a correct .env.local. Keep every access below a literal.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

/**
 * Server-only. Must NOT carry a NEXT_PUBLIC_ prefix: anything so prefixed is
 * inlined into the browser bundle, where any visitor can read it. Only
 * imported from "use server" actions.
 */
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (typeof window === "undefined") {
  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        `Copy .env.example to .env.local and fill in the values.`
    );
  }

  if (process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
    console.warn(
      "[two-minutes] NEXT_PUBLIC_ANTHROPIC_API_KEY is set. Anything prefixed " +
        "NEXT_PUBLIC_ is shipped to the browser and readable by any visitor. " +
        "Rename it to ANTHROPIC_API_KEY in .env.local and rotate the key."
    );
  }
}

export const env = {
  SUPABASE_URL: SUPABASE_URL!,
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY!,
  SITE_URL: SITE_URL ?? "http://localhost:3000",
  ANTHROPIC_API_KEY,
};
