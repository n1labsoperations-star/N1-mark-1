import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  AdminScreen,
  AsyncContent,
  ComingSoon,
  FormRow,
  N1Card,
  N1Tabs,
  N1TextInput,
  type N1Tab,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import { PROFILE_PANEL_WIDTH } from '../../../shared/constants';
import { useConfirmDelete } from '../../../shared/hooks';
import { formatCurrency } from '../../../shared/utils';
import { useOrganizationName } from '../../profile';
import {
  CustomerOrdersTable,
  CustomerQuotesTable,
} from '../components/CustomerHistoryTables';
import { CustomerProfilePanel } from '../components/CustomerProfilePanel';
import {
  CustomerSectionForm,
  type CustomerSection,
} from '../components/CustomerSectionForm';
import { DeleteCustomerDialog } from '../components/DeleteCustomerDialog';
import { CUSTOMER_STRINGS } from '../constants';
import { useCustomer } from '../hooks/useCustomers';
import type { AdminDrawerParamList } from '../../dashboard/types';
import type {
  Customer,
  CustomerDetailsOrigin,
  CustomersScreenProps,
} from '../types';

const D = CUSTOMER_STRINGS.details;

/** The drawer item each origin returns to. */
const FROM_ROUTE = {
  dashboard: 'Overview',
  orders: 'Orders',
} as const satisfies Record<CustomerDetailsOrigin, keyof AdminDrawerParamList>;

type Tab = CustomerSection | 'stats' | 'orders' | 'quotes';

const TABS: N1Tab<Tab>[] = [
  { key: 'info', label: D.tabs.info, icon: 'user' },
  { key: 'address', label: D.tabs.address, icon: 'building' },
  { key: 'stats', label: D.tabs.stats, icon: 'dashboard' },
  { key: 'orders', label: D.tabs.orders, icon: 'package' },
  { key: 'quotes', label: D.tabs.quotes, icon: 'receipt' },
  { key: 'notes', label: D.tabs.notes, icon: 'file' },
];

const makeStyles = createN1Styles(t => ({
  // Wide screens: the card fills the window; the menu and the section each
  // scroll on their own.
  card: { flex: 1, minHeight: 0 },
  row: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: t.spacing.xl,
  },
  nav: {
    width: PROFILE_PANEL_WIDTH,
    paddingRight: t.spacing.xl,
    borderRightWidth: t.borderWidth.hairline,
    borderRightColor: t.colors.border,
  },
  fill: { flex: 1 },
  content: { flex: 1, minWidth: 0 },
  section: { gap: t.spacing.lg },
  compactTabs: { marginVertical: t.spacing.lg },
}));

/**
 * One customer, laid out like User details: who they are and a section menu
 * on the left (Customer info, Address info, Stats, Orders, Quotes, Notes),
 * the section on the right, edited in place. Phones put the menu on top.
 */
export function CustomerDetailsScreen({
  route,
  navigation,
}: CustomersScreenProps<'CustomerDetails'>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const organizationName = useOrganizationName();
  const { customer, status, error, reload, remove, deletingId, deleteError } =
    useCustomer(route.params.customerId);
  const [tab, setTab] = useState<Tab>('info');
  const [editing, setEditing] = useState(false);
  const startEdit = useCallback(() => setEditing(true), []);
  const stopEdit = useCallback(() => setEditing(false), []);
  // Leaving a tab drops its unsaved edits.
  const changeTab = useCallback((key: Tab) => {
    setTab(key);
    setEditing(false);
  }, []);
  // Back returns where this page was opened from: the Dashboard or Orders,
  // else the Customers list (also after a refresh or a shared link).
  const { from } = route.params;
  const goBack = useCallback(
    () =>
      from
        ? navigation.navigate(FROM_ROUTE[from])
        : navigation.popTo('CustomersList'),
    [navigation, from],
  );
  const deletion = useConfirmDelete<Customer>(
    remove,
    deletingId,
    deleteError,
    goBack,
  );

  if (!customer) {
    return (
      <AdminScreen testID="customer-details-screen">
        <AsyncContent status={status} error={error} onRetry={reload}>
          <ComingSoon icon="building" title={D.title} message={D.notFound} />
        </AsyncContent>
      </AdminScreen>
    );
  }

  const heading = (title: string) => <N1Text variant="h3">{title}</N1Text>;
  // Read-only, like the locked fields of the other tabs.
  const readOnly = (label: string, value: string, id: string) => (
    <N1TextInput
      label={label}
      value={value}
      readOnly
      testID={`customer-stats-${id}`}
    />
  );

  const tabContent = () => {
    switch (tab) {
      case 'stats':
        return (
          <View style={styles.section} testID="customer-stats">
            {heading(D.tabs.stats)}
            <FormRow>
              {readOnly(
                D.currentProjects,
                CUSTOMER_STRINGS.active(customer.currentProjects),
                'current',
              )}
              {readOnly(
                D.previousProjects,
                CUSTOMER_STRINGS.completed(customer.previousProjects),
                'previous',
              )}
            </FormRow>
            <FormRow>
              {readOnly(
                D.totalRevenue,
                formatCurrency(customer.totalRevenue),
                'revenue',
              )}
              {readOnly(
                D.outstanding,
                formatCurrency(customer.outstandingBalance),
                'outstanding',
              )}
            </FormRow>
          </View>
        );
      case 'orders':
        return (
          <View style={styles.section}>
            {heading(D.tabs.orders)}
            <CustomerOrdersTable customer={customer} />
          </View>
        );
      case 'quotes':
        return (
          <View style={styles.section}>
            {heading(D.tabs.quotes)}
            <CustomerQuotesTable customer={customer} />
          </View>
        );
      default:
        return (
          <CustomerSectionForm
            key={tab}
            customer={customer}
            section={tab}
            editing={editing}
            onEdit={startEdit}
            onDone={stopEdit}
          />
        );
    }
  };

  const tabs = (
    <N1Tabs
      tabs={TABS}
      value={tab}
      onChange={changeTab}
      variant={isCompact ? 'segmented' : 'menu'}
      scrollable={isCompact}
      style={isCompact && styles.compactTabs}
      testID="customer-tab"
    />
  );

  const profile = (
    <CustomerProfilePanel
      customer={customer}
      backLabel={from ? D.backTo[from] : D.backToCustomers}
      onBack={goBack}
      onDelete={() => deletion.request(customer)}
    >
      {!isCompact && tabs}
    </CustomerProfilePanel>
  );

  const dialog = (
    <DeleteCustomerDialog
      customer={deletion.target}
      organizationName={organizationName}
      loading={deletion.loading}
      onConfirm={deletion.confirm}
      onCancel={deletion.cancel}
    />
  );

  if (isCompact) {
    return (
      <AdminScreen testID="customer-details-screen">
        <N1Card radius="sm">
          {profile}
          {tabs}
          {tabContent()}
        </N1Card>
        {dialog}
      </AdminScreen>
    );
  }

  return (
    <AdminScreen fixed testID="customer-details-screen">
      <N1Card radius="sm" style={styles.card}>
        <View style={styles.row}>
          <View style={styles.nav}>
            <ScrollView style={styles.fill}>{profile}</ScrollView>
          </View>
          <ScrollView
            style={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {tabContent()}
          </ScrollView>
        </View>
      </N1Card>
      {dialog}
    </AdminScreen>
  );
}
