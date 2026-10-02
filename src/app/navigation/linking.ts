import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

// Same paths for every non-admin role: /dashboard/qc (Jobs),
// /dashboard/qc/profile and /dashboard/qc/profile/edit.
const USER_TAB_SCREENS = {
  Tabs: {
    path: '',
    screens: {
      Jobs: '',
      Profile: 'profile',
    },
  },
  EditProfile: 'profile/edit',
};

// Maps every screen to a URL path. On web this drives the browser address bar
// (and refresh / back / forward); on native it handles n1mark1:// deep links.
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['n1mark1://'],
  config: {
    screens: {
      // Admin modules: /dashboard, /dashboard/orders/1042, /dashboard/job-cards/1042/flow…
      Dashboard: {
        path: 'dashboard',
        screens: {
          Admin: {
            path: '',
            screens: {
              Overview: {
                path: '',
                screens: { DashboardHome: '' },
              },
              Users: {
                path: 'users',
                screens: {
                  UsersList: '',
                  UserDetails: ':userId',
                },
              },
              Customers: {
                path: 'customers',
                screens: {
                  CustomersList: '',
                  CustomerDetails: ':customerId',
                },
              },
              Orders: {
                path: 'orders',
                screens: {
                  OrdersList: '',
                  // Optional id: blank creates a new order.
                  OrderForm: 'form/:orderId?',
                  OrderDetails: ':orderId',
                },
              },
              JobCards: {
                path: 'job-cards',
                screens: {
                  JobCardsList: '',
                  JobCardDetails: ':jobCardId',
                  JobCardFlow: ':jobCardId/flow',
                },
              },
              Machines: 'machines',
              Profile: {
                path: 'profile',
                screens: { MyProfile: '' },
              },
              Organization: 'organization',
              Billing: {
                path: 'billing',
                screens: {
                  // ?tab=quotes opens the Quotes tab.
                  BillingHome: '',
                  InvoiceDetails: 'invoices/:invoiceId',
                  InvoiceEdit: 'invoices/:invoiceId/edit',
                  // Optional id: blank creates a new quote.
                  QuoteForm: 'quotes/form/:quoteId?',
                  QuoteDetails: 'quotes/:quoteId',
                },
              },
            },
          },
          // Non-admin roles (see USER_TAB_SCREENS).
          // /dashboard/supervisor/orders/1042, …/job-cards/1042/flow
          Supervisor: {
            path: 'supervisor',
            screens: {
              ...USER_TAB_SCREENS,
              ScanJob: 'scan',
              EnterJobCode: 'job-code',
              ImportOrder: 'orders/:orderId',
              RawMaterial: 'orders/:orderId/raw-material',
              JobCardDetails: 'job-cards/:jobCardId',
              JobCardFlow: 'job-cards/:jobCardId/flow',
            },
          },
          // /dashboard/operator/jobs/1042, …/jobs/1042/machine
          Operator: {
            path: 'operator',
            screens: {
              ...USER_TAB_SCREENS,
              ScanJob: 'scan',
              EnterJobCode: 'job-code',
              OperatorJob: 'jobs/:jobCardId',
              AssignMachine: 'jobs/:jobCardId/machine',
              OrderDetails: 'orders/:orderId',
            },
          },
          // /dashboard/qc/checks/rm/1042, …/checks/machine/1042/fail
          Qc: {
            path: 'qc',
            screens: {
              ...USER_TAB_SCREENS,
              ScanJob: 'scan',
              EnterJobCode: 'job-code',
              QcCheck: 'checks/:kind/:jobCardId',
              QcFail: 'checks/:kind/:jobCardId/fail',
              OrderDetails: 'orders/:orderId',
            },
          },
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          CreateOrganization: 'create-organization',
          ForgotPasswordFlow: {
            path: 'forgot-password',
            screens: {
              ForgotPassword: '',
              VerifyCode: 'verify',
              ResetPassword: 'reset',
            },
          },
        },
      },
    },
  },
};
