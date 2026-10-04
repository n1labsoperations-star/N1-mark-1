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
import { userManagementApi } from '../api/userManagementApi';
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

  test('leaving Users and coming back clears the search', async () => {
    const h = await renderAdmin('Users');
    await typeInto(byLabel(h.root, 'Search users'), 'nobody');
    expect(allText(h.root)).toContain('No results match your search.');
    await h.navigate('Customers');
    await h.navigate('Users');
    expect(byLabel(h.root, 'Search users').props.value).toBe('');
    expect(allText(h.root)).not.toContain('No results match your search.');
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
  test('like Organization: identity on top, a section menu, locked fields', async () => {
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-2' });
    const screen = byTestId(h.root, 'user-details-screen');
    const field = (key: string) => byTestId(screen, `user-details-${key}`);
    const identity = allText(byTestId(screen, 'user-identity'));
    expect(identity).toContain(
      'Production Supervisor · ABC Engineering Pvt Ltd',
    );
    expect(identity).toContain('Joined Sep 18, 2026');
    expect(field('phone').props.value).toBe('+91 98765 43210');
    expect(field('department').props.value).toBe('Manufacturing Operations');
    expect(field('organization').props.value).toBe('ABC Engineering Pvt Ltd');
    expect(field('name').props.editable).toBe(false);
    const text = allText(screen);
    expect(text).not.toContain('Permissions');
    expect(text).not.toContain('Manage users');

    // Address details and Documents are their own sections.
    expect(hasTestId(screen, 'user-documents')).toBe(false);
    await press(byTestId(screen, 'user-section-documents'));
    expect(allText(byTestId(screen, 'user-documents'))).toContain(
      'ID proof.pdf',
    );
    expect(allText(byTestId(screen, 'user-documents'))).toContain('1.2 MB');
    expect(hasTestId(screen, 'user-section-activity')).toBe(false);
  });

  test('Address details: locked until Edit, validates the PIN code and saves', async () => {
    const spy = jest.spyOn(userManagementApi, 'update');
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-2' });
    const screen = byTestId(h.root, 'user-details-screen');
    const field = (key: string) => byTestId(screen, `user-address-${key}`);
    await press(byTestId(screen, 'user-section-address'));
    expect(field('city').props.value).toBe('Chennai');
    expect(field('pinCode').props.value).toBe('600040');
    expect(field('city').props.editable).toBe(false);

    await press(byTestId(screen, 'edit-user-address'));
    await typeInto(field('pinCode'), '123');
    await press(byTestId(screen, 'user-address-submit'));
    expect(allText(screen)).toContain('Enter a 6-digit PIN code');
    expect(spy).not.toHaveBeenCalled();

    await typeInto(field('pinCode'), '641012');
    await typeInto(field('city'), ' Coimbatore ');
    await press(byTestId(screen, 'user-address-submit'));
    expect(spy).toHaveBeenCalledWith(
      'USR-2',
      expect.objectContaining({ city: 'Coimbatore', pinCode: '641012' }),
    );
    expect(h.store.getState().userManagement.entities['USR-2'].city).toBe(
      'Coimbatore',
    );
    expect(field('city').props.editable).toBe(false);
  });

  test('Edit unlocks the fields in place (no dialog), validates and saves', async () => {
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-2' });
    const screen = byTestId(h.root, 'user-details-screen');
    const field = (key: string) => byTestId(screen, `user-details-${key}`);
    await press(byTestId(screen, 'edit-user'));
    expect(hasTestId(screen, 'user-form')).toBe(false);
    expect(field('name').props.editable).toBe(true);
    // Organization and Joined never change here.
    expect(field('organization').props.editable).toBe(false);

    await typeInto(field('email'), 'not-an-email');
    await typeInto(field('phone'), '12');
    await press(byTestId(screen, 'user-details-submit'));
    expect(allText(screen)).toContain('Enter a valid email');
    expect(allText(screen)).toContain('Enter a valid phone number');

    await typeInto(field('email'), 'priya@abc.in');
    await typeInto(field('phone'), '+91 90000 22222');
    await typeInto(field('department'), ' Production ');
    await choose(screen, 'user-details-role', 'Operator');
    await press(byTestId(screen, 'user-details-submit'));
    expect(h.store.getState().userManagement.entities['USR-2']).toMatchObject({
      email: 'priya@abc.in',
      phone: '+91 90000 22222',
      department: 'Production',
      role: 'operator',
    });
    expect(field('name').props.editable).toBe(false);
  });

  test('Cancel or another section drops unsaved edits', async () => {
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-2' });
    const screen = byTestId(h.root, 'user-details-screen');
    const name = () => byTestId(screen, 'user-details-name');
    await press(byTestId(screen, 'edit-user'));
    await typeInto(name(), 'Draft');
    await press(byText(byTestId(screen, 'user-details-form'), 'Cancel'));
    expect(name().props.value).toBe('Priya Sharma');

    await press(byTestId(screen, 'edit-user'));
    await typeInto(name(), 'Draft');
    await press(byTestId(screen, 'user-section-documents'));
    await press(byTestId(screen, 'user-section-profile'));
    expect(name().props.value).toBe('Priya Sharma');
    expect(name().props.editable).toBe(false);
  });

  test('Security: Reset password reveals the new password and saves it', async () => {
    const spy = jest.spyOn(userManagementApi, 'update');
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-2' });
    const screen = byTestId(h.root, 'user-details-screen');
    await press(byTestId(screen, 'user-section-security'));
    expect(byTestId(screen, 'user-password-current').props.value).toBe(
      '••••••••',
    );
    await press(byTestId(screen, 'user-password-start'));
    await typeInto(byLabel(screen, 'New password'), 'welcome123');
    await typeInto(byLabel(screen, 'Confirm password'), 'welcome123');
    await press(byTestId(screen, 'user-password-submit'));
    expect(spy).toHaveBeenCalledWith('USR-2', { password: 'welcome123' });
    expect(allText(byTestId(screen, 'user-password-changed'))).toBe(
      'Password updated',
    );
  });

  test('Delete user asks, then returns to the list', async () => {
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-4' });
    // The list stays mounted under the details screen, so query inside the details only.
    const screen = byTestId(h.root, 'user-details-screen');
    // The red Delete user at the foot of the menu, then the dialog's button.
    await press(byLabel(screen, 'Delete Divya Rao'));
    await press(byText(byTestId(screen, 'delete-user-dialog'), 'Delete user'));
    expect(h.currentRoute()).toBe('Users');
    expect(h.store.getState().userManagement.entities['USR-4']).toBeUndefined();
  });

  test('Documents: each upload adds a thumbnail beside the last, then remove', async () => {
    const spy = jest.spyOn(userManagementApi, 'update');
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-1' });
    const screen = byTestId(h.root, 'user-details-screen');
    await press(byTestId(screen, 'user-section-documents'));
    const docs = () => allText(byTestId(screen, 'user-documents'));
    expect(docs()).toContain('No documents uploaded yet.');

    await press(byTestId(screen, 'user-documents-upload'));
    expect(spy).toHaveBeenCalledWith('USR-1', {
      attachments: [expect.objectContaining({ name: 'ID proof.pdf' })],
    });
    expect(docs()).toContain('1 document');
    expect(docs()).toContain('ID proof.pdf');
    await press(byTestId(screen, 'user-documents-upload'));
    expect(docs()).toContain('2 documents');
    expect(
      h.store.getState().userManagement.entities['USR-1'].attachments,
    ).toHaveLength(2);
    await press(byLabel(screen, 'Remove ID proof.pdf'));
    expect(docs()).toContain('1 document');

    await press(byLabel(screen, 'Remove ID proof.pdf'));
    expect(
      h.store.getState().userManagement.entities['USR-1'].attachments,
    ).toEqual([]);
    expect(docs()).toContain('No documents uploaded yet.');
  });

  test('Work history: the job cards they ran a step on; a row opens it', async () => {
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-6' });
    const screen = byTestId(h.root, 'user-details-screen');
    await press(byTestId(screen, 'user-section-work'));
    const history = byTestId(screen, 'user-work-history');
    // Ravi Kumar has run steps on these. Not 1039: his step there hasn't
    // started. Not 1037: he has no step on it.
    ['1042', '1040', '1034', '1038'].forEach(id =>
      expect(hasTestId(history, `user-work-${id}`)).toBe(true),
    );
    expect(hasTestId(history, 'user-work-1039')).toBe(false);
    expect(hasTestId(history, 'user-work-1037')).toBe(false);
    const row = allText(byTestId(history, 'user-work-1042'));
    expect(row).toContain('WO #1042');
    expect(row).toContain('RC #1042');
    expect(row).toContain('Facing (Lathe)');
    expect(row).toContain('Started Sep 25, 2026');
    expect(row).toContain('In progress');

    await press(byTestId(history, 'user-work-1042'));
    expect(h.currentRoute()).toBe('JobCardDetails');
  });

  test('Work history is empty for someone who has run no steps', async () => {
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-1' });
    const screen = byTestId(h.root, 'user-details-screen');
    await press(byTestId(screen, 'user-section-work'));
    expect(allText(byTestId(screen, 'user-work-history'))).toContain(
      'No job cards yet.',
    );
  });

  test('the back button returns to the list', async () => {
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-2' });
    await press(byTestId(h.root, 'user-details-back'));
    expect(h.currentRoute()).toBe('Users');
    expect(hasTestId(h.root, 'user-details-screen')).toBe(false);
    expect(allText(h.root)).toContain('Showing 10 of');
  });

  test('unknown user shows a not-found message', async () => {
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-404' });
    expect(allText(h.root)).toContain('This user no longer exists.');
  });

  test('phone layout: section tabs on top, Delete user under the profile', async () => {
    mockWidth = 390;
    const h = await renderAdmin('Users');
    await h.navigate('UserDetails', { userId: 'USR-2' });
    expect(hasTestId(h.root, 'user-section-documents')).toBe(true);
    expect(allText(byTestId(h.root, 'user-identity'))).toContain(
      'ABC Engineering Pvt Ltd',
    );
    expect(allText(byTestId(h.root, 'delete-user'))).toBe('Delete user');
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
