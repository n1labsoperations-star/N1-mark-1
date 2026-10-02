// Text shared by several features. Feature-specific text lives in each feature's constants.ts.

export const COMMON_STRINGS = {
  cancel: 'Cancel',
  save: 'Save changes',
  edit: 'Edit',
  delete: 'Delete',
  view: 'View',
  back: 'Back',
  close: 'Close',
  export: 'Export',
  retry: 'Try again',
  next: 'Next',
  previous: 'Previous',
  loading: 'Loading…',
  loadFailed: 'Something went wrong while loading.',
  empty: 'Nothing to show yet.',
  noResults: 'No results match your search.',
  notAdded: 'Not added yet',
  dash: '—',
  recentActivity: 'Recent activity',
  account: 'Account',
  allStatuses: 'All statuses',
  required: 'This field is required',
  invalidEmail: 'Enter a valid email address',
  invalidPhone: 'Enter a valid phone number',
  invalidGstin: 'Enter a valid 15-character GST number',
  invalidNumber: 'Enter a number',
  showing: (shown: number, total: number, noun: string) =>
    `Showing ${shown} of ${total} ${noun}`,
} as const;

export const NAV_STRINGS = {
  mainMenu: 'Main menu',
  searchMenu: 'Search here…',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  collapseSidebar: 'Collapse sidebar',
  expandSidebar: 'Expand sidebar',
  openProfile: 'Open my profile',
  dashboard: 'Dashboard',
  users: 'Users',
  customers: 'Customers',
  orders: 'Orders',
  jobCards: 'Job Cards',
  machines: 'Machines',
  billing: 'Billing',
} as const;

export const PASSWORD_STRINGS = {
  minLength: 'Minimum 8 characters',
  lettersAndNumbers: 'Letters and numbers',
  match: 'Passwords match',
} as const;
