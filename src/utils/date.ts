/**
 * Format `date` as `YYYY-MM-DD` in the runtime's local timezone. Hatena
 * post dates are imported as Asia/Tokyo by `scripts/import-hatena.ts`, so
 * callers should pre-shift to JST when consistency across builds matters.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
