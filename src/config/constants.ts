// App-wide constants. Values that differ per environment belong in config/index.ts.

// Jest defines a global `jest`; the app bundles never do.
const isTest = typeof jest !== 'undefined';

/** Simulated network latency for the mock API. Zero under Jest. */
export const MOCK_LATENCY_MS = isTest ? 0 : 350;

/** Rows per page in list screens. */
export const PAGE_SIZE = 10;

/** Delay before a search box filters the list. */
export const SEARCH_DEBOUNCE_MS = isTest ? 0 : 200;

/** GST applied to invoice and quote subtotals (after discount). */
export const GST_RATE = 0.05;

export const CURRENCY_SYMBOL = '₹';

export const PASSWORD_MIN_LENGTH = 8;
