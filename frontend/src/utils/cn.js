import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge conditional class names and resolve Tailwind conflicts
// (e.g. cn("px-2", isWide && "px-4") -> "px-4").
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
