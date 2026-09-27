"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/supabase/session";
import { validateGoalTitle, validateCommitment } from "@/lib/validation";
import { redirect } from "next/navigation";

export type GoalFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createGoal(
  prevState: GoalFormState,
  formData: FormData
): Promise<GoalFormState> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const title = formData.get("title")?.toString() || "";
    const goalType = formData.get("goalType")?.toString() || "long_term";
    const deadline = formData.get("deadline")?.toString() || "";

    // Validate inputs
    if (!validateGoalTitle(title)) {
      return { error: "Goal title must be 1-100 characters" };
    }

    if (!deadline) {
      return { error: "Deadline is required" };
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return { error: "Deadline must be in the future" };
    }

    if (!["short_term", "long_term"].includes(goalType)) {
      return { error: "Invalid goal type" };
    }

    // Create the goal
    const { data: goal, error: goalError } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title,
        goal_type: goalType,
        deadline: deadlineDate.toISOString(),
        status: "active",
      })
      .select()
      .single();

    if (goalError || !goal) {
      return { error: "Failed to create goal. Please try again." };
    }

    // If long-term goal, create the initial commitments
    if (goalType === "long_term") {
      const commitmentArray: Array<{
        goal_id: string;
        user_id: string;
        title: string;
        week_starting: string;
      }> = [];

      for (let i = 1; i <= 3; i++) {
        const commitment = formData.get(`commitment${i}`)?.toString() || "";
        if (commitment && validateCommitment(commitment)) {
          const weekStarting = new Date();
          weekStarting.setDate(weekStarting.getDate() - weekStarting.getDay());
          weekStarting.setHours(0, 0, 0, 0);

          commitmentArray.push({
            goal_id: goal.id,
            user_id: user.id,
            title: commitment,
            week_starting: weekStarting.toISOString().split("T")[0],
          });
        }
      }

      if (commitmentArray.length > 0) {
        const { error: commitmentError } = await supabase
          .from("commitments")
          .insert(commitmentArray);

        if (commitmentError) {
          return { error: "Created goal but failed to save commitments." };
        }
      }
    }

    redirect("/dashboard");
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unexpected error occurred",
    };
  }
}
