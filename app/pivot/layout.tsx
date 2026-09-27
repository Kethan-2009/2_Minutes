export default function PivotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas text-ink p-4">
      <div className="max-w-2xl mx-auto">{children}</div>
    </div>
  );
}
