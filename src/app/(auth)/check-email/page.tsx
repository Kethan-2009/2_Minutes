import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Check your email · Two Minutes",
};

export default async function CheckEmailPage({
  searchParams,
}: PageProps<"/check-email">) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="headline">Check your email.</h1>
        <p className="text-[17px] leading-relaxed text-muted">
          {email ? (
            <>
              We sent a confirmation link to{" "}
              <span className="font-medium text-ink">{email}</span>. Open it and
              you&rsquo;re in.
            </>
          ) : (
            <>We sent you a confirmation link. Open it and you&rsquo;re in.</>
          )}
        </p>
      </div>
      <ButtonLink href="/login" variant="secondary">
        Back to log in
      </ButtonLink>
    </div>
  );
}
