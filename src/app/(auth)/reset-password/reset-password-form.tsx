"use client";

import { useActionState } from "react";

import { FormError } from "@/components/ui/form-error";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";
import { updatePassword } from "../actions";
import { emptyAuthFormState } from "../form-state";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(
    updatePassword,
    emptyAuthFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-5">
        <TextField
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
          error={state.fieldErrors.password}
          required
        />
        <TextField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={state.fieldErrors.confirmPassword}
          required
        />
      </div>

      <FormError message={state.error} />

      <SubmitButton pendingLabel="Saving…">Set new password</SubmitButton>
    </form>
  );
}
