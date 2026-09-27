"use client";

import { submitCheckIn, CheckInFormState } from "../actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActionState, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CheckIn() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.goalId as string;

  const [showResponse, setShowResponse] = useState(false);
  const [state, formAction, isPending] = useActionState<
    CheckInFormState,
    FormData
  >(async (prevState, formData) => {
    return submitCheckIn(goalId, prevState, formData);
  }, {});

  const handleSubmit = async (formData: FormData) => {
    const result = await submitCheckIn(goalId, {}, formData);
    if (result.success) {
      setShowResponse(true);
    }
  };

  if (showResponse && state.aiResponse) {
    return (
      <div className="space-y-6 py-12">
        <div className="text-center">
          <p className="text-muted mb-4">Here's what I think:</p>
          <div className="p-6 bg-line rounded text-center">
            <p className="text-lg italic text-ink">{state.aiResponse}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => router.push("/today")}>
            Back to goal
          </Button>
          <Button className="flex-1" onClick={() => router.push("/today")}>
            See you tomorrow
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Two minutes</h1>
        <p className="text-muted">
          What happened today? Be honest.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <Textarea
          name="whatDidYouDo"
          label="What did you do?"
          placeholder="e.g., Worked on auth feature for 2 hours"
          rows={3}
          disabled={isPending}
          required
        />

        <Textarea
          name="whatDidYouSkip"
          label="What did you skip? (optional)"
          placeholder="e.g., Didn't write tests like planned"
          rows={3}
          disabled={isPending}
        />

        <Textarea
          name="why"
          label="Why? (optional)"
          placeholder="e.g., Ran out of time, lost focus, something urgent came up"
          rows={3}
          disabled={isPending}
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
            {isPending ? "Thinking..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
