import type { ISODateString } from '../../shared/types';

/** One process operation, charged per minute per piece. */
export type LineItem = {
  id: string;
  operation: string;
  description: string;
  minutesPerPiece: number;
  ratePerMinute: number;
};

/** Editable copy of a line item; numbers stay as text while typing. */
export type LineItemDraft = {
  id: string;
  operation: string;
  description: string;
  minutes: string;
  rate: string;
  /** Unrounded saved rate, kept while the shown (rounded) text is untouched. */
  exactRate?: number;
};

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export type Invoice = {
  id: string;
  customerName: string;
  /** e.g. "WO-00125". */
  jobId: string;
  routeCard: string;
  partName: string;
  quantity: number;
  status: InvoiceStatus;
  lineItems: LineItem[];
  discount: number;
  notes: string;
  issuedAt: ISODateString;
};

export type InvoiceInput = Omit<Invoice, 'id' | 'issuedAt'>;

export type Quote = {
  id: string;
  customerName: string;
  partName: string;
  quantity: number;
  material: string;
  status: QuoteStatus;
  lineItems: LineItem[];
  createdAt: ISODateString;
};

export type QuoteInput = Omit<Quote, 'id' | 'createdAt'>;

export type Totals = {
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
};

export type BillingTab = 'invoices' | 'quotes';
