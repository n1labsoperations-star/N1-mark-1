import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import { DAY_MS } from '../../../services/mock/mockServer';
import { selectAllInvoices } from '../../billing/store/selectors';
import { jobReference } from '../../billing/workflow';
import { selectAllJobCards } from '../../jobCards/store/selectors';
import { isOpen, orderStatus } from '../utils';

const NEW_ORDER_WINDOW_MS = 7 * DAY_MS;
import { ordersCrud } from './ordersSlice';

export const selectOrdersState = (state: RootState) => state.orders;

const { selectAll: selectStoredOrders } =
  ordersCrud.adapter.getSelectors(selectOrdersState);

// Each order's job card (same id) and whether its invoice is paid. Lambdas,
// so the other features' selectors are read at call time, not import time.
const selectStatusSources = createSelector(
  [
    (state: RootState) => selectAllJobCards(state),
    (state: RootState) => selectAllInvoices(state),
  ],
  (jobCards, invoices) => ({
    jobCards: new Map(jobCards.map(c => [c.id, c])),
    paid: new Set(invoices.filter(i => i.status === 'paid').map(i => i.jobId)),
  }),
);

/** Orders with their status worked out from the job card and invoice. */
export const selectAllOrders = createSelector(
  [selectStoredOrders, selectStatusSources],
  (orders, { jobCards, paid }) =>
    orders.map(o => ({
      ...o,
      status: orderStatus(o, jobCards.get(o.id), paid.has(jobReference(o.id))),
    })),
);

export const selectOrderById = (state: RootState, id: string) =>
  selectAllOrders(state).find(o => o.id === id);

export const selectOrderStats = createSelector([selectAllOrders], orders => {
  const open = orders.filter(isOpen);
  return {
    open: open.length,
    highPriority: open.filter(o => o.priority === 'high').length,
  };
});

/** Every order by due date — the dashboard's "Priority jobs". */
export const selectOrdersByDueDate = createSelector([selectAllOrders], orders =>
  [...orders].sort((a, b) =>
    (a.dueDate || '9999').localeCompare(b.dueDate || '9999'),
  ),
);

/** Orders created in the last seven days. */
export const selectNewOrderCount = createSelector([selectAllOrders], orders => {
  const weekAgo = Date.now() - NEW_ORDER_WINDOW_MS;
  return orders.filter(o => new Date(o.createdAt).getTime() >= weekAgo).length;
});
