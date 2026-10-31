import { getUser } from "@/lib/supabase/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getUser();
  if (user) redirect("/today");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-16">
      <p className="mb-10 font-display text-lg text-ink">Two Minutes</p>

      <h1 className="font-display text-title mb-8 max-w-[14ch] font-medium leading-[0.95] text-ink sm:text-display">
        Most goals die quietly.
      </h1>

      <p className="mb-12 max-w-[52ch] text-lg leading-relaxed text-muted">
        You name one thing you're going to finish and set the date. Every day
        after that takes two minutes: you say what you did, and an AI that has
        read your whole record decides whether you're actually moving. It keeps
        the ledger, including the days you skipped.
      </p>

      <div className="flex flex-wrap items-center gap-6">
        <Link
          href="/signup"
          className="inline-flex items-center rounded-[2px] bg-ink px-7 py-3.5 text-lg font-medium text-paper no-underline transition-colors hover:bg-kept"
        >
          Name a goal
        </Link>
        <Link
          href="/login"
          className="text-lg text-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
