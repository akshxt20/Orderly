import { Fragment } from "react";

import { cn } from "@/utils/cn";

// Must match the backend OrderStatus enum order — the pipeline is forward-only.
export const ORDER_STEPS = ["ordered", "dispatched", "shipped", "arriving", "arrived"];

export function StatusStepper({ status }) {
  const currentIndex = ORDER_STEPS.indexOf(status);

  return (
    <div className="flex items-center">
      {ORDER_STEPS.map((step, index) => {
        const reached = index <= currentIndex;
        const connectorFilled = index < currentIndex;

        return (
          <Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors duration-300",
                  reached
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-400",
                )}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  "mt-1.5 text-xs capitalize",
                  reached ? "font-medium text-neutral-900" : "text-neutral-400",
                )}
              >
                {step}
              </span>
            </div>
            {index < ORDER_STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-0.5 flex-1 transition-colors duration-300",
                  connectorFilled ? "bg-neutral-900" : "bg-neutral-200",
                )}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
