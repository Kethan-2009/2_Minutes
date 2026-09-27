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
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <Input
          name="email"
          type="email"
          placeholder="your@email.com"
          label="Email"
          required
          disabled={isPending}
        />

        <Input
          name="password"
          type="password"
          placeholder="••••••••"
          label="Password (at least 8 characters)"
          required
          disabled={isPending}
        />

        <Input
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          label="Confirm Password"
          required
          disabled={isPending}
        />

        {state.error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-900 text-sm">
            {state.error}
          </div>
        )}

        {state.success && (
          <div className="p-3 bg-green-100 border border-green-300 rounded text-green-900 text-sm">
            Check your email to confirm your account.
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent font-medium hover:opacity-80">
          Log in
        </Link>
      </p>
    </div>
  );
}
