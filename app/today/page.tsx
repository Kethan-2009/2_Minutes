import { getUser } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DayLedger } from "@/components/day-ledger";
import { signOut } from "../(auth)/actions";

export const dynamic = "force-dynamic";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function Today() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  if (!goals || goals.length === 0) redirect("/onboarding");

  const goal = goals[0];
  const today = startOfDay(new Date());
  const deadline = startOfDay(new Date(goal.deadline));
  const daysLeft = Math.round(
    (deadline.getTime() - today.getTime()) / 86400000
  );

  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("check_in_date")
    .eq("user_id", user.id)
    .eq("goal_id", goal.id);

  const checkedDates = (checkIns ?? []).map((c) =>
    String(c.check_in_date).slice(0, 10)
  );
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const checkedInToday = checkedDates.includes(todayKey);

  const overdue = daysLeft < 0;

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-10 sm:py-16">
      <header className="mb-16 flex items-baseline justify-between">
        <Link
          href="/today"
          className="font-display text-lg text-ink no-underline"
        >
          Two Minutes
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            Sign out
          </button>
        </form>
      </header>

      <p className="mb-3 text-sm text-muted">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>

      <h1 className="font-display text-title mb-10 max-w-[18ch] font-medium text-ink sm:text-display">
        {goal.title}
      </h1>

      <div className="mb-12 flex items-baseline gap-3 border-b border-rule pb-12">
        <span
          className={`tnum font-display text-6xl font-medium leading-none ${
            overdue ? "text-gone" : "text-ink"
          }`}
        >
          {Math.abs(daysLeft)}
        </span>
        <span className="text-lg text-muted">
          {overdue
            ? `days past the deadline`
            : daysLeft === 0
              ? "— the deadline is today"
              : `day${daysLeft === 1 ? "" : "s"} until ${deadline.toLocaleDateString(
                  "en-US",
                  { month: "long", day: "numeric" }
                )}`}
        </span>
      </div>

      <section className="mb-14">
        <DayLedger
          start={goal.created_at ?? new Date()}
          end={goal.deadline}
          checkedInDates={checkedDates}
        />
      </section>

      {checkedInToday ? (
        <div className="border-l-2 border-kept pl-5">
          <p className="mb-1 text-lg text-ink">Checked in today.</p>
          <p className="text-muted">Come back tomorrow.</p>
        </div>
      ) : (
        <div>
          <p className="mb-6 font-display text-2xl text-ink">
            Did you move this forward today?
          </p>
          <Link
            href={`/check-in/${goal.id}`}
            className="inline-flex items-center rounded-[2px] bg-ink px-7 py-3.5 text-lg font-medium text-paper no-underline transition-colors hover:bg-kept"
          >
            Check in
          </Link>
        </div>
      )}

      <footer className="mt-20 border-t border-rule pt-6">
        <Link
          href={`/pivot/${goal.id}`}
          className="text-sm text-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
        >
          This goal is wrong for me
        </Link>
      </footer>
    </main>
  );
}
