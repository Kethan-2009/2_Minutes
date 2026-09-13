import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

export const metadata: Metadata = {
  title: "Not found · Two Minutes",
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-6 py-6">
        <Wordmark href="/" />
      </header>
      <main className="flex flex-1 flex-col justify-center px-6 pb-16">
        <div className="mx-auto flex w-full max-w-[420px] flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="headline">Nothing here.</h1>
            <p className="text-[17px] leading-relaxed text-muted">
              That page doesn&rsquo;t exist, or it moved.
            </p>
          </div>
          <ButtonLink href="/" variant="secondary">
            Back to the start
          </ButtonLink>
        </div>
      </main>
    </div>
  );
}
