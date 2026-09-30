import { combineReducers } from '@reduxjs/toolkit';
import { createCrudSlice } from '../../../shared/store';
import type { Invoice, InvoiceInput, Quote, QuoteInput } from '../types';

// Newest number first.
const byIdDesc = (a: { id: string }, b: { id: string }) =>
  b.id.localeCompare(a.id);

export const invoicesCrud = createCrudSlice<Invoice, InvoiceInput>(
  'billing/invoices',
  byIdDesc,
);
export const quotesCrud = createCrudSlice<Quote, QuoteInput>(
  'billing/quotes',
  byIdDesc,
);

export const invoiceActions = invoicesCrud.actions;
export const quoteActions = quotesCrud.actions;

export default combineReducers({
  invoices: invoicesCrud.reducer,
  quotes: quotesCrud.reducer,
});
