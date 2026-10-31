import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const fieldId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="mb-2 block text-sm text-muted">
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={`w-full resize-none border-0 border-b bg-transparent pb-2 text-lg leading-relaxed text-ink transition-colors placeholder:text-muted/60 focus:outline-none ${
          error ? "border-gone" : "border-rule focus:border-ink"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-gone">{error}</p>}
    </div>
  );
}
