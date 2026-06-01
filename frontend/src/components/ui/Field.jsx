import { forwardRef } from "react";

import { cn } from "@/utils/cn";

const CONTROL =
  "w-full rounded-lg border bg-white px-3 text-sm transition-colors placeholder:text-neutral-400 focus:border-neutral-900 disabled:bg-neutral-50";

export const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(CONTROL, "h-10", error ? "border-red-400" : "border-neutral-300", className)}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        CONTROL,
        "min-h-[80px] py-2",
        error ? "border-red-400" : "border-neutral-300",
        className,
      )}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(CONTROL, "h-10", error ? "border-red-400" : "border-neutral-300", className)}
      {...props}
    >
      {children}
    </select>
  );
});

// Label + error/hint wrapper so every form field looks identical.
export function Field({ label, error, hint, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
      {hint && !error && <span className="mt-1 block text-xs text-neutral-400">{hint}</span>}
    </label>
  );
}
