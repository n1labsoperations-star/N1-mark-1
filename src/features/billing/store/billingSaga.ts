import { all, fork } from 'redux-saga/effects';
import { createCrudSaga } from '../../../shared/store';
import { invoicesApi, quotesApi } from '../api/billingApi';
import { invoiceActions, quoteActions } from './billingSlices';

export const invoicesSaga = createCrudSaga(
  invoiceActions,
  invoicesApi,
  'invoices',
);
export const quotesSaga = createCrudSaga(quoteActions, quotesApi, 'quotes');

export default function* billingSaga() {
  yield all([fork(invoicesSaga.watch), fork(quotesSaga.watch)]);
}
