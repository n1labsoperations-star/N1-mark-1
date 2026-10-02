import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  N1Avatar,
  N1Button,
  N1IconButton,
  N1PageHeader,
  N1Pagination,
  N1Table,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
  type N1TableColumn,
} from '../../../shared/components';
import type { CustomersNavigation } from '../types';
import {
  AdminScreen,
  AsyncContent,
  ListToolbar,
  RowActions,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import {
  useConfirmDelete,
  useListFilter,
  usePagination,
} from '../../../shared/hooks';
import { formatCurrency } from '../../../shared/utils';
import { useOrganizationName } from '../../profile';
import { CustomerFormModal } from '../components/CustomerFormModal';
import { CustomerOverview } from '../components/CustomerOverview';
import { CustomerRow } from '../components/CustomerRow';
import { DeleteCustomerDialog } from '../components/DeleteCustomerDialog';
import { CUSTOMER_STRINGS as S } from '../constants';
import { useCustomers } from '../hooks/useCustomers';
import type { Customer } from '../types';
import { customerSearchText, formatAddress, hasAddress } from '../utils';

const makeStyles = createN1Styles(t => ({
  nameCell: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
}));

type FormTarget = { customer: Customer | null } | null;

export function CustomersListScreen() {
  const styles = useN1Styles(makeStyles);
  const navigation = useNavigation<CustomersNavigation>();
  const { isCompact } = useN1Breakpoint();
  const organizationName = useOrganizationName();
  const { items, status, error, reload, remove, deletingId, deleteError } =
    useCustomers();

  const { query, setQuery, filtered } = useListFilter(items, {
    getSearchText: customerSearchText,
  });
  const pager = usePagination(filtered);

  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const openCreate = useCallback(() => setFormTarget({ customer: null }), []);
  const openEdit = useCallback(
    (customer: Customer) => setFormTarget({ customer }),
    [],
  );
  const closeForm = useCallback(() => setFormTarget(null), []);
  const deletion = useConfirmDelete<Customer>(remove, deletingId, deleteError);
  const requestDelete = deletion.request;

  const openDetails = useCallback(
    (c: Customer) =>
      navigation.navigate('CustomerDetails', { customerId: c.id }),
    [navigation],
  );

  const columns = useMemo<N1TableColumn<Customer>[]>(
    () => [
      {
        key: 'name',
        title: S.columns.customer,
        flex: 2,
        render: c => (
          <View style={styles.nameCell}>
            <N1Avatar name={c.name} size="sm" />
            <N1Text weight="bold" numberOfLines={1}>
              {c.name}
            </N1Text>
          </View>
        ),
      },
      {
        key: 'current',
        title: S.columns.current,
        render: c => <N1Text>{S.active(c.currentProjects)}</N1Text>,
      },
      {
        key: 'previous',
        title: S.columns.previous,
        render: c => <N1Text>{S.completed(c.previousProjects)}</N1Text>,
      },
      {
        key: 'revenue',
        title: S.columns.revenue,
        render: c => <N1Text>{formatCurrency(c.totalRevenue)}</N1Text>,
      },
      {
        key: 'outstanding',
        title: S.columns.outstanding,
        render: c => <N1Text>{formatCurrency(c.outstandingBalance)}</N1Text>,
      },
      {
        key: 'address',
        title: S.columns.address,
        flex: 1.4,
        render: c =>
          hasAddress(c) ? (
            <N1Text numberOfLines={2}>{formatAddress(c)}</N1Text>
          ) : (
            <N1Text color="tertiary">{COMMON_STRINGS.notAdded}</N1Text>
          ),
      },
      {
        key: 'actions',
        interactive: true,
        title: '',
        flex: 0.6,
        align: 'right',
        render: c => (
          <RowActions
            onEdit={() => openEdit(c)}
            onDelete={() => requestDelete(c)}
            editLabel={S.a11y.edit(c.name)}
            deleteLabel={S.a11y.delete(c.name)}
          />
        ),
      },
    ],
    [styles, openEdit, requestDelete],
  );

  const renderCompactItem = useCallback(
    (c: Customer) => <CustomerRow customer={c} />,
    [],
  );

  const addButton = isCompact ? (
    <N1IconButton
      icon="plus"
      variant="primary"
      accessibilityLabel={S.addA11y}
      onPress={openCreate}
      testID="add-customer"
    />
  ) : (
    <N1Button
      title={S.add}
      leftIcon="plus"
      onPress={openCreate}
      testID="add-customer"
    />
  );

  return (
    <AdminScreen testID="customers-screen">
      <N1PageHeader
        title={S.title}
        subtitle={isCompact ? undefined : S.subtitle(organizationName)}
        right={addButton}
      />
      <AsyncContent
        status={status}
        error={error}
        onRetry={reload}
        hasData={items.length > 0}
      >
        {isCompact && <CustomerOverview customerCount={items.length} />}
        <ListToolbar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder={S.search}
        />
        <N1Table
          columns={columns}
          data={pager.pageItems}
          keyExtractor={c => c.id}
          onRowPress={openDetails}
          renderCompactItem={renderCompactItem}
          emptyText={
            items.length ? COMMON_STRINGS.noResults : COMMON_STRINGS.empty
          }
          footer={
            (!isCompact || pager.pageCount > 1) && (
              <N1Pagination
                summary={COMMON_STRINGS.showing(
                  pager.shownCount,
                  pager.total,
                  S.noun,
                )}
                hasPrevious={pager.hasPrevious}
                hasNext={pager.hasNext}
                onPrevious={pager.previous}
                onNext={pager.next}
              />
            )
          }
          testID="customers-table"
        />
      </AsyncContent>

      <CustomerFormModal
        visible={formTarget !== null}
        customer={formTarget?.customer}
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
