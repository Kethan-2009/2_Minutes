"use client";

import { requestPivot, PivotFormState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionState, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Pivot() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.goalId as string;

  const [showResult, setShowResult] = useState(false);
  const [state, formAction, isPending] = useActionState<
    PivotFormState,
    FormData
  >(async (prevState, formData) => {
    return requestPivot(goalId, prevState, formData);
  }, {});

  const handleSubmit = async (formData: FormData) => {
    const result = await requestPivot(goalId, {}, formData);
    if (result.success) {
      setShowResult(true);
    }
  };

  if (showResult && state.decision) {
    return (
      <div className="space-y-6 py-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {state.decision === "approved" ? "Approved" : "Not yet"}
          </h1>
          <p className="text-muted">{state.reasoning}</p>
        </div>

        <div className="space-y-2">
          {state.decision === "rejected" && (
            <p className="text-sm text-muted">
              Keep pushing. Sometimes the best thing you can do is stick with it.
            </p>
          )}
          {state.decision === "approved" && (
            <p className="text-sm text-muted">
              Your goal has been updated. Go make this new one count.
            </p>
          )}
        </div>

        <Button className="w-full" onClick={() => router.push("/today")}>
          Back to goal
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Change your goal?</h1>
        <p className="text-muted mb-4">
          You'll need to justify it. Convince me this is real.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <Input
          name="newGoal"
          label="New goal"
          placeholder="What do you want to do instead?"
          disabled={isPending}
          required
        />

        <Textarea
          name="reason1"
          label="Reason 1"
          placeholder="e.g., Life circumstances changed, original goal no longer relevant"
          rows={2}
          disabled={isPending}
          required
        />

        <Textarea
          name="reason2"
          label="Reason 2"
          placeholder="e.g., Discovered a more important priority"
          rows={2}
          disabled={isPending}
          required
        />

        <Textarea
          name="reason3"
          label="Reason 3"
          placeholder="e.g., Original goal is no longer achievable given constraints"
          rows={2}
          disabled={isPending}
          required
        />

        {state.error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-900 text-sm">
            {state.error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={() => router.push("/today")}
            disabled={isPending}
          >
            Never mind
          </Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? "Thinking..." : "Request change"}
          </Button>
        </div>
      </form>
    </div>
  );
}
