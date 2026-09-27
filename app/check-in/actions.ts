"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/supabase/session";
import { env } from "@/lib/env";

export type CheckInFormState = {
  success?: boolean;
  error?: string;
  aiResponse?: string;
};

export async function submitCheckIn(
  goalId: string,
  prevState: CheckInFormState,
  formData: FormData
): Promise<CheckInFormState> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const whatDidYouDo = formData.get("whatDidYouDo")?.toString() || "";
    const whatDidYouSkip = formData.get("whatDidYouSkip")?.toString() || "";
    const why = formData.get("why")?.toString() || "";

    if (!whatDidYouDo && !whatDidYouSkip) {
      return { error: "Tell me something about today." };
    }

    // Get the goal
    const { data: goal, error: goalError } = await supabase
      .from("goals")
      .select("*")
      .eq("id", goalId)
      .eq("user_id", user.id)
      .single();

    if (goalError || !goal) {
      return { error: "Goal not found" };
    }

    // Get previous check-ins for context
    const { data: previousCheckIns } = await supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", user.id)
      .eq("goal_id", goalId)
      .order("check_in_date", { ascending: false })
      .limit(7);

    // Call Anthropic API to get AI response
    let aiResponse = "";
    if (env.ANTHROPIC_API_KEY) {
      const prompt = buildCheckInPrompt(
        goal,
        whatDidYouDo,
        whatDidYouSkip,
        why,
        previousCheckIns || []
      );

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
            max_tokens: 300,
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
          aiResponse =
            data.content[0]?.text || "Keep pushing. You've got this.";
        } else {
          aiResponse = "Keep pushing. You've got this.";
        }
      } catch {
        aiResponse = "Keep pushing. You've got this.";
      }
    }

    // Save the check-in
    const today = new Date().toISOString().split("T")[0];
    const { error: checkInError } = await supabase.from("check_ins").upsert({
      user_id: user.id,
      goal_id: goalId,
      check_in_date: today,
      what_did_you_do: whatDidYouDo,
      what_did_you_skip: whatDidYouSkip,
      why,
      ai_response: aiResponse,
    });

    if (checkInError) {
      return { error: "Failed to save check-in" };
    }

    return {
      success: true,
      aiResponse,
    };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unexpected error occurred",
    };
  }
}

function buildCheckInPrompt(
  goal: {
    title: string;
    goal_type: string;
    deadline: string;
  },
  whatDidYouDo: string,
  whatDidYouSkip: string,
  why: string,
  previousCheckIns: Array<{
    what_did_you_do: string;
    what_did_you_skip: string;
    ai_response: string;
  }>
): string {
  const previousPattern = previousCheckIns
    .slice(0, 3)
    .map(
      (ci, idx) =>
        `Day ${idx + 1}: Did ${ci.what_did_you_do || "(nothing)"}. Skipped: ${ci.what_did_you_skip || "nothing"}. Response: ${ci.ai_response}`
    )
    .join("\n");

  return `You are an accountability partner. The user has a goal: "${goal.title}" (${goal.goal_type === "long_term" ? "long-term" : "short-term"}).

Today they told you:
- What they did: "${whatDidYouDo || "(nothing)"}"
- What they skipped: "${whatDidYouSkip || "(nothing)"}"
- Why: "${why || "(no explanation)"}"

${previousPattern ? `Recent pattern:\n${previousPattern}\n` : ""}

Respond in 1-2 sentences. Be direct + empathetic. If they're drifting, name the pattern. If they're on track, acknowledge it. Don't celebrate—just be real.`;
}
