import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm text-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`w-full border-0 border-b bg-transparent pb-2 text-xl text-ink transition-colors placeholder:text-muted/60 focus:outline-none ${
          error ? "border-gone" : "border-rule focus:border-ink"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-gone">{error}</p>}
    </div>
  );
}
