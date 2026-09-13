import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<"input">, "aria-invalid"> & {
  label: string;
  /** Standing helper text. Always advisory. */
  hint?: string;
  /** Validation failure for this field. Replaces the hint and is announced. */
  error?: string;
};

/**
 * One input, one label, one job. Large text because people type these on a
 * phone, one-handed, in a hurry.
 *
 * An error and a hint are not the same thing and must never look the same —
 * "At least 8 characters" and "Use at least 8 characters" are different
 * messages, and only one of them means you did something wrong.
 */
export function TextField({
  label,
  hint,
  error,
  id,
  className = "",
  ...props
}: Props) {
  const fieldId = id ?? props.name;
  const messageId = error || hint ? `${fieldId}-message` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={fieldId}
        className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted"
      >
        {label}
      </label>
      <input
        {...props}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        className={`h-14 w-full rounded-[var(--radius-field)] border bg-raised px-4 text-[17px] text-ink placeholder:text-muted focus-visible:outline-none ${
          error
            ? "border-danger focus-visible:border-danger"
            : "border-line focus-visible:border-ink"
        } ${className}`.trim()}
      />
      {error ? (
        <p
          id={messageId}
          role="alert"
          className="text-[13px] leading-snug font-medium text-danger"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-[13px] leading-snug text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
