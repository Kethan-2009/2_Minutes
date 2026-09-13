export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <p role="alert" className="text-[15px] leading-snug text-danger">
      {message}
    </p>
  );
}
