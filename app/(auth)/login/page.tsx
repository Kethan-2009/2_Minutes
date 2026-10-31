"use client";

import { signIn } from "../actions";
import { FormState } from "../form-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState } from "react";

export default function Login() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    signIn,
    {}
  );

  return (
    <div>
      <h1 className="mb-10 font-display text-title font-medium text-ink">
        Welcome back.
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
          label="Password"
          autoComplete="current-password"
          required
          disabled={isPending}
        />

        {state.error && (
          <p role="alert" className="border-l-2 border-gone pl-4 text-sm text-gone">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={isPending} size="lg" className="w-full">
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-10 text-sm text-muted">
        No account yet?{" "}
        <Link
          href="/signup"
          className="text-ink underline decoration-rule underline-offset-4 hover:decoration-ink"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
