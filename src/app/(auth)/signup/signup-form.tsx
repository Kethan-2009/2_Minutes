"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormError } from "@/components/ui/form-error";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";
import { signUp } from "../actions";
import { emptyAuthFormState } from "../form-state";

export function SignUpForm() {
  const [state, formAction] = useActionState(signUp, emptyAuthFormState);

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-5">
        <TextField
          label="First name"
          name="name"
          autoComplete="given-name"
          defaultValue={state.values.name}
          placeholder="Alex"
          hint={state.fieldErrors.name}
          aria-invalid={Boolean(state.fieldErrors.name)}
          required
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          defaultValue={state.values.email}
          placeholder="you@school.edu"
          hint={state.fieldErrors.email}
          aria-invalid={Boolean(state.fieldErrors.email)}
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint={state.fieldErrors.password ?? `At least ${PASSWORD_MIN_LENGTH} characters.`}
          aria-invalid={Boolean(state.fieldErrors.password)}
          required
        />
      </div>

      <FormError message={state.error} />

      <SubmitButton pendingLabel="Creating your account…">
        Create account
      </SubmitButton>

      <p className="text-center text-[15px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ink underline underline-offset-4">
          Log in
        </Link>
      </p>
    </form>
  );
}
