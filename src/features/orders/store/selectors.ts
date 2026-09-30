import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import { DAY_MS } from '../../../services/mock/mockServer';
import { isOpen } from '../utils';

const NEW_ORDER_WINDOW_MS = 7 * DAY_MS;
import { ordersCrud } from './ordersSlice';

export const selectOrdersState = (state: RootState) => state.orders;

export const { selectAll: selectAllOrders, selectById: selectOrderById } =
  ordersCrud.adapter.getSelectors(selectOrdersState);

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
