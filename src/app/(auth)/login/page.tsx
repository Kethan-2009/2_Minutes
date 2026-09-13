import type { Metadata } from "next";

import { FormError } from "@/components/ui/form-error";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in · Two Minutes",
};

const LINK_ERRORS: Record<string, string> = {
  "link-invalid": "That link didn't look right. Try logging in below.",
  "link-expired":
    "That link has expired. Log in below, or sign up again to get a fresh one.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const linkError =
    typeof params.error === "string" ? LINK_ERRORS[params.error] : undefined;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="headline">Welcome back.</h1>
        <p className="text-[17px] leading-relaxed text-muted">
          Pick up where you left off.
        </p>
      </div>
      <FormError message={linkError} />
      <LoginForm next={next} />
    </div>
  );
}
