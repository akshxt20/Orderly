// Curated palette for generating consistent initial-based avatar colors.
// Given a name, returns a gradient and text color that's visually stable
// (the same name always produces the same color).

const PALETTE = [
  { bg: "bg-gradient-to-br from-blue-500 to-indigo-600", text: "text-white" },
  { bg: "bg-gradient-to-br from-violet-500 to-purple-600", text: "text-white" },
  { bg: "bg-gradient-to-br from-rose-500 to-pink-600", text: "text-white" },
  { bg: "bg-gradient-to-br from-amber-500 to-orange-600", text: "text-white" },
  { bg: "bg-gradient-to-br from-emerald-500 to-teal-600", text: "text-white" },
  { bg: "bg-gradient-to-br from-cyan-500 to-sky-600", text: "text-white" },
  { bg: "bg-gradient-to-br from-fuchsia-500 to-pink-600", text: "text-white" },
  { bg: "bg-gradient-to-br from-lime-500 to-green-600", text: "text-white" },
  { bg: "bg-gradient-to-br from-red-500 to-rose-600", text: "text-white" },
  { bg: "bg-gradient-to-br from-teal-500 to-cyan-600", text: "text-white" },
];

/**
 * Returns a deterministic color entry from the palette based on a name string.
 * The same name always returns the same color.
 */
export function getInitialColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

/**
 * Returns the uppercase first letter of a name string, or "?" if empty.
 */
export function getInitial(name = "") {
  return (name.trim()[0] || "?").toUpperCase();
}
