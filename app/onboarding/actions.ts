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
  // NOTE: redirect() throws NEXT_REDIRECT internally. Keep it outside the
  // try/catch below, or the catch swallows it and the form silently stalls.
  let created = false;

  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const title = formData.get("title")?.toString().trim() || "";
    const goalType = formData.get("goalType")?.toString() || "long_term";
    const deadline = formData.get("deadline")?.toString() || "";

    if (!validateGoalTitle(title)) {
      return { error: "Give the goal a title between 1 and 100 characters." };
    }

    if (!deadline) {
      return { error: "Pick a deadline." };
    }

    const deadlineDate = new Date(`${deadline}T23:59:59`);
    if (Number.isNaN(deadlineDate.getTime())) {
      return { error: "That deadline isn't a valid date." };
    }
    if (deadlineDate <= new Date()) {
      return { error: "The deadline has to be in the future." };
    }

    if (!["short_term", "long_term"].includes(goalType)) {
      return { error: "Pick a goal type." };
    }

    // One active goal at a time. Re-running onboarding replaces the old one
    // rather than stacking duplicates (the cause of the 5 identical rows).
    const { data: existing } = await supabase
      .from("goals")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (existing && existing.length > 0) {
      await supabase
        .from("goals")
        .update({ status: "abandoned" })
        .eq("user_id", user.id)
        .eq("status", "active");
    }

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
      return { error: "Couldn't save the goal. Try again." };
    }

    if (goalType === "long_term") {
      const commitmentArray: Array<{
        goal_id: string;
        user_id: string;
        title: string;
        week_starting: string;
      }> = [];

      const weekStarting = new Date();
      weekStarting.setDate(weekStarting.getDate() - weekStarting.getDay());
      weekStarting.setHours(0, 0, 0, 0);

      for (let i = 1; i <= 3; i++) {
        const commitment = formData.get(`commitment${i}`)?.toString().trim() || "";
        if (commitment && validateCommitment(commitment)) {
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
          return { error: "Saved the goal, but the weekly commitments didn't save." };
        }
      }
    }

    created = true;
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Something went wrong. Try again.",
    };
  }

  if (created) {
    redirect("/today");
  }

  return { error: "Something went wrong. Try again." };
}
