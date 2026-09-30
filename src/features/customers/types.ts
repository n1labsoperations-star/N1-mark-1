import type { ActivityEntry, ISODateString } from '../../shared/types';

export type CustomerType = 'business' | 'individual';

export type Customer = {
  id: string;
  type: CustomerType;
  name: string;
  contactPerson: string;
  mobile: string;
  email: string;
  gstNumber: string;
  address: string;
  city: string;
  state: string;
  notes: string;
  /** Active work orders. */
  currentProjects: number;
  /** Completed work orders. */
  previousProjects: number;
  totalRevenue: number;
  outstandingBalance: number;
  customerSince: ISODateString;
  activity: ActivityEntry[];
};

/** Fields on the Add / Edit customer form. */
export type CustomerInput = Pick<
  Customer,
  | 'type'
  | 'name'
  | 'contactPerson'
  | 'mobile'
  | 'email'
  | 'gstNumber'
  | 'address'
  | 'city'
  | 'state'
  | 'notes'
>;

/** A customer's share of active orders (dashboard + phone customers list). */
export type CustomerShare = {
  id: string;
  name: string;
  orders: number;
  percent: number;
  totalRevenue: number;
  outstandingBalance: number;
  color: string;
};
