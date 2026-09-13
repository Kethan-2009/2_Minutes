"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validation";
import type { AuthFormState } from "./form-state";

/**
 * Supabase error strings are written for developers. These are written for a
 * tired student at 11pm who just wants to get in.
 */
function humanize(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "That email and password don't match. Give it another go.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirm your email first — check your inbox for the link.";
  }
  if (normalized.includes("already registered") || normalized.includes("already been registered")) {
    return "There's already an account with that email. Log in instead.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many tries in a row. Wait a minute, then try again.";
  }
  if (normalized.includes("password")) {
    return message;
  }
  return "Something went wrong on our end. Try again in a moment.";
}

/** Only allow same-origin relative paths, so ?next= can't be used to phish. */
function safeRedirect(next: string | null): string {
  if (!next) return "/today";
  if (!next.startsWith("/") || next.startsWith("//")) return "/today";
  return next;
}

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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name.trim() },
      emailRedirectTo: `${env.siteUrl}/auth/confirm`,
    },
  });

  if (error) {
    return {
      error: humanize(error.message),
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
  const next = safeRedirect(formData.get("next") ? String(formData.get("next")) : null);

  const fieldErrors = {
    email: validateEmail(email) ?? undefined,
    password: password ? undefined : "Enter your password.",
  };

  if (fieldErrors.email || fieldErrors.password) {
    return { error: null, fieldErrors, values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: humanize(error.message), fieldErrors: {}, values: { email } };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
