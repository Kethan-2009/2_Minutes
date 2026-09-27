"use client";

import { createGoal, GoalFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionState, useState } from "react";

type Step = "type" | "title" | "deadline" | "commitments" | "review";

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

  const handleNext = () => {
    const steps: Step[] = ["type", "title", "deadline", "commitments", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const steps: Step[] = ["type", "title", "deadline", "commitments", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const canProceed = () => {
    if (step === "type") return true;
    if (step === "title") return title.trim().length > 0;
    if (step === "deadline") return deadline !== "";
    if (step === "commitments") {
      return (
        goalType === "short_term" ||
        commitments.filter((c) => c.trim().length > 0).length > 0
      );
    }
    return true;
  };

  const handleSubmit = (formData: FormData) => {
    formData.set("goalType", goalType);
    formData.set("title", title);
    formData.set("deadline", deadline);
    commitments.forEach((c, i) => {
      formData.set(`commitment${i + 1}`, c);
    });
    formAction(formData);
  };

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="bg-line rounded-full h-2 overflow-hidden">
        <div
          className="bg-accent h-full transition-all duration-300"
          style={{
            width:
              step === "type"
                ? "20%"
                : step === "title"
                  ? "40%"
                  : step === "deadline"
                    ? "60%"
                    : step === "commitments"
                      ? "80%"
                      : "100%",
          }}
        />
      </div>

      {/* Step: Choose goal type */}
      {step === "type" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">What's your goal?</h2>
            <p className="text-muted">
              Short-term goals are quick wins. Long-term goals are ongoing
              commitments with weekly milestones.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block p-4 border-2 rounded cursor-pointer transition-colors"
              style={{
                borderColor: goalType === "short_term" ? "var(--accent)" : "var(--line)",
                backgroundColor:
                  goalType === "short_term" ? "rgba(0, 102, 255, 0.05)" : "transparent",
              }}
            >
              <input
                type="radio"
                value="short_term"
                checked={goalType === "short_term"}
                onChange={(e) => setGoalType(e.target.value as "short_term")}
                className="mr-3"
              />
              <span className="font-medium">Short-term goal</span>
              <p className="text-sm text-muted mt-1">
                Finish something in the next few weeks (e.g., write an essay,
                build a feature)
              </p>
            </label>

            <label className="block p-4 border-2 rounded cursor-pointer transition-colors"
              style={{
                borderColor: goalType === "long_term" ? "var(--accent)" : "var(--line)",
                backgroundColor:
                  goalType === "long_term" ? "rgba(0, 102, 255, 0.05)" : "transparent",
              }}
            >
              <input
                type="radio"
                value="long_term"
                checked={goalType === "long_term"}
                onChange={(e) => setGoalType(e.target.value as "long_term")}
                className="mr-3"
              />
              <span className="font-medium">Long-term goal</span>
              <p className="text-sm text-muted mt-1">
                Build a skill over months with weekly commitments (e.g., learn
                to code, write a novel)
              </p>
            </label>
          </div>
        </div>
      )}

      {/* Step: Goal title */}
      {step === "title" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">What's the goal?</h2>
            <p className="text-muted">Be specific. "Learn React" not "get better at coding."</p>
          </div>
          <Input
            label="Goal title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Learn React, Write 50k words, Run a 5K"
            maxLength={100}
            autoFocus
          />
          <p className="text-xs text-muted">{title.length}/100</p>
        </div>
      )}

      {/* Step: Deadline */}
      {step === "deadline" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">When do you finish?</h2>
            <p className="text-muted">Set a real deadline. The AI will hold you to it.</p>
          </div>
          <Input
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            autoFocus
          />
        </div>
      )}

      {/* Step: Commitments (for long-term goals) */}
      {step === "commitments" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Weekly commitments</h2>
            <p className="text-muted">
              {goalType === "short_term"
                ? "You're all set. Short-term goals don't need weekly milestones."
                : "What will you do each week to make progress? Be specific."}
            </p>
          </div>

          {goalType === "long_term" && (
            <div className="space-y-3">
              {commitments.map((commitment, idx) => (
                <Textarea
                  key={idx}
                  label={`Commitment ${idx + 1}`}
                  value={commitment}
                  onChange={(e) => {
                    const newCommitments = [...commitments];
                    newCommitments[idx] = e.target.value;
                    setCommitments(newCommitments);
                  }}
                  placeholder="e.g., Build 1 small feature, Read 50 pages, Run 3x"
                  maxLength={200}
                  rows={2}
                />
              ))}
            </div>
          )}

          {goalType === "short_term" && (
            <div className="p-4 bg-line rounded">
              <p className="text-sm text-muted">
                You'll check in daily on your progress. The AI will keep you honest.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step: Review */}
      {step === "review" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Let's go.</h2>
            <p className="text-muted mb-6">Here's what you're committing to:</p>
          </div>

          <div className="space-y-4 p-4 bg-line rounded">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Goal</p>
              <p className="text-lg font-bold">{title}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Deadline</p>
              <p className="text-lg font-bold">
                {new Date(deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            {goalType === "long_term" &&
              commitments.filter((c) => c.trim().length > 0).length > 0 && (
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide">Weekly</p>
                  <ul className="space-y-1">
                    {commitments
                      .filter((c) => c.trim().length > 0)
                      .map((c, idx) => (
                        <li key={idx} className="text-sm text-ink">
                          • {c}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
          </div>

          {state.error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded text-red-900 text-sm">
              {state.error}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 justify-between">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={step === "type" || isPending}
        >
          Back
        </Button>

        {step !== "review" ? (
          <Button onClick={handleNext} disabled={!canProceed() || isPending}>
            Next
          </Button>
        ) : (
          <form action={handleSubmit} className="flex-1">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating goal..." : "Start"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
