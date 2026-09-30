import { useMemo } from 'react';
import { useBillingSummary } from '../../billing';
import { TOP_CUSTOMERS_COUNT, useCustomerShares } from '../../customers';
import { usePriorityJobs } from '../../orders';
import { PRIORITY_JOBS_LIMIT } from '../constants';
import type { RequestStatus } from '../../../shared/types';

const worst = (...statuses: RequestStatus[]): RequestStatus =>
  statuses.includes('failed')
    ? 'failed'
    : statuses.some(s => s === 'idle' || s === 'loading')
    ? 'loading'
    : 'succeeded';

/**
 * Everything the dashboard shows, derived from the customers, orders and
 * billing stores (each loads itself on first use).
 */
export function useDashboard() {
  const billing = useBillingSummary();
  const customers = useCustomerShares();
  const orders = usePriorityJobs();

  const topCustomers = useMemo(
    () => customers.shares.slice(0, TOP_CUSTOMERS_COUNT),
    [customers.shares],
  );
  const jobs = useMemo(
    () => orders.jobs.slice(0, PRIORITY_JOBS_LIMIT),
    [orders.jobs],
  );

  return {
    status: worst(billing.status, customers.status, orders.status),
    error: billing.error ?? customers.error ?? orders.error,
    reload: () => {
      billing.reload();
      customers.reload();
      orders.reload();
    },
    stats: {
      monthlyBilled: billing.monthlyBilled,
      yearBilled: billing.yearBilled,
      outstanding: billing.outstanding,
      newOrders: orders.newOrders,
    },
    shares: customers.shares,
    topCustomers,
    activeOrders: customers.totalOrders,
    jobs,
    totalJobs: orders.jobs.length,
  };
}
