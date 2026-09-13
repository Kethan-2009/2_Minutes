"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormError } from "@/components/ui/form-error";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import { signIn } from "../actions";
import { emptyAuthFormState } from "../form-state";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signIn, emptyAuthFormState);

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="flex flex-col gap-5">
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
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={state.fieldErrors.password}
          required
        />
      </div>

      <FormError message={state.error} />

      <SubmitButton pendingLabel="Logging you in…">Log in</SubmitButton>

      <p className="text-center text-[15px]">
        <Link
          href="/forgot-password"
          className="text-muted underline underline-offset-4 hover:text-ink"
        >
          Forgot your password?
        </Link>
      </p>

      <p className="text-center text-[15px] text-muted">
        No account yet?{" "}
        <Link href="/signup" className="font-semibold text-ink underline underline-offset-4">
          Create one
        </Link>
      </p>
    </form>
  );
}
