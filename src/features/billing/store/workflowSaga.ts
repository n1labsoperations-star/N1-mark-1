import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { errorMessage } from '../../../shared/store';
import { customersApi } from '../../customers/api/customersApi';
import type { Customer } from '../../customers/types';
import { jobCardsApi } from '../../jobCards/api/jobCardsApi';
import { jobCardActions } from '../../jobCards/store/jobCardsSlice';
import type { JobCard } from '../../jobCards/types';
import { ordersApi } from '../../orders/api/ordersApi';
import { orderActions } from '../../orders/store/ordersSlice';
import type { WorkOrder } from '../../orders/types';
import { invoicesApi, quotesApi } from '../api/billingApi';
import type { Invoice, Quote } from '../types';
import { invoiceForDispatch, jobReference, orderFromQuote } from '../workflow';
import { invoiceActions, quoteActions } from './billingSlices';
import { workflowActions, type GenerateInvoicePayload } from './workflowSlice';

const sameName = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

/** Quote → new work order; the quote is linked to it (status unchanged). */
export function* convertQuote(action: PayloadAction<string>) {
  try {
    const quotes: Quote[] = yield call(quotesApi.list);
    const quote = quotes.find(q => q.id === action.payload);
    if (!quote) {
      throw new Error('This quote no longer exists');
    }
    if (quote.orderId) {
      yield put(workflowActions.convertQuoteSuccess(quote.orderId));
      return;
    }
    const customers: Customer[] = yield call(customersApi.list);
    const customer = customers.find(c => sameName(c.name, quote.customerName));
    const order: WorkOrder = yield call(
      ordersApi.create,
      orderFromQuote(quote, customer),
    );
    yield put(orderActions.saveSuccess(order));
    const updated: Quote = yield call(quotesApi.update, quote.id, {
      orderId: order.id,
    });
    yield put(quoteActions.saveSuccess(updated));
    yield put(workflowActions.convertQuoteSuccess(order.id));
  } catch (error) {
    yield put(
      workflowActions.failure(
        errorMessage(error, 'Failed to convert the quote'),
      ),
    );
  }
}

/**
 * Dispatch → draft invoice (against the chosen quote, or none). A job that
 * was already billed opens its existing invoice instead of a second one.
 */
export function* generateInvoice(
  action: PayloadAction<GenerateInvoicePayload>,
) {
  try {
    const { jobCardId, quoteId, gstRate } = action.payload;
    const invoices: Invoice[] = yield call(invoicesApi.list);
    const existing = invoices.find(i => i.jobId === jobReference(jobCardId));
    if (existing) {
      yield put(workflowActions.generateInvoiceSuccess(existing.id));
      return;
    }
    const jobCard: JobCard = yield call(jobCardsApi.get, jobCardId);
    const orders: WorkOrder[] = yield call(ordersApi.list);
    const quotes: Quote[] = yield call(quotesApi.list);
    const quote = quotes.find(q => q.id === quoteId);
    const created: Invoice = yield call(
      invoicesApi.create,
      invoiceForDispatch(
        jobCard,
        orders.find(o => o.id === jobCardId),
        quote,
        gstRate,
      ),
    );
    yield put(invoiceActions.saveSuccess(created));
    // The quote is now mapped to this job's order.
    if (quote && !quote.orderId) {
      const linked: Quote = yield call(quotesApi.update, quote.id, {
        orderId: jobCardId,
      });
      yield put(quoteActions.saveSuccess(linked));
    }
    yield put(workflowActions.generateInvoiceSuccess(created.id));
    // Dispatched: the job card is Done.
    const dispatched: JobCard = yield call(jobCardsApi.update, jobCardId, {
      billing: 'invoiced',
    });
    yield put(jobCardActions.saveSuccess(dispatched));
  } catch (error) {
    yield put(
      workflowActions.failure(
        errorMessage(error, 'Failed to create the invoice'),
      ),
    );
  }
}

export default function* workflowSaga() {
  yield takeLatest(workflowActions.convertQuoteRequest.type, convertQuote);
  yield takeLatest(
    workflowActions.generateInvoiceRequest.type,
    generateInvoice,
  );
}
