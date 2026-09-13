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
      {/*
        The browser is the only thing that knows where the user is, and the
        server renders as UTC — so this is filled in on mount via a ref rather
        than through state, which would either mismatch on hydration or cause a
        second render for a value nobody looks at.
      */}
      <input
        type="hidden"
        name="timezone"
        ref={(node) => {
          if (!node) return;
          try {
            node.value = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
          } catch {
            // Leave it empty; the server falls back to UTC.
          }
        }}
      />
      <div className="flex flex-col gap-5">
        <TextField
          label="First name"
          name="name"
          autoComplete="given-name"
          defaultValue={state.values.name}
          placeholder="Alex"
          error={state.fieldErrors.name}
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
          error={state.fieldErrors.email}
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
          error={state.fieldErrors.password}
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
