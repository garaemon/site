const TOKYO_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * Format `date` as `YYYY-MM-DD` in Asia/Tokyo. Hatena post dates are
 * imported as JST by `scripts/import-hatena.ts`, and CI builds run in UTC,
 * so we explicitly format in JST to keep the displayed date stable across
 * the operator's local machine and the CI runner.
 */
export function formatDate(date: Date): string {
  return TOKYO_FORMATTER.format(date);
}
