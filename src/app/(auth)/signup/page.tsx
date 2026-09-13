import type { Metadata } from "next";

import { SignUpForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create your account · Two Minutes",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="headline">Start something you&rsquo;ll finish.</h1>
        <p className="text-[17px] leading-relaxed text-muted">
          Two minutes a day. You say what you did, what you skipped, and why.
          Nobody sees it but you.
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
