import {
  getPathFromState,
  getStateFromPath,
  type NavigationState,
  type PartialState,
} from '@react-navigation/native';
import { linking } from '../linking';

type State = PartialState<NavigationState> | NavigationState | undefined;

/** The innermost route a URL opens, with its params. */
function leafRoute(path: string) {
  let state: State = getStateFromPath(path, linking.config) as State;
  let route;
  while (state) {
    route = state.routes[state.index ?? state.routes.length - 1];
    state = route.state as State;
  }
  return { name: route?.name, params: route?.params };
}

const ADMIN_URLS: [path: string, screen: string, params?: object][] = [
  ['/dashboard', 'DashboardHome'],
  ['/dashboard/users', 'UsersList'],
  ['/dashboard/users/USR-2', 'UserDetails', { userId: 'USR-2' }],
  ['/dashboard/customers', 'CustomersList'],
  ['/dashboard/customers/CUS-1', 'CustomerDetails', { customerId: 'CUS-1' }],
  ['/dashboard/orders', 'OrdersList'],
  ['/dashboard/orders/1042', 'OrderDetails', { orderId: '1042' }],
  ['/dashboard/orders/form', 'OrderForm'],
  ['/dashboard/orders/form/1042', 'OrderForm', { orderId: '1042' }],
  ['/dashboard/job-cards', 'JobCardsList'],
  ['/dashboard/job-cards/1042', 'JobCardDetails', { jobCardId: '1042' }],
  ['/dashboard/job-cards/1042/flow', 'JobCardFlow', { jobCardId: '1042' }],
  ['/dashboard/machines', 'Machines'],
  ['/dashboard/profile', 'MyProfile'],
  ['/dashboard/billing', 'BillingHome'],
  ['/dashboard/billing?tab=quotes', 'BillingHome', { tab: 'quotes' }],
  [
    '/dashboard/billing/invoices/INV-2026-0125',
    'InvoiceDetails',
    { invoiceId: 'INV-2026-0125' },
  ],
  [
    '/dashboard/billing/invoices/INV-2026-0125/edit',
    'InvoiceEdit',
    { invoiceId: 'INV-2026-0125' },
  ],
  [
    '/dashboard/billing/quotes/QT-2026-0042',
    'QuoteDetails',
    { quoteId: 'QT-2026-0042' },
  ],
  ['/dashboard/billing/quotes/form', 'QuoteForm'],
  [
    '/dashboard/billing/quotes/form/QT-2026-0042',
    'QuoteForm',
    { quoteId: 'QT-2026-0042' },
  ],
];

const CASES = ADMIN_URLS.map(([path, screen, params]) => ({
  path,
  screen,
  params,
}));

test.each(CASES)('$path opens $screen', ({ path, screen, params }) => {
  const leaf = leafRoute(path);
  expect(leaf.name).toBe(screen);
  if (params) {
    expect(leaf.params).toEqual(params);
  }
});

test.each(CASES)('$path round-trips to the same URL', ({ path }) => {
  const state = getStateFromPath(path, linking.config);
  type PathState = Parameters<typeof getPathFromState>[0];
  expect(getPathFromState(state as PathState, linking.config)).toBe(path);
});

test('auth screens keep their URLs', () => {
  expect(leafRoute('/login').name).toBe('Login');
  expect(leafRoute('/forgot-password/verify').name).toBe('VerifyCode');
});
