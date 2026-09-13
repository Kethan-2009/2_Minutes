import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isPreviewMode } from "@/lib/env";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password · Two Minutes",
};

/**
 * Reached only from a recovery link, which signs the user in first. Without
 * that session there is nothing to reset, so send them back to the start.
 */
export default async function ResetPasswordPage() {
  if (!isPreviewMode) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login?error=link-expired");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="headline">Set a new password.</h1>
        <p className="text-[17px] leading-relaxed text-muted">
          Pick something you&rsquo;ll actually remember.
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
