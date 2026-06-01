import { useEffect, useState } from "react";

// Delays propagating a fast-changing value (like a search box) so we don't fire
// a query on every keystroke.
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
