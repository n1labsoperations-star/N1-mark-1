import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  N1Avatar,
  N1Badge,
  N1Button,
  N1DropDown,
  N1IconButton,
  N1Table,
  N1Text,
  N1TextInput,
  useN1Breakpoint,
  useN1Styles,
  type N1TableColumn,
} from '../../../shared/components';
import { formatShortDate } from '../../../shared/utils';
import {
  ALL,
  ORGANIZATION,
  ROLE_FILTER_OPTIONS,
  ROLE_LABEL,
  ROLE_TONE,
  SAMPLE_USERS,
  STATUS_FILTER_OPTIONS,
  STATUS_LABEL,
  STATUS_TONE,
} from '../constants';
import { makeUsersScreenStyles } from '../styles';
import type { OrgUser } from '../types';
import { filterUsers } from '../utils';

function UsersScreen() {
  const styles = useN1Styles(makeUsersScreenStyles);
  const { isCompact } = useN1Breakpoint();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);

  const users = useMemo(
    () => filterUsers(SAMPLE_USERS, { query, role, status }),
    [query, role, status],
  );

  const columns = useMemo<N1TableColumn<OrgUser>[]>(
    () => [
      {
        key: 'name',
        title: 'Name',
        flex: 2,
        render: user => (
          <View style={styles.nameCell}>
            <N1Avatar name={user.name} />
            <N1Text variant="title">{user.name}</N1Text>
          </View>
        ),
      },
      { key: 'email', title: 'Email', flex: 2.4 },
      {
        key: 'role',
        title: 'Role',
        render: user => (
          <N1Badge label={ROLE_LABEL[user.role]} tone={ROLE_TONE[user.role]} />
        ),
      },
      {
        key: 'status',
        title: 'Status',
        render: user => (
          <N1Badge
            label={STATUS_LABEL[user.status]}
            tone={STATUS_TONE[user.status]}
            dot
          />
        ),
      },
      {
        key: 'joined',
        title: 'Joined',
        render: user => (
          <N1Text color="secondary">{formatShortDate(user.joined)}</N1Text>
        ),
      },
      {
        key: 'actions',
        title: '',
        flex: 0.8,
        align: 'right',
        render: user => (
          <View style={styles.actions}>
            <N1IconButton
              icon="edit"
              variant="ghost"
              size="sm"
              accessibilityLabel={`Edit ${user.name}`}
            />
            <N1IconButton
              icon="trash"
              variant="ghostDanger"
              size="sm"
              accessibilityLabel={`Delete ${user.name}`}
            />
          </View>
        ),
      },
    ],
    [styles],
  );

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        isCompact && styles.compactContent,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.heading}>
          <N1Text variant={isCompact ? 'h2' : 'h1'} accessibilityRole="header">
            Users
          </N1Text>
          <N1Text color="secondary">
            {`Manage everyone in ${ORGANIZATION.name}.`}
          </N1Text>
        </View>
        <N1Button title="Create User" leftIcon="plus" />
      </View>

      <View style={[styles.filters, isCompact && styles.compactFilters]}>
        <N1TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search users"
          leftIcon="search"
          accessibilityLabel="Search users"
          autoCapitalize="none"
          containerStyle={isCompact ? undefined : styles.search}
        />
        <View
          style={[styles.dropdownRow, !isCompact && styles.wideDropdownRow]}
        >
          <N1DropDown
            options={ROLE_FILTER_OPTIONS}
            value={role}
            onChange={setRole}
            sheetTitle="Role"
            containerStyle={styles.dropdown}
          />
          <N1DropDown
            options={STATUS_FILTER_OPTIONS}
            value={status}
            onChange={setStatus}
            sheetTitle="Status"
            containerStyle={styles.dropdown}
          />
        </View>
      </View>

      <N1Table
        columns={columns}
        data={users}
        keyExtractor={user => user.id}
        emptyText="No users match these filters."
      />
    </ScrollView>
  );
}

export default React.memo(UsersScreen);
