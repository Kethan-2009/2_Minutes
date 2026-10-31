"use client";

import { submitCheckIn, CheckInFormState } from "../actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CheckIn() {
  const params = useParams();
  const goalId = params.goalId as string;

  // Bind goalId into the action so useActionState owns the result. The previous
  // version called the action directly, so aiResponse never reached the view.
  const [state, formAction, isPending] = useActionState<
    CheckInFormState,
    FormData
  >(
    (prevState, formData) => submitCheckIn(goalId, prevState, formData),
    {}
  );

  if (state.success && state.aiResponse) {
    return (
      <div className="py-6">
        <p className="mb-8 text-sm text-muted">Logged for today.</p>

        <blockquote className="mb-12 border-l-2 border-ink pl-6">
          <p className="font-display text-2xl leading-snug text-ink">
            {state.aiResponse}
          </p>
        </blockquote>

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
      <h1 className="mb-3 font-display text-title font-medium text-ink">
        Two minutes.
      </h1>
      <p className="mb-14 text-lg text-muted">
        Say what actually happened. The vague version is the one you'll regret
        reading back.
      </p>

      <form action={formAction} className="space-y-12">
        <Textarea
          name="whatDidYouDo"
          label="What did you do?"
          placeholder="Wrote the second body paragraph, about 40 minutes"
          rows={3}
          disabled={isPending}
          required
        />

        <Textarea
          name="whatDidYouSkip"
          label="What did you skip?"
          placeholder="Didn't go back and cut the intro like I said I would"
          rows={2}
          disabled={isPending}
        />

        <Textarea
          name="why"
          label="Why?"
          placeholder="Lost the evening to robotics, then didn't want to start"
          rows={2}
          disabled={isPending}
        />

        {state.error && (
          <p role="alert" className="border-l-2 border-gone pl-4 text-sm text-gone">
            {state.error}
          </p>
        )}

        <div className="flex items-center gap-6">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Reading it…" : "Send it"}
          </Button>
          <Link
            href="/today"
            className="text-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            Not now
          </Link>
        </div>
      </form>
    </div>
  );
}
