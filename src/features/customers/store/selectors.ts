import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import { percentOf } from '../../../shared/utils';
import type { CustomerShare } from '../types';
import { customersCrud } from './customersSlice';

export const selectCustomersState = (state: RootState) => state.customers;

export const { selectAll: selectAllCustomers, selectById: selectCustomerById } =
  customersCrud.adapter.getSelectors(selectCustomersState);

export const selectActiveOrderTotal = createSelector(
  [selectAllCustomers],
  customers => customers.reduce((sum, c) => sum + c.currentProjects, 0),
);

/** Each customer's share of active orders; colours come from the chart palette. */
export const makeSelectCustomerShares = (palette: readonly string[]) =>
  createSelector(
    [selectAllCustomers, selectActiveOrderTotal],
    (customers, total): CustomerShare[] =>
      customers
        .filter(c => c.currentProjects > 0)
        .map((c, index) => ({
          id: c.id,
          name: c.name,
          orders: c.currentProjects,
          percent: percentOf(c.currentProjects, total),
          totalRevenue: c.totalRevenue,
          outstandingBalance: c.outstandingBalance,
          color: palette[index % palette.length],
        })),
  );
