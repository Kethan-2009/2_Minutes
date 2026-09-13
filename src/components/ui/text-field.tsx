import type { ComponentProps } from "react";

type Props = ComponentProps<"input"> & {
  label: string;
  hint?: string;
};

/**
 * One input, one label, one job. Large text because people type these on a
 * phone, one-handed, in a hurry.
 */
export function TextField({ label, hint, id, className = "", ...props }: Props) {
  const fieldId = id ?? props.name;
  const hintId = hint ? `${fieldId}-hint` : undefined;

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
        aria-describedby={hintId}
        className={`h-14 w-full rounded-[var(--radius-field)] border border-line bg-raised px-4 text-[17px] text-ink placeholder:text-muted focus-visible:border-ink focus-visible:outline-none ${className}`.trim()}
      />
      {hint ? (
        <p id={hintId} className="text-[13px] leading-snug text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
