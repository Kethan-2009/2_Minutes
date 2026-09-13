"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { env, supabaseConfigured } from "@/lib/env";
import {
  normalizeTimezone,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validation";
import { humanizeAuthError } from "@/lib/auth-errors";
import { safeRedirect } from "@/lib/safe-redirect";
import type { AuthFormState } from "./form-state";

/**
 * Preview mode has no database to write to. Say so in the form, in plain terms,
 * rather than letting the button appear to do nothing.
 */
const NOT_CONNECTED =
  "Supabase isn't connected yet, so accounts can't be created. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the dev server. See README.md.";

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors = {
    name: validateName(name) ?? undefined,
    email: validateEmail(email) ?? undefined,
    password: validatePassword(password) ?? undefined,
  };

  if (fieldErrors.name || fieldErrors.email || fieldErrors.password) {
    return { error: null, fieldErrors, values: { name, email } };
  }

  if (!supabaseConfigured) {
    return { error: NOT_CONNECTED, fieldErrors: {}, values: { name, email } };
  }

  const timezone = normalizeTimezone(formData.get("timezone"));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Read by the handle_new_user trigger to seed the profile row.
      data: { display_name: name.trim(), timezone },
      emailRedirectTo: `${env.siteUrl}/auth/confirm`,
    },
  });

  if (error) {
    return {
      error: humanizeAuthError(error.message),
      fieldErrors: {},
      values: { name, email },
    };
  }

  revalidatePath("/", "layout");

  // With email confirmation switched on, Supabase returns no session yet.
  if (!data.session) {
    redirect(`/check-email?email=${encodeURIComponent(email)}`);
  }

  redirect("/today");
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeRedirect(formData.get("next")?.toString());

  const fieldErrors = {
    email: validateEmail(email) ?? undefined,
    password: password ? undefined : "Enter your password.",
  };

  if (fieldErrors.email || fieldErrors.password) {
    return { error: null, fieldErrors, values: { email } };
  }

  if (!supabaseConfigured) {
    return { error: NOT_CONNECTED, fieldErrors: {}, values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: humanizeAuthError(error.message), fieldErrors: {}, values: { email } };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut() {
  if (!supabaseConfigured) redirect("/login");

  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Sends a password reset link.
 *
 * The response is identical whether or not the email has an account — telling a
 * stranger which addresses are registered is a gift to whoever is asking.
 */
export async function requestPasswordReset(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();

  const emailError = validateEmail(email);
  if (emailError) {
    return { error: null, fieldErrors: { email: emailError }, values: { email } };
  }

  if (!supabaseConfigured) {
    return { error: NOT_CONNECTED, fieldErrors: {}, values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.siteUrl}/auth/confirm?next=/reset-password`,
  });

  // A rate limit is worth surfacing; anything else is swallowed on purpose so
  // the outcome cannot be used to probe for registered addresses.
  if (error && /rate limit|too many/i.test(error.message)) {
    return { error: humanizeAuthError(error.message), fieldErrors: {}, values: { email } };
  }

  return { error: null, done: true, fieldErrors: {}, values: { email } };
}

/** Sets a new password for the signed-in user, at the end of a recovery link. */
export async function updatePassword(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors = {
    password: validatePassword(password) ?? undefined,
    confirmPassword:
      password && confirmPassword !== password
        ? "Those two don't match."
        : undefined,
  };

  if (fieldErrors.password || fieldErrors.confirmPassword) {
    return { error: null, fieldErrors, values: {} };
  }

  if (!supabaseConfigured) {
    return { error: NOT_CONNECTED, fieldErrors: {}, values: {} };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: humanizeAuthError(error.message), fieldErrors: {}, values: {} };
  }

  revalidatePath("/", "layout");
  redirect("/today");
}
