import { useCrudResource } from '../../../shared/store';
import { useAppSelector } from '../../../app/store/hooks';
import { invoiceActions, quoteActions } from '../store/billingSlices';
import {
  selectAllInvoices,
  selectAllQuotes,
  selectBillingSummary,
  selectInvoiceById,
  selectInvoiceStats,
  selectInvoicesState,
  selectQuoteById,
  selectQuoteStats,
  selectQuotesState,
} from '../store/selectors';

export function useInvoices() {
  return useCrudResource(
    invoiceActions,
    selectInvoicesState,
    selectAllInvoices,
  );
}

export function useInvoice(id: string) {
  const resource = useInvoices();
  const invoice = useAppSelector(state => selectInvoiceById(state, id));
  return { ...resource, invoice };
}

export function useQuotes() {
  return useCrudResource(quoteActions, selectQuotesState, selectAllQuotes);
}

export function useQuote(id: string | undefined) {
  const resource = useQuotes();
  const quote = useAppSelector(state =>
    id ? selectQuoteById(state, id) : undefined,
  );
  return { ...resource, quote };
}

export const useInvoiceStats = () => useAppSelector(selectInvoiceStats);
export const useQuoteStats = () => useAppSelector(selectQuoteStats);

/**
 * Monthly / yearly billed and outstanding, plus the invoices themselves so
 * the dashboard can total any period. Loads invoices.
 */
export function useBillingSummary() {
  const { items: invoices, status, error, reload } = useInvoices();
  const summary = useAppSelector(selectBillingSummary);
  return { ...summary, invoices, status, error, reload };
}
