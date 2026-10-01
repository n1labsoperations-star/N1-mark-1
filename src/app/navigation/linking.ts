import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

// Maps every screen to a URL path. On web this drives the browser address bar
// (and refresh / back / forward); on native it handles n1mark1:// deep links.
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['n1mark1://'],
  config: {
    screens: {
      Dashboard: {
        path: 'dashboard',
        screens: {
          Admin: {
            path: '',
            screens: {
              Overview: '',
              Users: 'users',
              Customers: 'customers',
              Orders: 'orders',
              JobCards: 'job-cards',
              Machines: 'machines',
              Billing: 'billing',
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
      Details: 'details/:id',
      Components: 'components',
      Admin: {
        path: 'admin',
        screens: {
          Dashboard: '',
          Users: 'users',
          UserDetails: 'users/:userId',
          MyProfile: 'profile',
          Customers: 'customers',
          CustomerDetails: 'customers/:customerId',
          Orders: 'orders',
          OrderDetails: 'orders/:orderId',
          // Optional id: blank creates a new order.
          OrderForm: 'order-form/:orderId?',
          JobCards: 'job-cards',
          Machines: 'machines',
          Billing: 'billing',
          InvoiceDetails: 'invoices/:invoiceId',
          InvoiceEdit: 'invoices/:invoiceId/edit',
          QuoteDetails: 'quotes/:quoteId',
          QuoteForm: 'quote-form/:quoteId?',
        },
      },
    },
  },
};
