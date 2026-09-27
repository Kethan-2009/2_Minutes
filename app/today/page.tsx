import { getUser } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "../(auth)/actions";

export default async function Today() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has an active goal
  const supabase = await createClient();
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  if (!goals || goals.length === 0) {
    redirect("/onboarding");
  }

  const goal = goals[0];
  const deadline = new Date(goal.deadline);
  const today = new Date();
  const daysLeft = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Get today's check-in
  const todayStr = today.toISOString().split("T")[0];
  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", user.id)
    .eq("goal_id", goal.id)
    .eq("check_in_date", todayStr);

  const checkedInToday = checkIns && checkIns.length > 0;

  return (
    <div className="min-h-screen bg-canvas text-ink p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Two Minutes</h1>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>

        {/* Date and time */}
        <div className="mb-8">
          <p className="text-muted text-sm">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Goal card */}
        <div className="bg-line rounded p-6 mb-6">
          <div className="mb-4">
            <p className="text-xs text-muted uppercase tracking-wide">Goal</p>
            <h2 className="text-2xl font-bold">{goal.title}</h2>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Time left</p>
              <p className="text-lg font-bold text-accent">
                {daysLeft} day{daysLeft !== 1 ? "s" : ""}
              </p>
            </div>
            <p className="text-xs text-muted">
              {checkedInToday ? "✓ Checked in today" : "No check-in yet"}
            </p>
          </div>
        </div>

        {/* Check-in prompt */}
        {!checkedInToday && (
          <div className="bg-accent text-canvas rounded p-6 text-center">
            <p className="mb-4 font-medium">How's it going?</p>
            <Link href={`/check-in/${goal.id}`}>
              <Button className="bg-canvas text-accent hover:opacity-90">
                Start check-in
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
