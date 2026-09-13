import type { ReactNode } from "react";

import { Wordmark } from "@/components/wordmark";

/**
 * One column, centred, nothing else on screen. Signing in is the only job
 * these pages have.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-6 py-6">
        <Wordmark href="/" />
      </header>
      <main className="flex flex-1 items-start justify-center px-6 pb-16">
        <div className="w-full max-w-[420px] pt-6 sm:pt-12">{children}</div>
      </main>
    </div>
  );
}
