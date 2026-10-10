import { useCallback, useState } from 'react';
import { COMMON_STRINGS } from '../../../shared/constants';
import { isNumeric, toNumber } from '../../../shared/utils';
import { BILLING_STRINGS } from '../constants';
import type { Invoice, InvoiceInput, InvoiceStatus } from '../types';
import { useLineItems } from './useLineItems';

const poText = (invoice: Invoice | undefined) =>
  invoice?.poAmount == null ? '' : String(invoice.poAmount);

type InvoiceChanges = Pick<
  InvoiceInput,
  'status' | 'lineItems' | 'discount' | 'gstRate' | 'poAmount' | 'notes'
>;

/** Blank, or a number that isn't negative. */
const isBadAmount = (text: string) =>
  text.trim() !== '' && (!isNumeric(text) || Number(text) < 0);

/**
 * The editable parts of an invoice (operations, status, discount, GST rate,
 * PO amount, notes), edited in place on the invoice page.
 */
export function useInvoiceForm(invoice: Invoice | undefined) {
  const lines = useLineItems(invoice?.lineItems ?? []);
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status ?? 'new');
  const [discount, setDiscount] = useState(
    invoice ? String(invoice.discount) : '0',
  );
  const [gstRate, setGstRate] = useState(invoice?.gstRate ?? 0);
  const [poAmount, setPoAmount] = useState(poText(invoice));
  const [notes, setNotes] = useState(invoice?.notes ?? '');
  const [discountError, setDiscountError] = useState<string>();
  const [poAmountError, setPoAmountError] = useState<string>();
  const [linesError, setLinesError] = useState<string>();

  /** Back to the saved invoice: on Edit, and on Cancel. */
  const { reset: resetLines } = lines;
  const reset = useCallback(() => {
    if (!invoice) {
      return;
    }
    resetLines(invoice.lineItems);
    setStatus(invoice.status);
    setDiscount(String(invoice.discount));
    setGstRate(invoice.gstRate);
    setPoAmount(poText(invoice));
    setNotes(invoice.notes);
    setDiscountError(undefined);
    setPoAmountError(undefined);
    setLinesError(undefined);
  }, [invoice, resetLines]);

  /** The changes to save, or null (with the errors shown) when invalid. */
  const validate = useCallback((): InvoiceChanges | null => {
    const badDiscount = isBadAmount(discount);
    const badPoAmount = isBadAmount(poAmount);
    setDiscountError(badDiscount ? COMMON_STRINGS.invalidNumber : undefined);
    setPoAmountError(badPoAmount ? COMMON_STRINGS.invalidNumber : undefined);
    setLinesError(
      lines.items.length === 0 ? BILLING_STRINGS.lineItems.needsOne : undefined,
    );
    if (badDiscount || badPoAmount || lines.items.length === 0) {
      return null;
    }
    return {
      status,
      lineItems: lines.items,
      discount: toNumber(discount),
      gstRate,
      // Blank means not entered yet.
      poAmount: poAmount.trim() === '' ? null : toNumber(poAmount),
      notes: notes.trim(),
    };
  }, [discount, poAmount, lines.items, status, gstRate, notes]);

  return {
    lines,
    status,
    setStatus,
    discount,
    setDiscount,
    gstRate,
    setGstRate,
    poAmount,
    setPoAmount,
    poAmountError,
    notes,
    setNotes,
    discountError,
    linesError,
    reset,
    validate,
  };
}
