import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";

/**
 * Landing point for the confirmation link in Supabase's signup email.
 *
 * Verifying the OTP here (server-side) sets the session cookie, so the user
 * arrives already logged in rather than bouncing back to the login form.
 */
export async function GET(request: NextRequest) {
  // Nothing to verify against without a Supabase project.
  if (!supabaseConfigured) redirect("/login?error=link-invalid");

  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/today";

  if (!tokenHash || !type) {
    redirect("/login?error=link-invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    redirect("/login?error=link-expired");
  }

  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/today");
}
