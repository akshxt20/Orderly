// Money values come from the API as strings (Postgres NUMERIC) to avoid float
// drift; coerce to Number only at the display boundary.
// en-IN locale gives the Indian digit grouping (e.g. ₹1,23,456) and the ₹ symbol.
const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrency(value) {
  return formatter.format(Number(value ?? 0));
}

// Whole-rupee variant for compact spots like the dashboard stat cards, where the
// paise aren't worth the horizontal space.
const wholeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatCurrencyWhole(value) {
  return wholeFormatter.format(Number(value ?? 0));
}
