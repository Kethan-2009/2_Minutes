"use client";

import { signUp } from "../actions";
import { FormState } from "../form-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState } from "react";

export default function SignUp() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    signUp,
    {}
  );

  return (
    <div>
      <h1 className="mb-10 font-display text-title font-medium text-ink">
        Name one thing you'll finish.
      </h1>

      <form action={formAction} className="space-y-8">
        <Input
          name="email"
          type="email"
          placeholder="you@email.com"
          label="Email"
          autoComplete="email"
          required
          disabled={isPending}
        />

        <Input
          name="password"
          type="password"
          placeholder="••••••••"
          label="Password, at least 8 characters"
          autoComplete="new-password"
          required
          disabled={isPending}
        />

        <Input
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          label="Password again"
          autoComplete="new-password"
          required
          disabled={isPending}
        />

        {state.error && (
          <p role="alert" className="border-l-2 border-gone pl-4 text-sm text-gone">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="border-l-2 border-kept pl-4 text-sm text-ink">
            Check your email to confirm the account.
          </p>
        )}

        <Button type="submit" disabled={isPending} size="lg" className="w-full">
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-10 text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-ink underline decoration-rule underline-offset-4 hover:decoration-ink"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
