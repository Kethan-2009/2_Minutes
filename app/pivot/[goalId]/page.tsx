"use client";

import { requestPivot, PivotFormState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function Pivot() {
  const params = useParams();
  const goalId = params.goalId as string;

  // Same fix as the check-in page: let useActionState own the result so the
  // decision actually reaches the view.
  const [state, formAction, isPending] = useActionState<
    PivotFormState,
    FormData
  >((prevState, formData) => requestPivot(goalId, prevState, formData), {});

  if (state.success && state.decision) {
    const approved = state.decision === "approved";
    return (
      <div className="py-6">
        <h1
          className={`mb-6 font-display text-title font-medium ${
            approved ? "text-ink" : "text-gone"
          }`}
        >
          {approved ? "Changed." : "Not this time."}
        </h1>

        <blockquote
          className={`mb-10 border-l-2 pl-6 ${
            approved ? "border-kept" : "border-gone"
          }`}
        >
          <p className="text-lg leading-relaxed text-ink">{state.reasoning}</p>
        </blockquote>

        <p className="mb-12 max-w-[50ch] text-muted">
          {approved
            ? "The new goal is live and the clock restarts on it."
            : "The original goal stands. You can ask again once something has actually changed."}
        </p>

        <Link
          href="/today"
          className="inline-flex items-center rounded-[2px] bg-ink px-7 py-3.5 text-lg font-medium text-paper no-underline transition-colors hover:bg-kept"
        >
          Back to the goal
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h1 className="mb-4 font-display text-title font-medium text-ink">
        Changing the goal.
      </h1>
      <p className="mb-14 max-w-[52ch] text-lg text-muted">
        Wanting out and outgrowing something look identical from the inside.
        Give three reasons, and the AI decides which one this is.
      </p>

      <form action={formAction} className="space-y-12">
        <Input
          name="newGoal"
          label="What you'd do instead"
          placeholder="Finish the NC State supplemental essays"
          disabled={isPending}
          required
        />

        <Textarea
          name="reason1"
          label="First reason"
          placeholder="The deadline for this moved up and it now matters more"
          rows={2}
          disabled={isPending}
          required
        />

        <Textarea
          name="reason2"
          label="Second reason"
          placeholder="The original goal was a means to this one anyway"
          rows={2}
          disabled={isPending}
          required
        />

        <Textarea
          name="reason3"
          label="Third reason"
          placeholder="I can still come back to the first one in December"
          rows={2}
          disabled={isPending}
          required
        />

        {state.error && (
          <p role="alert" className="border-l-2 border-gone pl-4 text-sm text-gone">
            {state.error}
          </p>
        )}

        <div className="flex items-center gap-6">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Weighing it…" : "Make the case"}
          </Button>
          <Link
            href="/today"
            className="text-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            Keep the goal
          </Link>
        </div>
      </form>
    </div>
  );
}
