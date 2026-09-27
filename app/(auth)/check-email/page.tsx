export default function CheckEmail() {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
        <p className="text-muted">
          We've sent you a confirmation link. Click it to activate your account.
        </p>
      </div>
      <p className="text-sm text-muted">
        Don't see it? Check your spam folder or{" "}
        <a href="/signup" className="text-accent font-medium hover:opacity-80">
          try again
        </a>
        .
      </p>
    </div>
  );
}
