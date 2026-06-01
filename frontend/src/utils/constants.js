// Mirrors the backend ProductCategory enum. Single source for dropdowns so the
// UI can't offer a category the API would reject.
export const PRODUCT_CATEGORIES = ["Mobiles", "Audio", "Laptops", "Accessories", "Power"];

// Visual metadata for each category — gradients, icons, and descriptions used
// by the CategoryView and anywhere a category needs rich presentation.
export const CATEGORY_META = {
  Mobiles: {
    gradient: "from-blue-600 via-violet-600 to-indigo-700",
    gradientLight: "from-blue-50 to-violet-50",
    accentColor: "text-blue-600",
    bgAccent: "bg-blue-50",
    ringColor: "ring-blue-200",
    description: "Smartphones & mobile devices",
    icon: `M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM12 18h.01`,
  },
  Audio: {
    gradient: "from-rose-500 via-pink-600 to-fuchsia-700",
    gradientLight: "from-rose-50 to-pink-50",
    accentColor: "text-rose-600",
    bgAccent: "bg-rose-50",
    ringColor: "ring-rose-200",
    description: "Headphones, earbuds & speakers",
    icon: `M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3ZM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3Z`,
  },
  Laptops: {
    gradient: "from-teal-500 via-cyan-600 to-sky-700",
    gradientLight: "from-teal-50 to-cyan-50",
    accentColor: "text-teal-600",
    bgAccent: "bg-teal-50",
    ringColor: "ring-teal-200",
    description: "Notebooks & computing",
    icon: `M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM1 19h22`,
  },
  Accessories: {
    gradient: "from-amber-500 via-orange-500 to-red-500",
    gradientLight: "from-amber-50 to-orange-50",
    accentColor: "text-amber-600",
    bgAccent: "bg-amber-50",
    ringColor: "ring-amber-200",
    description: "Peripherals & add-ons",
    icon: `M12 2L2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5`,
  },
  Power: {
    gradient: "from-emerald-500 via-green-600 to-lime-600",
    gradientLight: "from-emerald-50 to-green-50",
    accentColor: "text-emerald-600",
    bgAccent: "bg-emerald-50",
    ringColor: "ring-emerald-200",
    description: "Power banks & chargers",
    icon: `M13 2L3 14h9l-1 8 10-12h-9l1-8`,
  },
};

export const DEFAULT_CATEGORY_META = {
  gradient: "from-slate-600 via-zinc-600 to-neutral-700",
  gradientLight: "from-slate-50 to-zinc-50",
  accentColor: "text-slate-600",
  bgAccent: "bg-slate-50",
  ringColor: "ring-slate-200",
  description: "Products & items",
  icon: `M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10`,
};
