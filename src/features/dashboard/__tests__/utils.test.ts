import { ALL, MENU_ITEMS, SAMPLE_USERS } from '../constants';
import { filterUsers, visibleMenuItems } from '../utils';

const labels = (items: { label: string }[]) => items.map(i => i.label);

describe('visibleMenuItems', () => {
  test('wide screens show every section', () => {
    expect(
      labels(visibleMenuItems(MENU_ITEMS, { compact: false, query: '' })),
    ).toEqual([
      'Dashboard',
      'Users',
      'Customers',
      'Orders',
      'Job Cards',
      'Machines',
      'Billing',
    ]);
  });

  test('phones show the shorter menu', () => {
    expect(
      labels(visibleMenuItems(MENU_ITEMS, { compact: true, query: '' })),
    ).toEqual(['Dashboard', 'Users', 'Orders']);
  });

  test('search matches labels case-insensitively', () => {
    expect(
      labels(visibleMenuItems(MENU_ITEMS, { compact: false, query: ' CARD ' })),
    ).toEqual(['Job Cards']);
  });
});

describe('filterUsers', () => {
  const run = (query = '', role = ALL, status = ALL) =>
    filterUsers(SAMPLE_USERS, { query, role, status }).map(u => u.name);

  test('no filters returns everyone', () => {
    expect(run()).toHaveLength(SAMPLE_USERS.length);
  });

  test('search matches name or email', () => {
    expect(run('priya')).toEqual(['Priya Sharma']);
    expect(run('KARTHIK.IYER@')).toEqual(['Karthik Iyer']);
  });

  test('role and status filters combine', () => {
    expect(run('', 'admin')).toEqual(['Koushik Dasarathan']);
    expect(run('', 'user', 'active')).toEqual(['Priya Sharma', 'Divya Rao']);
    expect(run('', ALL, 'suspended')).toEqual(['Karthik Iyer']);
  });

  test('no match returns an empty list', () => {
    expect(run('nobody')).toEqual([]);
  });
});
