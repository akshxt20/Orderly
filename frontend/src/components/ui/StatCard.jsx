import { cn } from "@/utils/cn";

export function StatCard({ label, value, hint, icon, loading = false, gradient, iconBg }) {
  // When a gradient is provided, render the premium gradient variant
  if (gradient) {
    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
          `bg-gradient-to-br ${gradient}`,
        )}
      >
        {/* Decorative shapes */}
        <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute -bottom-2 right-8 h-12 w-12 rounded-full bg-white/5" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/80">{label}</span>
            {icon && (
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm")}>
                {icon}
              </span>
            )}
          </div>
          {loading ? (
            <div className="mt-3 h-8 w-24 rounded-md bg-white/20 animate-pulse" />
          ) : (
            <p className="mt-2 truncate text-lg font-bold leading-tight tracking-tight text-white sm:text-xl">{value}</p>
          )}
          {hint && !loading && <p className="mt-1 text-xs text-white/60">{hint}</p>}
        </div>
      </div>
    );
  }

  // Original flat style as fallback
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-500">{label}</span>
        {icon && <span className="text-neutral-400">{icon}</span>}
      </div>
      {loading ? (
        <div className="skeleton mt-3 h-7 w-24" />
      ) : (
        <p className="mt-2 truncate text-lg font-semibold leading-tight tracking-tight text-neutral-900 sm:text-xl">{value}</p>
      )}
      {hint && !loading && <p className={cn("mt-1 text-xs text-neutral-400")}>{hint}</p>}
    </div>
  );
}
