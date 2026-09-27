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
          label="Password"
          required
          disabled={isPending}
        />

        {state.error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-900 text-sm">
            {state.error}
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link href="/signup" className="text-accent font-medium hover:opacity-80">
          Sign up
        </Link>
      </p>
    </div>
  );
}
