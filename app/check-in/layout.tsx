export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-10 sm:py-16">
      {children}
    </main>
  );
}
