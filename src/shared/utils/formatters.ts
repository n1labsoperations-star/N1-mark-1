import { CURRENCY_SYMBOL } from '../../config/constants';
import type { ISODateString } from '../types';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const LAKH = 100_000;
const CRORE = 10_000_000;

/** Indian digit grouping: 1234567 → "12,34,567". */
function groupIndian(integer: string): string {
  if (integer.length <= 3) {
    return integer;
  }
  const last3 = integer.slice(-3);
  const rest = integer.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${last3}`;
}

/** ₹42,000 · ₹26.67 · -₹1,200. Decimals only when the value has them. */
export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const hasFraction = Math.round(abs * 100) % 100 !== 0;
  const [integer, fraction] = abs.toFixed(hasFraction ? 2 : 0).split('.');
  const grouped = groupIndian(integer);
  return `${sign}${CURRENCY_SYMBOL}${grouped}${fraction ? `.${fraction}` : ''}`;
}

/** Short form for stat tiles: ₹18.6L, ₹1.2Cr; smaller values as formatCurrency. */
export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  const short = (value: number, unit: string) =>
    `${sign}${CURRENCY_SYMBOL}${Number(value.toFixed(1))}${unit}`;
  if (abs >= CRORE) {
    return short(abs / CRORE, 'Cr');
  }
  if (abs >= LAKH) {
    return short(abs / LAKH, 'L');
  }
  return formatCurrency(amount);
}

function parse(iso: ISODateString): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** "Sep 12, 2026" */
export function formatDate(iso?: ISODateString): string {
  const d = iso ? parse(iso) : null;
  return d ? `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : '';
}

/** "02 Oct" */
export function formatDayMonth(iso?: ISODateString): string {
  const d = iso ? parse(iso) : null;
  return d ? `${pad2(d.getDate())} ${MONTHS[d.getMonth()]}` : '';
}

/** "02 Oct 2026" */
export function formatLongDate(iso?: ISODateString): string {
  const d = iso ? parse(iso) : null;
  return d ? `${formatDayMonth(iso)} ${d.getFullYear()}` : '';
}

/** "09:45 AM" */
export function formatTime(iso?: ISODateString): string {
  const d = iso ? parse(iso) : null;
  if (!d) {
    return '';
  }
  const hours = d.getHours() % 12 || 12;
  const suffix = d.getHours() < 12 ? 'AM' : 'PM';
  return `${pad2(hours)}:${pad2(d.getMinutes())} ${suffix}`;
}

/** "Just now" · "5m ago" · "2h ago" · "3d ago" · older: "Sep 12, 2026". */
export function formatRelativeTime(
  iso: ISODateString,
  now: number = Date.now(),
): string {
  const d = parse(iso);
  if (!d) {
    return '';
  }
  const minutes = Math.floor((now - d.getTime()) / 60_000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : formatDate(iso);
}

/** "1.2 MB" · "340 KB" */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${Number((bytes / (1024 * 1024)).toFixed(1))} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Percentage of `part` in `total`, rounded: 12 of 30 → 40. */
export function percentOf(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

/** DD/MM/YYYY → ISO date (YYYY-MM-DD); returns undefined if it isn't a real date. */
export function parseDisplayDate(text: string): ISODateString | undefined {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!match) {
    return undefined;
  }
  const [, dd, mm, yyyy] = match;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const valid =
    d.getFullYear() === Number(yyyy) &&
    d.getMonth() === Number(mm) - 1 &&
    d.getDate() === Number(dd);
  return valid ? `${yyyy}-${mm}-${dd}` : undefined;
}

/** ISO date → DD/MM/YYYY, for pre-filling date fields. */
export function toDisplayDate(iso?: ISODateString): string {
  const d = iso ? parse(iso) : null;
  return d
    ? `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`
    : '';
}
