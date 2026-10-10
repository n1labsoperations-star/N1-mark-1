import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import { invoiceTotal, isThisMonth } from '../utils';
import { invoicesCrud, quotesCrud } from './billingSlices';

export const selectInvoicesState = (state: RootState) => state.billing.invoices;
export const selectQuotesState = (state: RootState) => state.billing.quotes;

export const { selectAll: selectAllInvoices, selectById: selectInvoiceById } =
  invoicesCrud.adapter.getSelectors(selectInvoicesState);
export const { selectAll: selectAllQuotes, selectById: selectQuoteById } =
  quotesCrud.adapter.getSelectors(selectQuotesState);

export const selectInvoiceStats = createSelector(
  [selectAllInvoices],
  invoices => ({
    total: invoices.length,
    new: invoices.filter(i => i.status === 'new').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    thisMonth: invoices
      .filter(i => isThisMonth(i.issuedAt))
      .reduce((sum, i) => sum + invoiceTotal(i), 0),
  }),
);

export const selectQuoteStats = createSelector([selectAllQuotes], quotes => ({
  total: quotes.length,
  draft: quotes.filter(q => q.status === 'draft').length,
  sent: quotes.filter(q => q.status === 'sent').length,
}));

/** Dashboard figures derived from invoices. */
export const selectBillingSummary = createSelector(
  [selectAllInvoices],
  invoices => {
    const year = new Date().getFullYear();
    // Every invoice is billed; outstanding is what isn't paid yet.
    const billed = invoices;
    return {
      monthlyBilled: billed
        .filter(i => isThisMonth(i.issuedAt))
        .reduce((s, i) => s + invoiceTotal(i), 0),
      yearBilled: billed
        .filter(i => new Date(i.issuedAt).getFullYear() === year)
        .reduce((s, i) => s + invoiceTotal(i), 0),
      outstanding: billed
        .filter(i => i.status !== 'paid')
        .reduce((s, i) => s + invoiceTotal(i), 0),
    };
  },
);
