import {
  allText,
  byLabel,
  byTestId,
  byText,
  choose,
  hasTestId,
  press,
  renderAdmin,
  typeInto,
} from '../../../shared/testing/testUtils';

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
    expect(text).toContain('Showing 5 of 5 users');
  });

  test('search and filters narrow the list', async () => {
    const { root } = await renderAdmin('Users');
    await typeInto(byLabel(root, 'Search users'), 'priya');
    expect(allText(root)).toContain('Priya Sharma');
    expect(allText(root)).not.toContain('Arjun Mehta');
    await typeInto(byLabel(root, 'Search users'), '');
    await choose(root, 'filter-status', 'Invited');
    expect(allText(root)).toContain('Arjun Mehta');
    expect(allText(root)).not.toContain('Divya Rao');
    await choose(root, 'filter-status', 'All statuses');
    await choose(root, 'filter-role', 'Admin');
    expect(allText(root)).toContain('Showing 1 of 1 users');
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

    expect(store.getState().userManagement.ids).toHaveLength(6);
    expect(allText(root)).toContain('Meena Lakshmi');
    expect(allText(root)).not.toContain('Add a new person to');
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
  test('desktop shows contact, attachments, account and permissions', async () => {
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
  });

  test('permission toggles and active status save to the store', async () => {
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-2' });
    await press(byTestId(h.root, 'permission-manageUsers'));
    expect(
      h.store.getState().userManagement.entities['USR-2'].permissions
        .manageUsers,
    ).toBe(true);
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
  expect(hasTestId(root, 'filter-role')).toBe(false);
  await press(byTestId(root, 'create-user'));
  expect(allText(root)).toContain('Create user');
});
