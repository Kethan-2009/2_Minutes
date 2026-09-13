import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { createClient } from "@/lib/supabase/server";
import { isPreviewMode } from "@/lib/env";

export default async function HomePage() {
  if (!isPreviewMode) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Signed in? There is nothing to sell you. Go straight to today.
    if (user) redirect("/today");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-6 py-6">
        <Wordmark />
      </header>

      <main className="flex flex-1 flex-col justify-center px-6 pb-16">
        <div className="mx-auto w-full max-w-[420px] flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h1 className="headline">
              You start things.
              <br />
              Let&rsquo;s finish one.
            </h1>
            <p className="text-[17px] leading-relaxed text-muted">
              Set a goal. Commit to a few things each week. Check in for two
              minutes a day — honestly. Two Minutes remembers what you said and
              won&rsquo;t let you quietly drift.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <ButtonLink href="/signup">Get started</ButtonLink>
            <ButtonLink href="/login" variant="secondary">
              I already have an account
            </ButtonLink>
          </div>

          <p className="text-[13px] leading-relaxed text-muted">
            What you write stays in your account. It isn&rsquo;t mined, analysed
            for ads, or read by anyone else.
          </p>
        </div>
      </main>
    </div>
  );
}
