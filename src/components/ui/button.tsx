import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex w-full items-center justify-center rounded-full px-6 text-[17px] font-semibold tracking-[-0.01em] h-14 transition-opacity disabled:opacity-40 disabled:pointer-events-none active:opacity-80";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent",
  secondary: "bg-raised text-ink",
  ghost: "bg-transparent text-muted hover:text-ink",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; children: ReactNode }) {
  return (
    <Link
      {...props}
      className={`${base} ${variants[variant]} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
