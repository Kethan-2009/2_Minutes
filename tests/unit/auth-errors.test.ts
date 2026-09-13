import { describe, expect, it } from "vitest";

import { humanizeAuthError } from "@/lib/auth-errors";

describe("humanizeAuthError", () => {
  it("rewrites a failed login without hinting which half was wrong", () => {
    const message = humanizeAuthError("Invalid login credentials");
    expect(message).toBe("That email and password don't match. Give it another go.");
    // Saying "no account with that email" would confirm who is registered.
    expect(message).not.toMatch(/no account|not found|unknown/i);
  });

  it("points at the inbox when the email is unconfirmed", () => {
    expect(humanizeAuthError("Email not confirmed")).toMatch(/inbox/i);
  });

  it("sends an existing user to log in", () => {
    expect(humanizeAuthError("User already registered")).toMatch(/log in/i);
  });

  it("explains a rate limit as something to wait out", () => {
    expect(humanizeAuthError("Email rate limit exceeded")).toMatch(/wait/i);
    expect(humanizeAuthError("Too many requests")).toMatch(/wait/i);
  });

  it("is case-insensitive about Supabase's wording", () => {
    expect(humanizeAuthError("INVALID LOGIN CREDENTIALS")).toMatch(/don't match/);
  });

  it("passes through password rule messages, which are already specific", () => {
    const raw = "Password should be at least 6 characters";
    expect(humanizeAuthError(raw)).toBe(raw);
  });

  it("never shows an unrecognised error verbatim", () => {
    const leak = "connection to db-prod-3.internal:5432 refused";
    expect(humanizeAuthError(leak)).not.toContain("internal");
    expect(humanizeAuthError(leak)).toBe(
      "Something went wrong on our end. Try again in a moment.",
    );
  });
});
