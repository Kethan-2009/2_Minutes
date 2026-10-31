import Link from "next/link";

export default function CheckEmail() {
  return (
    <div>
      <h1 className="mb-6 font-display text-title font-medium text-ink">
        Check your email.
      </h1>
      <p className="mb-10 text-lg leading-relaxed text-muted">
        There's a confirmation link waiting. Open it and you're in.
      </p>
      <p className="text-sm text-muted">
        Nothing there? Look in spam, or{" "}
        <Link
          href="/signup"
          className="text-ink underline decoration-rule underline-offset-4 hover:decoration-ink"
        >
          sign up again
        </Link>
        .
      </p>
    </div>
  );
}
