"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/supabase/session";
import { env } from "@/lib/env";

export type PivotFormState = {
  success?: boolean;
  error?: string;
  decision?: "approved" | "rejected";
  reasoning?: string;
};

export async function requestPivot(
  goalId: string,
  prevState: PivotFormState,
  formData: FormData
): Promise<PivotFormState> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const newGoal = formData.get("newGoal")?.toString() || "";
    const reason1 = formData.get("reason1")?.toString() || "";
    const reason2 = formData.get("reason2")?.toString() || "";
    const reason3 = formData.get("reason3")?.toString() || "";

    if (!newGoal || !reason1 || !reason2 || !reason3) {
      return { error: "All fields are required" };
    }

    // Get the current goal
    const { data: goal, error: goalError } = await supabase
      .from("goals")
      .select("*")
      .eq("id", goalId)
      .eq("user_id", user.id)
      .single();

    if (goalError || !goal) {
      return { error: "Goal not found" };
    }

    // Call AI to evaluate the pivot
    let decision: "approved" | "rejected" = "rejected";
    let reasoning = "";

    if (env.ANTHROPIC_API_KEY) {
      const prompt = buildPivotPrompt(goal, newGoal, reason1, reason2, reason3);

      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 200,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as {
            content: Array<{ type: string; text: string }>;
          };
          const aiResponse = data.content[0]?.text || "";

          // Parse AI response to extract decision
          if (
            aiResponse.toLowerCase().includes("approved") ||
            aiResponse.toLowerCase().includes("valid reason")
          ) {
            decision = "approved";
          } else {
            decision = "rejected";
          }

          reasoning = aiResponse;
        }
      } catch {
        // Default to rejected if API fails
        decision = "rejected";
        reasoning =
          "I need to make sure this is a genuine pivot, not avoidance.";
      }
    }

    // Save the pivot request
    const { data: pivot, error: pivotError } = await supabase
      .from("pivots")
      .insert({
        user_id: user.id,
        goal_id: goalId,
        requested_new_goal: newGoal,
        reason_1: reason1,
        reason_2: reason2,
        reason_3: reason3,
        ai_decision: decision,
        ai_reasoning: reasoning,
      })
      .select()
      .single();

    if (pivotError || !pivot) {
      return { error: "Failed to save pivot request" };
    }

    // If approved, update the goal
    if (decision === "approved") {
      const { error: updateError } = await supabase
        .from("goals")
        .update({ title: newGoal })
        .eq("id", goalId)
        .eq("user_id", user.id);

      if (updateError) {
        return {
          error: "Pivot approved but failed to update goal. Contact support.",
        };
      }
    }

    return {
      success: true,
      decision,
      reasoning,
    };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unexpected error occurred",
    };
  }
}

function buildPivotPrompt(
  goal: { title: string; deadline: string },
  newGoal: string,
  reason1: string,
  reason2: string,
  reason3: string
): string {
  const goalDeadline = new Date(goal.deadline);
  const today = new Date();
  const daysLeft = Math.ceil(
    (goalDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return `A user wants to change their goal.

Current goal: "${goal.title}" (${daysLeft} days left)
New goal: "${newGoal}"

Their reasons:
1. ${reason1}
2. ${reason2}
3. ${reason3}

Decide if this is a legitimate pivot or avoidance. Consider:
- If they have ${daysLeft} days left, are they genuinely unable to continue (life circumstances changed)?
- Or are they just losing motivation?
- Are the reasons specific or vague?

Respond in 1-2 sentences: APPROVED if it's a valid reason to change. REJECTED if it seems like avoidance. Be firm.`;
}
