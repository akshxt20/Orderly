import { useState } from "react";

import { cn } from "@/utils/cn";
import { getInitialColor, getInitial } from "@/utils/getInitialColor";

// Renders the product image, falling back to a colored initials placeholder when the URL
// is missing or fails to load.
export function ProductImage({ src, name = "", alt = "", className }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    const { bg, text } = getInitialColor(name || alt);
    const initial = getInitial(name || alt);

    return (
      <div className={cn("flex items-center justify-center font-bold select-none text-xl shadow-inner", bg, text, className)}>
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
