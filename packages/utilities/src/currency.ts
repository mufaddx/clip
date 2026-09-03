/**
 * Money is always stored as integer minor units (e.g. paise/cents) — see
 * docs/database/DATABASE_SCHEMA.md conventions. These helpers are the only
 * place formatting/conversion logic should live; never inline it.
 */

/** Converts minor units (e.g. 150000) to a major-unit decimal (1500.00). */
export function minorToMajor(amountMinor: number): number {
  return amountMinor / 100;
}

/** Converts a major-unit decimal (1500.00) to integer minor units (150000). */
export function majorToMinor(amountMajor: number): number {
  return Math.round(amountMajor * 100);
}

/** Formats minor units as a localized currency string, e.g. "₹1,500.00". */
export function formatCurrency(
  amountMinor: number,
  currency = "INR",
  locale = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(minorToMajor(amountMinor));
}
