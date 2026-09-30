/**
 * "2026-09-12" → "Sep 12, 2026". The date is read in local time so it never
 * shifts a day the way `new Date('2026-09-12')` (UTC) can.
 */
export function formatShortDate(isoDate: string, locale = 'en-US'): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
