/**
 * Environment access, validated once and loudly.
 *
 * A missing Supabase key should fail with a sentence you can act on, not three
 * screens later with "Invalid API key".
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True once both Supabase values are present. Nothing that talks to the database works without them. */
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Preview mode: run the UI with no Supabase project attached, so the design can
 * be reviewed before anyone sets up a database.
 *
 * Development only, deliberately. In production a missing key is a deployment
 * mistake and should stop the build dead rather than quietly serving a shell of
 * an app that can't log anyone in.
 */
export const isPreviewMode =
  !supabaseConfigured && process.env.NODE_ENV === "development";

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in — see README.md.`,
    );
  }
  return value;
}

export const env = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl);
  },
  get supabaseAnonKey() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey);
  },
  get siteUrl() {
    return (
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
      "http://localhost:2000"
    );
  },
};
