import { createCrudSlice } from '../../../shared/store';
import type { Customer, CustomerInput } from '../types';

// Busiest accounts first.
const byActiveProjects = (a: Customer, b: Customer) =>
  b.currentProjects - a.currentProjects || a.name.localeCompare(b.name);

export const customersCrud = createCrudSlice<Customer, CustomerInput>(
  'customers',
  byActiveProjects,
);

export const customerActions = customersCrud.actions;
export default customersCrud.reducer;
