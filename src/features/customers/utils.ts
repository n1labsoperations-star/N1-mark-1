import type { Customer } from './types';

export const customerSearchText = (c: Customer) =>
  `${c.name} ${c.contactPerson} ${c.email} ${c.city} ${c.gstNumber}`;

/** "12 Industrial Estate Road, Chennai, Tamil Nadu" — blank parts are skipped. */
export const formatAddress = (
  c: Pick<Customer, 'address' | 'city' | 'state'>,
) => [c.address, c.city, c.state].filter(Boolean).join(', ');

/** Only the street counts as "added"; state has a default. */
export const hasAddress = (c: Customer) => Boolean(c.address || c.city);
