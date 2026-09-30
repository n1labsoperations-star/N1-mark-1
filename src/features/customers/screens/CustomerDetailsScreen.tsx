import { useCallback, useMemo } from 'react';
import { Linking, View } from 'react-native';
import {
  N1Badge,
  N1Button,
  N1Card,
  N1DetailGrid,
  N1Divider,
  N1IconButton,
  N1KeyValueList,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import type { AdminScreenProps } from '../../../app/navigation/admin/types';
import {
  ActivityCard,
  AdminScreen,
  AsyncContent,
  ComingSoon,
  DetailHeader,
  EntityHero,
  SplitLayout,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useConfirmDelete, useToggle } from '../../../shared/hooks';
import { formatCurrency, formatDate } from '../../../shared/utils';
import { useOrganizationName } from '../../profile';
import { CustomerFormModal } from '../components/CustomerFormModal';
import { DeleteCustomerDialog } from '../components/DeleteCustomerDialog';
import { CUSTOMER_STRINGS, CUSTOMER_TYPE_BADGE } from '../constants';
import { useCustomer } from '../hooks/useCustomers';
import type { Customer } from '../types';
import { formatAddress } from '../utils';

const D = CUSTOMER_STRINGS.details;

const makeStyles = createN1Styles(t => ({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
  section: { gap: t.spacing.md },
  grow: { flex: 1 },
}));

const orDash = (value: string) => value || COMMON_STRINGS.dash;

export function CustomerDetailsScreen({
  route,
  navigation,
}: AdminScreenProps<'CustomerDetails'>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const organizationName = useOrganizationName();
  const { customer, status, error, reload, remove, deletingId, deleteError } =
    useCustomer(route.params.customerId);
  const [formOpen, openForm, closeForm] = useToggle(false);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const deletion = useConfirmDelete<Customer>(
    remove,
    deletingId,
    deleteError,
    goBack,
  );

  const message = useCallback(() => {
    if (!customer) {
      return;
    }
    const url = customer.email
      ? `mailto:${customer.email}`
      : `sms:${customer.mobile.replace(/\s/g, '')}`;
    Linking.openURL(url).catch(() => undefined);
  }, [customer]);

  const accountItems = useMemo(
    () =>
      customer
        ? [
            {
              label: D.currentProjects,
              value: CUSTOMER_STRINGS.active(customer.currentProjects),
            },
            {
              label: D.previousProjects,
              value: CUSTOMER_STRINGS.completed(customer.previousProjects),
            },
            {
              label: D.totalRevenue,
              value: formatCurrency(customer.totalRevenue),
            },
            {
              label: D.outstanding,
              value: formatCurrency(customer.outstandingBalance),
            },
          ]
        : [],
    [customer],
  );

  const contactItems = useMemo(() => {
    if (!customer) {
      return [];
    }
    const address = orDash(formatAddress(customer));
    return isCompact
      ? [
          { label: D.contactPerson, value: orDash(customer.contactPerson) },
          { label: D.mobile, value: orDash(customer.mobile) },
          { label: D.email, value: orDash(customer.email) },
          { label: D.gst, value: orDash(customer.gstNumber) },
          { label: D.address, value: address },
        ]
      : [
          { label: D.mobile, value: orDash(customer.mobile) },
          { label: D.email, value: orDash(customer.email) },
          { label: D.gst, value: orDash(customer.gstNumber) },
          {
            label: D.cityState,
            value: orDash(
              [customer.city, customer.state].filter(Boolean).join(', '),
            ),
          },
          { label: D.address, value: address },
        ];
  }, [customer, isCompact]);

  const editIcon = (
    <N1IconButton
      icon="edit"
      size="sm"
      accessibilityLabel={CUSTOMER_STRINGS.a11y.edit(customer?.name ?? '')}
      onPress={openForm}
    />
  );
  const header = (
    <DetailHeader
      title={isCompact ? D.compactTitle : D.title}
      onBack={goBack}
      compactRight={customer && editIcon}
    />
  );

  if (!customer) {
    return (
      <AdminScreen header={header}>
        <AsyncContent status={status} error={error} onRetry={reload}>
          <ComingSoon icon="building" title={D.title} message={D.notFound} />
        </AsyncContent>
      </AdminScreen>
    );
  }

  const typeBadge = (
    <N1Badge label={CUSTOMER_TYPE_BADGE[customer.type]} tone="info" />
  );
  const deleteButton = (
    <N1IconButton
      icon="trash"
      variant="danger"
      accessibilityLabel={CUSTOMER_STRINGS.a11y.delete(customer.name)}
      onPress={() => deletion.request(customer)}
      testID="delete-customer"
    />
  );

  const hero = (
    <EntityHero
      name={customer.name}
      subtitle={
        isCompact
          ? undefined
          : `${customer.contactPerson} · ${D.contactPersonSuffix}`
      }
      badges={typeBadge}
      actions={
        <>
          <N1Button
            title={isCompact ? COMMON_STRINGS.edit : D.editDetails}
            leftIcon="edit"
            size={isCompact ? 'md' : 'sm'}
            onPress={openForm}
            style={isCompact && styles.grow}
            testID="edit-customer"
          />
          <N1Button
            title={D.message}
            leftIcon="message"
            variant="secondary"
            size={isCompact ? 'md' : 'sm'}
            onPress={message}
            style={isCompact && styles.grow}
          />
          {deleteButton}
        </>
      }
    />
  );

  const notes = (
    <View style={styles.section}>
      <N1Text variant="title" weight="bold">
        {D.notes}
      </N1Text>
      <N1Text color="secondary">{orDash(customer.notes)}</N1Text>
    </View>
  );

  const aside = !isCompact && (
    <>
      <N1Card title={COMMON_STRINGS.account} icon="clipboard">
        <N1KeyValueList variant="plain" items={accountItems} />
      </N1Card>
      <ActivityCard items={customer.activity} />
    </>
  );

  return (
    <AdminScreen header={header} testID="customer-details-screen">
      <SplitLayout aside={aside}>
        {isCompact ? (
          <>
            {hero}
            <N1KeyValueList
              title={COMMON_STRINGS.account}
              items={accountItems}
            />
            <N1DetailGrid title={D.contact} items={contactItems} columns={1} />
            <N1Divider />
            {notes}
          </>
        ) : (
          <N1Card padding="xxl">
            <View style={styles.section}>
              <View style={styles.topRow}>
                {typeBadge}
                <N1Text variant="small" color="secondary">
                  {D.since(formatDate(customer.customerSince))}
                </N1Text>
              </View>
              <N1Divider spacing="sm" />
              {hero}
              <N1Divider spacing="sm" />
              <N1DetailGrid items={contactItems} />
              <N1Divider spacing="sm" />
              {notes}
            </View>
          </N1Card>
        )}
      </SplitLayout>

      <CustomerFormModal
        visible={formOpen}
        customer={customer}
        organizationName={organizationName}
        onClose={closeForm}
      />
      <DeleteCustomerDialog
        customer={deletion.target}
        organizationName={organizationName}
        loading={deletion.loading}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
    </AdminScreen>
  );
}
