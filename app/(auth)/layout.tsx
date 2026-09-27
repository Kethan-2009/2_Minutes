export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas text-ink flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Two Minutes</h1>
          <p className="text-center text-muted text-sm">
            An AI accountability partner
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
