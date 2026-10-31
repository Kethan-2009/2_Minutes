import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <Link
        href="/"
        className="mb-14 font-display text-lg text-ink no-underline"
      >
        Two Minutes
      </Link>
      {children}
    </main>
  );
}
