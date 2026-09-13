"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormError } from "@/components/ui/form-error";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import { requestPasswordReset } from "../actions";
import { emptyAuthFormState } from "../form-state";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    requestPasswordReset,
    emptyAuthFormState,
  );

  if (state.done) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-[17px] leading-relaxed text-muted">
          If there&rsquo;s an account for{" "}
          <span className="font-medium text-ink">{state.values.email}</span>,
          a reset link is on its way. Open it and you can set a new password.
        </p>
        <Link
          href="/login"
          className="text-[15px] font-semibold text-ink underline underline-offset-4"
        >
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <TextField
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        defaultValue={state.values.email}
        placeholder="you@school.edu"
        error={state.fieldErrors.email}
        required
      />

      <FormError message={state.error} />

      <SubmitButton pendingLabel="Sending…">Send reset link</SubmitButton>

      <p className="text-center text-[15px] text-muted">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-semibold text-ink underline underline-offset-4"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
