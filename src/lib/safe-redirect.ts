/** Where to send someone when the requested destination isn't trustworthy. */
const DEFAULT_DESTINATION = "/today";

/** Control characters and whitespace, which browsers strip before parsing a URL. */
const STRIPPABLE = /[\u0000-\u0020\u007F]/;

/**
 * Narrows a caller-supplied `?next=` to a same-origin path.
 *
 * This value comes from the query string, so it is attacker-controlled: without
 * this, an emailed link like `/login?next=https://evil.example` turns our own
 * login form into a redirect to someone else's.
 *
 * Rejected on purpose:
 * - anything not starting with "/" (absolute URLs, `javascript:`, bare paths)
 * - "//host" and "/\host", which browsers read as protocol-relative URLs
 * - control characters and whitespace, which browsers strip before parsing and
 *   which can therefore smuggle a scheme past a naive check
 */
export function safeRedirect(
  next: string | null | undefined,
  fallback: string = DEFAULT_DESTINATION,
): string {
  if (typeof next !== "string" || next.length === 0) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.length > 1 && (next[1] === "/" || next[1] === "\\")) return fallback;
  if (STRIPPABLE.test(next)) return fallback;

  return next;
}
