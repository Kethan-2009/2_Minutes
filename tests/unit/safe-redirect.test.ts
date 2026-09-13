import { describe, expect, it } from "vitest";

import { safeRedirect } from "@/lib/safe-redirect";

describe("safeRedirect", () => {
  it("keeps ordinary in-app paths", () => {
    expect(safeRedirect("/today")).toBe("/today");
    expect(safeRedirect("/goals/abc-123")).toBe("/goals/abc-123");
    expect(safeRedirect("/today?tab=week")).toBe("/today?tab=week");
    expect(safeRedirect("/search?q=a%20b")).toBe("/search?q=a%20b");
  });

  it("falls back when nothing was asked for", () => {
    expect(safeRedirect(null)).toBe("/today");
    expect(safeRedirect(undefined)).toBe("/today");
    expect(safeRedirect("")).toBe("/today");
  });

  it("honours a caller-supplied fallback", () => {
    expect(safeRedirect(null, "/login")).toBe("/login");
  });

  it("rejects absolute URLs to other origins", () => {
    expect(safeRedirect("https://evil.example")).toBe("/today");
    expect(safeRedirect("http://evil.example/today")).toBe("/today");
  });

  it("rejects protocol-relative URLs, including the backslash form", () => {
    // Both of these navigate off-origin in a browser.
    expect(safeRedirect("//evil.example")).toBe("/today");
    expect(safeRedirect("/\\evil.example")).toBe("/today");
  });

  it("rejects script and data schemes", () => {
    expect(safeRedirect("javascript:alert(1)")).toBe("/today");
    expect(safeRedirect("data:text/html,<script>")).toBe("/today");
  });

  it("rejects paths carrying characters a browser would strip", () => {
    // A leading newline or tab can smuggle a scheme past a naive prefix check.
    expect(safeRedirect("/\nhttps://evil.example")).toBe("/today");
    expect(safeRedirect("/\thttps://evil.example")).toBe("/today");
    expect(safeRedirect("/ /evil.example")).toBe("/today");
  });

  it("rejects bare and relative paths", () => {
    expect(safeRedirect("today")).toBe("/today");
    expect(safeRedirect("../admin")).toBe("/today");
  });
});
