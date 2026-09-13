import { describe, expect, it } from "vitest";

import {
  PASSWORD_MIN_LENGTH,
  normalizeTimezone,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validation";

describe("validateEmail", () => {
  it("accepts ordinary addresses", () => {
    expect(validateEmail("alex@school.edu")).toBeNull();
    expect(validateEmail("a.b+tag@sub.domain.co.uk")).toBeNull();
  });

  it("trims before judging", () => {
    expect(validateEmail("  alex@school.edu  ")).toBeNull();
  });

  it("asks for something when empty", () => {
    expect(validateEmail("")).toBe("Enter your email.");
    expect(validateEmail("   ")).toBe("Enter your email.");
  });

  it("rejects obvious non-addresses", () => {
    for (const bad of ["alex", "alex@", "@school.edu", "alex@school", "a b@c.d"]) {
      expect(validateEmail(bad)).not.toBeNull();
    }
  });
});

describe("validatePassword", () => {
  it("accepts anything long enough", () => {
    expect(validatePassword("correcthorse")).toBeNull();
  });

  it("rejects short passwords and says the number", () => {
    const message = validatePassword("short");
    expect(message).toContain(String(PASSWORD_MIN_LENGTH));
  });

  it("treats the boundary as valid", () => {
    expect(validatePassword("x".repeat(PASSWORD_MIN_LENGTH))).toBeNull();
    expect(validatePassword("x".repeat(PASSWORD_MIN_LENGTH - 1))).not.toBeNull();
  });

  it("asks for something when empty", () => {
    expect(validatePassword("")).toBe("Enter a password.");
  });
});

describe("validateName", () => {
  it("accepts a normal name", () => {
    expect(validateName("Alex")).toBeNull();
  });

  it("rejects blank and whitespace-only input", () => {
    expect(validateName("")).not.toBeNull();
    expect(validateName("   ")).not.toBeNull();
  });

  it("rejects absurdly long input", () => {
    expect(validateName("a".repeat(61))).not.toBeNull();
    expect(validateName("a".repeat(60))).toBeNull();
  });
});

describe("normalizeTimezone", () => {
  it("keeps a real IANA zone", () => {
    expect(normalizeTimezone("Australia/Sydney")).toBe("Australia/Sydney");
    expect(normalizeTimezone("America/New_York")).toBe("America/New_York");
  });

  it("falls back to UTC for anything it can't verify", () => {
    expect(normalizeTimezone("Mars/Olympus_Mons")).toBe("UTC");
    expect(normalizeTimezone("")).toBe("UTC");
    expect(normalizeTimezone(null)).toBe("UTC");
    expect(normalizeTimezone(undefined)).toBe("UTC");
    expect(normalizeTimezone(42)).toBe("UTC");
  });
});
