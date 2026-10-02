import { formatShortDate } from '../date';

test('formats an ISO date as "Mon D, YYYY" without shifting the day', () => {
  expect(formatShortDate('2026-09-12')).toBe('Sep 12, 2026');
  expect(formatShortDate('2026-01-01')).toBe('Jan 1, 2026');
});
