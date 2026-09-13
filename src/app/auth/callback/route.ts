import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * PKCE code exchange — used by magic links and, later, any OAuth provider we
 * turn on. Kept alongside /auth/confirm so both email link styles work.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/today";

  if (!code) {
    redirect("/login?error=link-invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirect("/login?error=link-expired");
  }

  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/today");
}
