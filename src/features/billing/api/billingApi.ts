import {
  createMockCollection,
  nextSequentialId,
} from '../../../services/mock/mockServer';
import type { Invoice, InvoiceInput, Quote, QuoteInput } from '../types';
import { MOCK_INVOICES, MOCK_QUOTES } from './mockData';

const ID_PAD = 4;
const yearPrefix = (kind: 'INV' | 'QT') =>
  `${kind}-${new Date().getFullYear()}-`;

// Mock backend. Replace with apiClient calls (/invoices, /quotes) later.
const invoices = createMockCollection<Invoice, InvoiceInput>({
  seed: MOCK_INVOICES,
  nextId: rows => nextSequentialId(rows, yearPrefix('INV'), ID_PAD),
  build: (input, id) => ({ ...input, id, issuedAt: new Date().toISOString() }),
});

const quotes = createMockCollection<Quote, QuoteInput>({
  seed: MOCK_QUOTES,
  nextId: rows => nextSequentialId(rows, yearPrefix('QT'), ID_PAD),
  build: (input, id) => ({ ...input, id, createdAt: new Date().toISOString() }),
});

export const invoicesApi = {
  list: invoices.list,
  create: invoices.create,
  update: invoices.update,
  remove: invoices.remove,
  reset: invoices.reset,
};

export const quotesApi = {
  list: quotes.list,
  create: quotes.create,
  update: quotes.update,
  remove: quotes.remove,
  reset: quotes.reset,
};
