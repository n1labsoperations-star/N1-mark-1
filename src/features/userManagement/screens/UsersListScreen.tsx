import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  N1Avatar,
  N1Button,
  N1PageHeader,
  N1Pagination,
  N1Table,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
  type N1TableColumn,
} from '../../../shared/components';
import type { UserManagementNavigation } from '../types';
import {
  AdminScreen,
  AsyncContent,
  ListToolbar,
  RowActions,
  FilterMenu,
  type FilterValues,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import {
  useConfirmDelete,
  useListFilter,
  usePagination,
} from '../../../shared/hooks';
import { formatDate } from '../../../shared/utils';
import { useOrganizationName } from '../../profile';
import { DeleteUserDialog } from '../components/DeleteUserDialog';
import { UserCard } from '../components/UserCard';
import { RoleBadge, UserStatusBadge } from '../components/UserBadges';
import { UserFormModal } from '../components/UserFormModal';
import { ROLE_OPTIONS, STATUS_OPTIONS, USER_STRINGS } from '../constants';
import { useUsers } from '../hooks/useUsers';
import type { AdminUser, UserFilters } from '../types';
import {
  INITIAL_USER_FILTERS,
  matchesUserFilters,
  userSearchText,
} from '../utils';

const makeStyles = createN1Styles(t => ({
  nameCell: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
  // Matches the filled filters next to it in the toolbar.
}));

type FormTarget = { user: AdminUser | null } | null;

export function UsersListScreen() {
  const styles = useN1Styles(makeStyles);
  const navigation = useNavigation<UserManagementNavigation>();
  const { isCompact } = useN1Breakpoint();
  const organizationName = useOrganizationName();
  const { items, status, error, reload, remove, deletingId, deleteError } =
    useUsers();

  const { query, setQuery, filters, setFilter, filtered } = useListFilter(
    items,
    {
      getSearchText: userSearchText,
      initialFilters: INITIAL_USER_FILTERS,
      matchesFilters: matchesUserFilters,
    },
  );
  const pager = usePagination(filtered);

  const filterGroups = useMemo(
    () => [
      { key: 'role', label: USER_STRINGS.roleFilter, options: ROLE_OPTIONS },
      {
        key: 'status',
        label: USER_STRINGS.statusFilter,
        options: STATUS_OPTIONS,
      },
    ],
    [],
  );
  const applyFilters = useCallback(
    (next: FilterValues) => {
      setFilter('role', (next.role ?? []) as UserFilters['role']);
      setFilter('status', (next.status ?? []) as UserFilters['status']);
    },
    [setFilter],
  );

  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const openCreate = useCallback(() => setFormTarget({ user: null }), []);
  const openEdit = useCallback(
    (user: AdminUser) => setFormTarget({ user }),
    [],
  );
  const closeForm = useCallback(() => setFormTarget(null), []);

  const deletion = useConfirmDelete<AdminUser>(remove, deletingId, deleteError);
  const requestDelete = deletion.request;

  const openDetails = useCallback(
    (user: AdminUser) =>
      navigation.navigate('UserDetails', { userId: user.id }),
    [navigation],
  );

  const columns = useMemo<N1TableColumn<AdminUser>[]>(
    () => [
      {
        key: 'name',
        title: USER_STRINGS.columns.name,
        flex: 2,
        render: user => (
          <View style={styles.nameCell}>
            <N1Avatar name={user.name} size="sm" />
            <N1Text weight="bold" numberOfLines={1}>
              {user.name}
            </N1Text>
          </View>
        ),
      },
      { key: 'email', title: USER_STRINGS.columns.email, flex: 2.2 },
      {
        key: 'role',
        title: USER_STRINGS.columns.role,
        render: u => <RoleBadge role={u.role} />,
      },
      {
        key: 'status',
        title: USER_STRINGS.columns.status,
        render: u => <UserStatusBadge status={u.status} />,
      },
      {
        key: 'joinedAt',
        title: USER_STRINGS.columns.joined,
        render: u => (
          <N1Text color="secondary">{formatDate(u.joinedAt)}</N1Text>
        ),
      },
      {
        key: 'actions',
        interactive: true,
        title: '',
        flex: 0.6,
        align: 'right',
        render: u => (
          <RowActions
            onEdit={() => openEdit(u)}
            onDelete={() => requestDelete(u)}
            editLabel={USER_STRINGS.a11y.edit(u.name)}
            deleteLabel={USER_STRINGS.a11y.delete(u.name)}
          />
        ),
      },
    ],
    [styles, openEdit, requestDelete],
  );

  const renderCompactItem = useCallback(
    (user: AdminUser) => (
      <UserCard user={user} onEdit={openEdit} onDelete={requestDelete} />
    ),
    [openEdit, requestDelete],
  );

  const createButton = (
    <N1Button
      title={USER_STRINGS.create}
      leftIcon="plus"
      onPress={openCreate}
      size={isCompact ? 'md' : 'sm'}
      fullWidth={isCompact}
      testID="create-user"
    />
  );

  const firstLoad =
    (status === 'idle' || status === 'loading') && items.length === 0;

  const toolbar = (
    <ListToolbar
      align="end"
      filled
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder={USER_STRINGS.search}
    >
      {!isCompact && (
        <>
          <FilterMenu
            groups={filterGroups}
            value={filters}
            onApply={applyFilters}
            testID="users-filter"
          />
          {createButton}
        </>
      )}
    </ListToolbar>
  );

  return (
    <AdminScreen compactFooter={createButton} testID="users-screen" fixed>
      {/* Wide screens: the title and Create live in the table's toolbar. */}
      {isCompact && <N1PageHeader title={USER_STRINGS.title} />}
      {/* The table shows its own loading state; AsyncContent only takes over
          when the first load fails. */}
      <AsyncContent
        status={firstLoad ? 'succeeded' : status}
        error={error}
        onRetry={reload}
        hasData={items.length > 0}
      >
        <N1Table
          loading={firstLoad}
          columns={columns}
          data={pager.pageItems}
          keyExtractor={u => u.id}
          onRowPress={openDetails}
          renderCompactItem={renderCompactItem}
          toolbarTitle={isCompact ? undefined : USER_STRINGS.title}
          toolbar={toolbar}
          scrollable={!isCompact}
          emptyText={
            items.length ? COMMON_STRINGS.noResults : COMMON_STRINGS.empty
          }
          footer={
            !isCompact && (
              <N1Pagination
                summary={COMMON_STRINGS.showing(
                  pager.shownCount,
                  pager.total,
                  USER_STRINGS.noun,
                )}
                hasPrevious={pager.hasPrevious}
                hasNext={pager.hasNext}
                onPrevious={pager.previous}
                onNext={pager.next}
                page={pager.page}
                pageCount={pager.pageCount}
                onPageChange={pager.goTo}
              />
            )
          }
          testID="users-table"
        />
      </AsyncContent>

      <UserFormModal
        visible={formTarget !== null}
        user={formTarget?.user}
        organizationName={organizationName}
        onClose={closeForm}
      />
      <DeleteUserDialog
        user={deletion.target}
        loading={deletion.loading}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
    </AdminScreen>
  );
}
