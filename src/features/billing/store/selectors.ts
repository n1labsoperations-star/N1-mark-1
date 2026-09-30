import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
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
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(
      i => i.status === 'pending' || i.status === 'draft',
    ).length,
    thisMonth: invoices
      .filter(i => isThisMonth(i.issuedAt))
      .reduce((sum, i) => sum + invoiceTotal(i), 0),
  }),
);

/** "Pending" covers quotes not yet answered: drafts and sent quotes. */
export const selectQuoteStats = createSelector([selectAllQuotes], quotes => ({
  total: quotes.length,
  accepted: quotes.filter(q => q.status === 'accepted').length,
  pending: quotes.filter(q => q.status === 'sent' || q.status === 'draft')
    .length,
  rejected: quotes.filter(q => q.status === 'rejected').length,
}));

/** Dashboard figures derived from invoices. */
export const selectBillingSummary = createSelector(
  [selectAllInvoices],
  invoices => {
    const year = new Date().getFullYear();
    const billed = invoices.filter(i => i.status !== 'draft');
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
