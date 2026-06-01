import { cn } from "@/utils/cn";

const VARIANTS = {
  neutral: "bg-neutral-100 text-neutral-700",
  dark: "bg-neutral-900 text-white",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  info: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
};

export function Badge({ variant = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
