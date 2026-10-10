import { useCallback, useState } from 'react';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useForm, type FormErrors } from '../../../shared/hooks';
import { isBlank, isNumeric, toNumber } from '../../../shared/utils';
import { BILLING_STRINGS } from '../constants';
import type { Quote, QuoteInput, QuoteStatus } from '../types';
import { useLineItems } from './useLineItems';

export type QuoteValues = {
  customerName: string;
  partName: string;
  quantity: string;
  material: string;
  status: QuoteStatus;
};

const EMPTY: QuoteValues = {
  customerName: '',
  partName: '',
  quantity: '',
  material: '',
  status: 'draft',
};

export const toQuoteValues = (q?: Quote): QuoteValues =>
  q
    ? {
        customerName: q.customerName,
        partName: q.partName,
        quantity: String(q.quantity),
        material: q.material,
        status: q.status,
      }
    : EMPTY;

export const validateQuoteValues = (
  v: QuoteValues,
): FormErrors<QuoteValues> => {
  const errors: FormErrors<QuoteValues> = {};
  if (isBlank(v.customerName)) {
    errors.customerName = COMMON_STRINGS.required;
  }
  if (isBlank(v.partName)) {
    errors.partName = COMMON_STRINGS.required;
  }
  if (!isNumeric(v.quantity) || Number(v.quantity) <= 0) {
    errors.quantity = COMMON_STRINGS.invalidNumber;
  }
  return errors;
};

type QuoteChanges = Omit<QuoteInput, 'orderId'>;

/**
 * An existing quote's editable fields (customer, part, quantity, material,
 * status, GST rate and operations), edited in place on the quote page.
 */
export function useQuoteForm(quote: Quote | undefined) {
  const form = useForm<QuoteValues>(toQuoteValues(quote), validateQuoteValues);
  const lines = useLineItems(quote?.lineItems ?? []);
  const [gstRate, setGstRate] = useState(quote?.gstRate ?? 0);
  const [linesError, setLinesError] = useState<string>();

  /** Back to the saved quote: on Edit, and on Cancel. */
  const { reset: resetValues, validate: validateValues, values } = form;
  const { reset: resetLines } = lines;
  const reset = useCallback(() => {
    if (!quote) {
      return;
    }
    resetValues(toQuoteValues(quote));
    resetLines(quote.lineItems);
    setGstRate(quote.gstRate);
    setLinesError(undefined);
  }, [quote, resetValues, resetLines]);

  /** The changes to save, or null (with the errors shown) when invalid. */
  const validate = useCallback((): QuoteChanges | null => {
    const valid = validateValues();
    const noLines = lines.items.length === 0;
    setLinesError(noLines ? BILLING_STRINGS.lineItems.needsOne : undefined);
    if (!valid || noLines) {
      return null;
    }
    return {
      customerName: values.customerName.trim(),
      partName: values.partName.trim(),
      quantity: toNumber(values.quantity),
      material: values.material.trim(),
      status: values.status,
      lineItems: lines.items,
      gstRate,
    };
  }, [validateValues, values, lines.items, gstRate]);

  return {
    values,
    errors: form.errors,
    bind: form.bind,
    lines,
    gstRate,
    setGstRate,
    linesError,
    reset,
    validate,
  };
}
