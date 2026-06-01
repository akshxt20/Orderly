import { useEffect, useState } from "react";

import { subscribeToToasts } from "@/services/toast";
import { cn } from "@/utils/cn";

const VARIANTS = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-neutral-200 bg-white text-neutral-800",
};

const TOAST_TTL = 3500;

export function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToToasts((item) => {
      setToasts((current) => [...current, item]);
      // Auto-dismiss after a few seconds.
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== item.id));
      }, TOAST_TTL);
    });
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={cn(
            "pointer-events-auto min-w-[240px] rounded-lg border px-4 py-3 text-sm font-medium shadow-sm animate-toast-in",
            VARIANTS[item.type] ?? VARIANTS.info,
          )}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
