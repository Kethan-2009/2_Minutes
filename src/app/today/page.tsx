import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";

export const metadata: Metadata = {
  title: "Today · Two Minutes",
};

/**
 * Placeholder for the morning entry point (date, weather, today's commitments).
 * For now it exists to prove the session survives the round trip.
 */
export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "there";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-6 py-6">
        <Wordmark />
      </header>

      <main className="flex flex-1 flex-col justify-center px-6 pb-16">
        <div className="mx-auto flex w-full max-w-[420px] flex-col gap-10">
          <div className="flex flex-col gap-3">
            <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted">
              {today}
            </p>
            <h1 className="headline">Hey {name}.</h1>
            <p className="text-[17px] leading-relaxed text-muted">
              You&rsquo;re in. Onboarding, goals and the daily check-in land
              here next.
            </p>
          </div>

          <form action={signOut}>
            <Button type="submit" variant="secondary">
              Log out
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
