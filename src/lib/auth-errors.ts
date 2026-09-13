/**
 * Supabase error strings are written for developers. These are written for a
 * tired student at 11pm who just wants to get in.
 *
 * Anything unrecognised becomes a generic apology rather than being shown raw —
 * an unknown auth error is as likely to leak an internal detail as to help.
 */
export function humanizeAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "That email and password don't match. Give it another go.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirm your email first — check your inbox for the link.";
  }
  if (
    normalized.includes("already registered") ||
    normalized.includes("already been registered")
  ) {
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
