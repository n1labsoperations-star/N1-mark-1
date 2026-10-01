import { createCrudSlice } from '../../../shared/store';
import type { OrderInput, WorkOrder } from '../types';
import { compareOrders } from '../utils';

export const ordersCrud = createCrudSlice<WorkOrder, OrderInput>(
  'orders',
  compareOrders,
);

export const orderActions = ordersCrud.actions;
export default ordersCrud.reducer;
