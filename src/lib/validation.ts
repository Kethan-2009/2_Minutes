/**
 * Form validation shared by the client and the server actions.
 *
 * The server is the authority — client-side checks here exist only so people
 * are not told "that was wrong" after a round trip.
 */

export const PASSWORD_MIN_LENGTH = 8;

/** Deliberately permissive. Real verification happens via the confirmation email. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return "Enter your email.";
  if (!EMAIL_PATTERN.test(email)) return "That doesn't look like an email address.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Enter a password.";
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  return null;
}

export function validateName(value: string): string | null {
  const name = value.trim();
  if (!name) return "Tell us what to call you.";
  if (name.length > 60) return "That's a little long — 60 characters or fewer.";
  return null;
}
