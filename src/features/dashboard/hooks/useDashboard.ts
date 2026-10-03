import { useMemo } from 'react';
import { useBillingSummary } from '../../billing';
import { useCustomerShares } from '../../customers';
import { useJobCards } from '../../jobCards';
import { usePriorityJobs } from '../../orders';
import { PRIORITY_JOBS_LIMIT } from '../constants';
import type { DashboardPeriod } from '../types';
import { byDueDate, customerRows, summarizePeriod } from '../utils';
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
export function useDashboard(period: DashboardPeriod) {
  const billing = useBillingSummary();
  const customers = useCustomerShares();
  const orders = usePriorityJobs();
  const jobCards = useJobCards();

  const customerTable = useMemo(
    () => customerRows(customers.shares, orders.orders),
    [customers.shares, orders.orders],
  );
  // Summary cards for the period picked in the header tabs.
  const stats = useMemo(
    () => summarizePeriod(billing.invoices, orders.orders, period),
    [billing.invoices, orders.orders, period],
  );
  // Priority jobs: job cards (they carry progress, process and operator),
  // earliest due first.
  const sortedJobs = useMemo(() => byDueDate(jobCards.items), [jobCards.items]);
  const jobs = useMemo(
    () => sortedJobs.slice(0, PRIORITY_JOBS_LIMIT),
    [sortedJobs],
  );

  return {
    status: worst(
      billing.status,
      customers.status,
      orders.status,
      jobCards.status,
    ),
    error: billing.error ?? customers.error ?? orders.error ?? jobCards.error,
    reload: () => {
      billing.reload();
      customers.reload();
      orders.reload();
      jobCards.reload();
    },
    stats,
    shares: customers.shares,
    customers: customerTable,
    activeOrders: customers.totalOrders,
    jobs,
    totalJobs: sortedJobs.length,
  };
}
