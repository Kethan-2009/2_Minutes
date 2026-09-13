import Link from "next/link";

/**
 * The mark is the product name, set plainly. No logo, no icon — the app should
 * not be asking for attention it has not earned.
 */
export function Wordmark({ href }: { href?: string }) {
  const mark = (
    <span className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
      Two Minutes
    </span>
  );

  return href ? <Link href={href}>{mark}</Link> : mark;
}
