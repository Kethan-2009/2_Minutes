"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Goal = {
  id: string;
  title: string;
  goal_type: "short_term" | "long_term";
  deadline: string;
  status: string;
  created_at: string;
};

export default function Dashboard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchGoals() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/signin");
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          setError("Failed to load goals");
          return;
        }

        setGoals(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchGoals();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted">Loading your goals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Your Goals</h1>
        <p className="text-muted">
          {goals.length === 0
            ? "No goals yet. Create one to get started."
            : `You have ${goals.length} goal${goals.length !== 1 ? "s" : ""}.`}
        </p>
      </div>

      {goals.length === 0 ? (
        <div className="p-6 bg-line rounded text-center">
          <p className="text-muted mb-4">
            Ready to commit to something? Start a new goal.
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="px-4 py-2 bg-accent text-white rounded hover:opacity-90"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="p-6 bg-line rounded border border-canvas"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-xl font-bold text-ink">{goal.title}</h2>
                  <p className="text-sm text-muted mt-1">
                    {goal.goal_type === "short_term"
                      ? "Short-term goal"
                      : "Long-term goal"}
                  </p>
                </div>
                <span className="px-3 py-1 bg-accent/10 text-accent rounded text-sm font-medium">
                  {goal.status}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-canvas">
                <p className="text-sm text-muted">
                  Deadline: {new Date(goal.deadline).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => router.push(`/goal/${goal.id}`)}
                className="mt-4 w-full px-4 py-2 bg-accent text-white rounded hover:opacity-90"
              >
                Check In
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
