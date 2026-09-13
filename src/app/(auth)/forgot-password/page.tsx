import type { Metadata } from "next";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password · Two Minutes",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="headline">Reset your password.</h1>
        <p className="text-[17px] leading-relaxed text-muted">
          Tell us your email and we&rsquo;ll send you a link.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
