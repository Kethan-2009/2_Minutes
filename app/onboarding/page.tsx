"use client";

import { createGoal, GoalFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionState, useState } from "react";

type Step = "type" | "title" | "deadline" | "commitments" | "review";

const STEPS: Step[] = ["type", "title", "deadline", "commitments", "review"];

export default function Onboarding() {
  const [step, setStep] = useState<Step>("type");
  const [goalType, setGoalType] = useState<"short_term" | "long_term">(
    "long_term"
  );
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [commitments, setCommitments] = useState(["", "", ""]);
  const [state, formAction, isPending] = useActionState<
    GoalFormState,
    FormData
  >(createGoal, {});

  const index = STEPS.indexOf(step);
  const next = () => index < STEPS.length - 1 && setStep(STEPS[index + 1]);
  const prev = () => index > 0 && setStep(STEPS[index - 1]);

  const canProceed = () => {
    if (step === "title") return title.trim().length > 0;
    if (step === "deadline") return deadline !== "";
    return true;
  };

  const handleSubmit = (formData: FormData) => {
    formData.set("goalType", goalType);
    formData.set("title", title.trim());
    formData.set("deadline", deadline);
    commitments.forEach((c, i) => formData.set(`commitment${i + 1}`, c.trim()));
    formAction(formData);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      {/* Step marks: this really is a sequence, so the count is information. */}
      <div className="mb-16 flex gap-2" aria-hidden="true">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`h-[2px] flex-1 transition-colors duration-300 ${
              i <= index ? "bg-ink" : "bg-rule"
            }`}
          />
        ))}
      </div>

      {step === "type" && (
        <div>
          <h1 className="mb-10 font-display text-title font-medium text-ink">
            What kind of thing is this?
          </h1>

          <div className="space-y-px">
            {(
              [
                {
                  value: "short_term",
                  name: "Something to finish",
                  blurb:
                    "One piece of work with an end: an essay, an application, a feature.",
                },
                {
                  value: "long_term",
                  name: "Something to keep doing",
                  blurb:
                    "A habit you're building over months, with a few things you repeat each week.",
                },
              ] as const
            ).map((opt) => {
              const active = goalType === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer gap-4 border-l-2 py-5 pl-5 transition-colors ${
                    active
                      ? "border-ink bg-raised"
                      : "border-rule hover:border-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="goalTypeChoice"
                    value={opt.value}
                    checked={active}
                    onChange={() => setGoalType(opt.value)}
                    className="sr-only"
                  />
                  <span>
                    <span className="block text-lg text-ink">{opt.name}</span>
                    <span className="mt-1 block max-w-[48ch] text-muted">
                      {opt.blurb}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {step === "title" && (
        <div>
          <h1 className="mb-4 font-display text-title font-medium text-ink">
            What are you finishing?
          </h1>
          <p className="mb-12 max-w-[50ch] text-muted">
            Write it so that in six weeks you can tell, without arguing with
            yourself, whether you did it.
          </p>
          <Input
            name="titleField"
            label="The goal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Finish every section of my Common App essay"
            maxLength={100}
            autoFocus
          />
          <p className="tnum mt-3 text-sm text-muted">
            {title.length}/100
          </p>
        </div>
      )}

      {step === "deadline" && (
        <div>
          <h1 className="mb-4 font-display text-title font-medium text-ink">
            By when?
          </h1>
          <p className="mb-12 max-w-[50ch] text-muted">
            Pick the real date, not the comfortable one. Everything after this
            counts down to it.
          </p>
          <Input
            name="deadlineField"
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={today}
            autoFocus
          />
        </div>
      )}

      {step === "commitments" && (
        <div>
          <h1 className="mb-4 font-display text-title font-medium text-ink">
            {goalType === "long_term" ? "What do you repeat?" : "That's the setup."}
          </h1>
          <p className="mb-12 max-w-[50ch] text-muted">
            {goalType === "long_term"
              ? "Name up to three things you'll do every week. These are what you get measured against."
              : "Nothing weekly to set for a one-off. You'll check in daily until it's done."}
          </p>

          {goalType === "long_term" && (
            <div className="space-y-10">
              {commitments.map((commitment, i) => (
                <Textarea
                  key={i}
                  name={`commitmentField${i}`}
                  label={`Weekly thing ${i + 1}${i > 0 ? " (optional)" : ""}`}
                  value={commitment}
                  onChange={(e) => {
                    const copy = [...commitments];
                    copy[i] = e.target.value;
                    setCommitments(copy);
                  }}
                  placeholder={
                    ["Draft 500 words", "Read 50 pages", "One mock exam"][i]
                  }
                  maxLength={200}
                  rows={2}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {step === "review" && (
        <div>
          <h1 className="mb-12 font-display text-title font-medium text-ink">
            This is what you're committing to.
          </h1>

          <dl className="mb-12 space-y-8">
            <div className="border-b border-rule pb-8">
              <dt className="mb-2 text-sm text-muted">The goal</dt>
              <dd className="font-display text-2xl leading-snug text-ink">
                {title}
              </dd>
            </div>
            <div className="border-b border-rule pb-8">
              <dt className="mb-2 text-sm text-muted">Deadline</dt>
              <dd className="tnum text-2xl text-ink">
                {deadline &&
                  new Date(`${deadline}T00:00:00`).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
              </dd>
            </div>
            {goalType === "long_term" &&
              commitments.some((c) => c.trim()) && (
                <div className="border-b border-rule pb-8">
                  <dt className="mb-3 text-sm text-muted">Every week</dt>
                  <dd>
                    <ul className="space-y-2">
                      {commitments
                        .filter((c) => c.trim())
                        .map((c, i) => (
                          <li key={i} className="text-lg text-ink">
                            {c}
                          </li>
                        ))}
                    </ul>
                  </dd>
                </div>
              )}
          </dl>

          {state.error && (
            <p
              role="alert"
              className="mb-8 border-l-2 border-gone pl-4 text-sm text-gone"
            >
              {state.error}
            </p>
          )}
        </div>
      )}

      <div className="mt-16 flex items-center gap-6">
        {step !== "review" ? (
          <>
            <Button onClick={next} disabled={!canProceed()} size="lg">
              Continue
            </Button>
            {index > 0 && (
              <button
                type="button"
                onClick={prev}
                className="text-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
              >
                Back
              </button>
            )}
          </>
        ) : (
          <form action={handleSubmit} className="flex items-center gap-6">
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Starting…" : "Start the clock"}
            </Button>
            <button
              type="button"
              onClick={prev}
              disabled={isPending}
              className="text-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink hover:decoration-ink disabled:opacity-40"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
