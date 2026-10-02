import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

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
          User: 'user',
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
