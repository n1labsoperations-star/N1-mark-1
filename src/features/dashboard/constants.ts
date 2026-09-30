export const DASHBOARD_STRINGS = {
  title: 'Dashboard',
  subtitle: (org: string) => `Overview for ${org}.`,
  stats: {
    monthly: 'Monthly billed',
    year: 'Total billed (this year)',
    outstanding: 'Outstanding amount',
    newOrders: 'New orders',
  },
  distribution: {
    title: 'Customer order distribution',
    subtitle: 'Share of active orders by customer, by volume.',
    activeBadge: (n: number) => `${n} active orders`,
    activeBadgeShort: (n: number) => `${n} active`,
    pipeline: 'Active pipeline',
    orders: (n: number) => `${n} orders`,
    total: 'Total',
    ordersCaption: 'orders',
    columns: {
      customer: 'Customer',
      orders: 'Orders',
      billed: 'Total billed',
      outstanding: 'Outstanding',
    },
    billed: (amount: string) => `Billed: ${amount}`,
    outstanding: (amount: string) => `Outstanding: ${amount}`,
    viewMore: 'View more',
    open: (name: string) => `Open ${name}`,
  },
  jobs: {
    title: 'Priority jobs (by due date)',
    viewAll: (n: number) => `View all (${n})`,
    open: (title: string) => `Open ${title}`,
  },
} as const;

/** Rows in the priority jobs panel before "View all". */
export const PRIORITY_JOBS_LIMIT = 10;
