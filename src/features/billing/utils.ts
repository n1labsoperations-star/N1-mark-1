import {
  formatCurrency,
  gstAmounts,
  toNumber,
  type GstSupply,
} from '../../shared/utils';
import { BILLING_STRINGS } from './constants';
import type { Invoice, LineItem, LineItemDraft, Quote, Totals } from './types';

/** Pieces × minutes per piece × rate per minute, to the rupee. */
export const lineAmount = (
  item: Pick<LineItem, 'minutesPerPiece' | 'ratePerMinute'>,
  quantity: number,
) => Math.round(quantity * item.minutesPerPiece * item.ratePerMinute);

/**
 * GST is charged on the subtotal after discount, at the document's rate:
 * CGST + SGST within the organization's state, IGST across states. The total
 * is the same either way.
 */
export function calculateTotals(
  items: readonly LineItem[],
  quantity: number,
  discount: number,
  gstRate: number,
  supply: GstSupply = 'intra',
): Totals {
  const subtotal = items.reduce(
    (sum, item) => sum + lineAmount(item, quantity),
    0,
  );
  const applied = Math.min(Math.max(0, discount), subtotal);
  const taxable = subtotal - applied;
  const gst = gstAmounts(taxable, gstRate, supply);
  return {
    subtotal,
    discount: applied,
    taxable,
    gstRate: supply === 'none' ? 0 : gstRate,
    supply,
    cgst: gst.cgst,
    sgst: gst.sgst,
    igst: gst.igst,
    gst: gst.total,
    total: taxable + gst.total,
  };
}

export const invoiceTotal = (i: Invoice) =>
  calculateTotals(i.lineItems, i.quantity, i.discount, i.gstRate).total;
export const quoteTotal = (q: Quote) =>
  calculateTotals(q.lineItems, q.quantity, 0, q.gstRate).total;

export const toDraft = (item: LineItem): LineItemDraft => ({
  id: item.id,
  operation: item.operation,
  description: item.description,
  minutes: String(item.minutesPerPiece),
  rate: String(Number(item.ratePerMinute.toFixed(2))),
  exactRate: item.ratePerMinute,
});

export const fromDraft = (draft: LineItemDraft): LineItem => ({
  id: draft.id,
  operation: draft.operation.trim(),
  description: draft.description.trim(),
  minutesPerPiece: toNumber(draft.minutes),
  ratePerMinute:
    draft.exactRate !== undefined &&
    draft.rate === String(Number(draft.exactRate.toFixed(2)))
      ? draft.exactRate
      : toNumber(draft.rate),
});

/** Rows with nothing in them are dropped on save. */
export const isEmptyDraft = (d: LineItemDraft) =>
  !d.operation.trim() &&
  !d.description.trim() &&
  !toNumber(d.minutes) &&
  !toNumber(d.rate);

let draftCounter = 0;
export const newDraft = (): LineItemDraft => {
  draftCounter += 1;
  return {
    id: `new-${Date.now()}-${draftCounter}`,
    operation: '',
    description: '',
    minutes: '',
    rate: '',
  };
};

/** "150 pcs × 2 min" */
export const timeQtyLabel = (item: LineItem, quantity: number) =>
  BILLING_STRINGS.lineItems.perPiece(quantity, item.minutesPerPiece);

/** "₹26.67/min" */
export const rateLabel = (item: LineItem) =>
  BILLING_STRINGS.lineItems.perMinute(
    formatCurrency(Number(item.ratePerMinute.toFixed(2))),
  );

/** Invoices issued in the same calendar month as `now`. */
export const isThisMonth = (iso: string, now = new Date()) => {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
};

export const invoiceSearchText = (i: Invoice) =>
  `${i.id} ${i.customerName} ${i.jobId} ${i.routeCard} ${i.partName}`;
export const quoteSearchText = (q: Quote) =>
  `${q.id} ${q.customerName} ${q.partName} ${q.material}`;
