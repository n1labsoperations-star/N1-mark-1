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
  ['/dashboard/machines', 'MachinesList'],
  ['/dashboard/machines/MCH-1', 'MachineDetails', { machineId: 'MCH-1' }],
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

const USER_URLS: [path: string, screen: string][] = [
  'supervisor',
  'operator',
  'qc',
].flatMap(role => [
  [`/dashboard/${role}`, 'Jobs'],
  [`/dashboard/${role}/profile`, 'Profile'],
  [`/dashboard/${role}/profile/edit`, 'EditProfile'],
]);

const SUPERVISOR_URLS: [path: string, screen: string, params?: object][] = [
  ['/dashboard/supervisor/scan', 'ScanJob'],
  ['/dashboard/supervisor/job-code', 'EnterJobCode'],
  ['/dashboard/supervisor/orders/1036', 'ImportOrder', { orderId: '1036' }],
  [
    '/dashboard/supervisor/orders/1036/raw-material',
    'RawMaterial',
    { orderId: '1036' },
  ],
  [
    '/dashboard/supervisor/job-cards/1042',
    'JobCardDetails',
    { jobCardId: '1042' },
  ],
];

const OPERATOR_URLS: [path: string, screen: string, params?: object][] = [
  ['/dashboard/operator/scan', 'ScanJob'],
  ['/dashboard/operator/job-code', 'EnterJobCode'],
  ['/dashboard/operator/jobs/1042', 'OperatorJob', { jobCardId: '1042' }],
  [
    '/dashboard/operator/jobs/1042/machine',
    'AssignMachine',
    { jobCardId: '1042' },
  ],
];

const QC_URLS: [path: string, screen: string, params?: object][] = [
  ['/dashboard/qc/scan', 'ScanJob'],
  [
    '/dashboard/qc/checks/rm/1042',
    'QcCheck',
    { kind: 'rm', jobCardId: '1042' },
  ],
  [
    '/dashboard/qc/checks/machine/1042/fail',
    'QcFail',
    { kind: 'machine', jobCardId: '1042' },
  ],
];

const CASES = [
  ...ADMIN_URLS,
  ...USER_URLS,
  ...SUPERVISOR_URLS,
  ...OPERATOR_URLS,
  ...QC_URLS,
].map(([path, screen, params]: [string, string, object?]) => ({
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
