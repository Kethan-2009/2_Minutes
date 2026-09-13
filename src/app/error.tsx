"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

/**
 * Segment-level error boundary.
 *
 * `retry()` re-fetches and re-renders this boundary's children — it is the
 * right call for the transient failures that land here (a dropped connection
 * to Supabase, a cold start that timed out).
 */
export default function ErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Server errors arrive with a digest instead of a message. Log it so the
    // line can be matched against the server logs.
    console.error("Unhandled error", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-6 py-6">
        <Wordmark href="/" />
      </header>
      <main className="flex flex-1 flex-col justify-center px-6 pb-16">
        <div className="mx-auto flex w-full max-w-[420px] flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="headline">That didn&rsquo;t load.</h1>
            <p className="text-[17px] leading-relaxed text-muted">
              Something broke on our end, not yours. Try again — it often works
              the second time.
            </p>
          </div>
          <Button onClick={() => retry()}>Try again</Button>
          {error.digest ? (
            <p className="text-center font-mono text-[13px] text-muted">
              {error.digest}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
