import {
  allText,
  byLabel,
  byTestId,
  byText,
  hasTestId,
  press,
  renderAdmin,
  typeInto,
} from '../../../shared/testing/testUtils';
import { ROLE_OPTIONS } from '../constants';

let mockWidth = 1280;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 900, scale: 1, fontScale: 1 }),
}));

beforeEach(() => {
  mockWidth = 1280;
});

describe('Users list (desktop)', () => {
  test('shows every user with role, status and join date', async () => {
    const { root } = await renderAdmin('Users');
    const text = allText(root);
    expect(text).toContain('Manage everyone in ABC Engineering Pvt Ltd.');
    [
      'Koushik Dasarathan',
      'Priya Sharma',
      'Arjun Mehta',
      'Divya Rao',
      'Karthik Iyer',
    ].forEach(name => expect(text).toContain(name));
    expect(text).toContain('Suspended');
    expect(text).toContain('Sep 18, 2026');
    expect(text).toContain('Showing 10 of 22 users');
  });

  test('search and the multi-select filter narrow the list', async () => {
    const { root } = await renderAdmin('Users');
    await typeInto(byLabel(root, 'Search users'), 'priya');
    expect(allText(root)).toContain('Priya Sharma');
    expect(allText(root)).not.toContain('Arjun Mehta');
    await typeInto(byLabel(root, 'Search users'), '');

    const panel = () => byTestId(root, 'users-filter-panel');
    const tab = (label: string) =>
      panel().find(
        n =>
          n.props.accessibilityRole === 'tab' &&
          n.props.onPress &&
          allText(n).startsWith(label),
      );

    // Invited + Suspended, picked together.
    await press(byTestId(root, 'users-filter'));
    await press(tab('Status'));
    await press(byLabel(panel(), 'Invited'));
    await press(byLabel(panel(), 'Suspended'));
    await press(byTestId(root, 'users-filter-apply'));
    let text = allText(root);
    expect(text).toContain('Arjun Mehta');
    expect(text).toContain('Karthik Iyer');
    expect(text).not.toContain('Divya Rao');
    expect(byLabel(root, 'Filter (2)')).toBeTruthy();

    // Picks without Apply change nothing.
    await press(byTestId(root, 'users-filter'));
    await press(tab('Role'));
    await press(byLabel(panel(), 'Admin'));
    await press(byLabel(panel(), 'Close'));
    expect(allText(root)).toContain('Arjun Mehta');

    // Clear all, then just Admin.
    await press(byTestId(root, 'users-filter'));
    await press(byText(panel(), 'Clear all'));
    await press(tab('Role'));
    await press(byLabel(panel(), 'Admin'));
    await press(byTestId(root, 'users-filter-apply'));
    text = allText(root);
    expect(text).toContain('Showing 1 of 1 users');
    expect(text).toContain('Koushik Dasarathan');

    await typeInto(byLabel(root, 'Search users'), 'nobody');
    expect(allText(root)).toContain('No results match your search.');
  });

  test('creates a user after validating the form', async () => {
    const { root, store } = await renderAdmin('Users');
    await press(byTestId(root, 'create-user'));
    await press(byTestId(root, 'user-form-submit'));
    expect(allText(root)).toContain('This field is required');

    await typeInto(byTestId(root, 'user-form-name'), 'Meena Lakshmi');
    await typeInto(byTestId(root, 'user-form-email'), 'meena@');
    await typeInto(byTestId(root, 'user-form-password'), 'short');
    await press(byTestId(root, 'user-form-submit'));
    expect(allText(root)).toContain('Enter a valid email address');
    expect(allText(root)).toContain(
      'Use at least 8 characters with letters and numbers',
    );

    await typeInto(
      byTestId(root, 'user-form-email'),
      'meena@abcengineering.com',
    );
    await typeInto(byTestId(root, 'user-form-password'), 'welcome123');
    await press(byTestId(root, 'user-form-submit'));

    expect(store.getState().userManagement.ids).toHaveLength(23);
    expect(allText(root)).not.toContain('Add a new person to');
    // New users join the end of the list, now the third page.
    await press(byLabel(root, 'Page 3'));
    expect(allText(root)).toContain('Meena Lakshmi');
  });

  test('edits a user without changing the password', async () => {
    const { root, store } = await renderAdmin('Users');
    await press(byLabel(root, 'Edit Priya Sharma'));
    expect(allText(root)).toContain('Edit user');
    await typeInto(byTestId(root, 'user-form-name'), 'Priya S');
    await press(byTestId(root, 'user-form-submit'));
    expect(store.getState().userManagement.entities['USR-2'].name).toBe(
      'Priya S',
    );
  });

  test('deletes a user after confirming', async () => {
    const { root, store } = await renderAdmin('Users');
    await press(byLabel(root, 'Delete Karthik Iyer'));
    expect(allText(root)).toContain('Delete user?');
    await press(byText(root, 'Delete user'));
    expect(store.getState().userManagement.entities['USR-5']).toBeUndefined();
    expect(allText(root)).not.toContain('Karthik Iyer');
  });

  test('row opens the user details', async () => {
    const h = await renderAdmin('Users');
    await press(byText(h.root, 'Divya Rao'));
    expect(h.currentRoute()).toBe('UserDetails');
    expect(allText(h.root)).toContain('QC Inspector');
  });
});

describe('User details', () => {
  test('desktop shows contact, attachments and account, no permissions', async () => {
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-2' });
    const text = allText(h.root);
    expect(text).toContain('Production Supervisor · ABC Engineering Pvt Ltd');
    expect(text).toContain('+91 98765 43210');
    expect(text).toContain('Manufacturing Operations');
    expect(text).toContain('ID proof.pdf');
    expect(text).toContain('1.2 MB');
    expect(text).toContain('Joined Sep 18, 2026');
    expect(text).toContain('2h ago');
    expect(text).not.toContain('Permissions');
    expect(text).not.toContain('Manage users');
  });

  test('active status saves to the store', async () => {
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-2' });
    await press(byTestId(h.root, 'toggle-active'));
    expect(h.store.getState().userManagement.entities['USR-2'].status).toBe(
      'inactive',
    );
    expect(allText(h.root)).toContain('Mark as active');
    await press(byTestId(h.root, 'toggle-active'));
    expect(h.store.getState().userManagement.entities['USR-2'].status).toBe(
      'active',
    );
  });

  test('edit opens the form; delete returns to the list', async () => {
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-4' });
    // The list stays mounted under the details screen, so query inside the details only.
    const screen = byTestId(h.root, 'user-details-screen');
    await press(byTestId(screen, 'edit-user'));
    expect(byTestId(screen, 'user-form-password').props.placeholder).toBe(
      'Leave blank to keep current password',
    );
    await press(byText(screen, 'Cancel'));
    await press(byLabel(screen, 'Delete Divya Rao'));
    await press(byText(screen, 'Delete user'));
    expect(h.currentRoute()).toBe('Users');
    expect(h.store.getState().userManagement.entities['USR-4']).toBeUndefined();
  });

  test('unknown user shows a not-found message', async () => {
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-404' });
    expect(allText(h.root)).toContain('This user no longer exists.');
  });

  test('phone layout stacks contact details with a back header', async () => {
    mockWidth = 390;
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-2' });
    const text = allText(h.root);
    expect(text).toContain('Contact details');
    expect(text).toContain('ABC Engineering Pvt Ltd');
    expect(text).toContain('Reset');
    await press(byLabel(h.root, 'Back'));
    expect(h.currentRoute()).toBe('Users');
  });
});

test('phone list uses cards and a pinned Create User button', async () => {
  mockWidth = 390;
  const { root } = await renderAdmin('Users');
  expect(hasTestId(root, 'user-card-USR-2')).toBe(true);
  expect(hasTestId(root, 'users-filter')).toBe(false);
  await press(byTestId(root, 'create-user'));
  expect(allText(root)).toContain('Create user');
});

describe('roles', () => {
  test('the role options are Admin, Supervisor, Operator and QC', () => {
    expect(ROLE_OPTIONS.map(o => o.label)).toEqual([
      'Admin',
      'Supervisor',
      'Operator',
      'QC',
    ]);
    expect(ROLE_OPTIONS.map(o => o.value)).toEqual([
      'admin',
      'supervisor',
      'operator',
      'qc',
    ]);
  });

  test("the users list shows each person's role", async () => {
    const { root } = await renderAdmin('Users');
    const text = allText(root);
    for (const label of ['Admin', 'Supervisor', 'Operator', 'QC']) {
      expect(text).toContain(label);
    }
    expect(text).not.toContain('|User|');
  });
});

test('wide screens: the page stays put; only the user rows scroll', async () => {
  const { root } = await renderAdmin('Users');
  const table = byTestId(root, 'users-table');
  const scroll = byTestId(table, 'users-table-scroll');
  expect(allText(scroll)).toContain('Koushik Dasarathan');
  // Pagination sits below the scrolling rows, always visible.
  expect(allText(scroll)).not.toContain('Showing 10 of 22 users');
  expect(allText(table)).toContain('Showing 10 of 22 users');
});

test('a search with no matches keeps the pagination under the message', async () => {
  const { root } = await renderAdmin('Users');
  await typeInto(byLabel(root, 'Search users'), 'zzz-nobody');
  const table = byTestId(root, 'users-table');
  const text = allText(table);
  expect(text).toContain('No results match your search.');
  expect(text).toContain('Showing 0 of 0 users');
  expect(byLabel(table, 'Next').props.accessibilityState.disabled).toBe(true);
});

test('the toolbar has a filled search and one Filter button', async () => {
  const { root } = await renderAdmin('Users');
  const table = byTestId(root, 'users-table');
  const search = table.find(
    n =>
      n.props.variant === 'filled' &&
      n.props.placeholder === 'Search users' &&
      typeof n.type !== 'string',
  );
  expect(search).toBeTruthy();
  expect(byLabel(table, 'Filter')).toBeTruthy();
});

test('with no matches the column headings stay above the message', async () => {
  const { root } = await renderAdmin('Users');
  await typeInto(byLabel(root, 'Search users'), 'zzz-nobody');
  const text = allText(byTestId(root, 'users-table'));
  for (const column of ['Name', 'Email', 'Role', 'Status', 'Joined']) {
    expect(text).toContain(column);
  }
  expect(text).toContain('No results match your search.');
});

test('browser autofill stays out of the search and the new-user form', async () => {
  const { root } = await renderAdmin('Users');
  const search = byLabel(root, 'Search users');
  expect(search.props.autoComplete).toBe('off');
  expect(search.props.keyboardType).toBe('web-search');

  await press(byTestId(root, 'create-user'));
  const host = (id: string) =>
    byTestId(root, id).find(n => n.props.autoComplete !== undefined);
  expect(host('user-form-email').props.autoComplete).toBe('off');
  expect(host('user-form-password').props.autoComplete).toBe('new-password');
});
