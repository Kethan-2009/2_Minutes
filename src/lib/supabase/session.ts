import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { env, isPreviewMode } from "@/lib/env";

/** Routes a signed-out visitor is allowed to see. Everything else needs a session. */
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/check-email",
  "/forgot-password",
  "/auth",
];
// Note: /reset-password is deliberately NOT public. The recovery link signs the
// user in first, so by the time they land there they have a session.

function isPublic(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Refreshes the auth cookie on every request and gates private routes.
 *
 * The response object has to be threaded through carefully: Supabase writes
 * refreshed cookies onto it, so returning a different response loses the
 * session and signs people out at random.
 */
export async function updateSession(request: NextRequest) {
  // Preview mode (dev, no Supabase project): there is no session to refresh and
  // nothing to protect, so let every route through and let the pages say so.
  if (isPreviewMode) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() revalidates the token with Supabase. getSession() only reads the
  // cookie, which a client can forge — never trust it for an auth decision.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublic(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/today";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
