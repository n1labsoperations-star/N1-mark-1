import type { N1IconName } from '../../../N1Modules';

export type AdminNavItem<K extends string = string> = {
  key: K;
  label: string;
  icon: N1IconName;
};

/** The signed-in person shown in the top bar and sidebar footer. */
export type AdminUserSummary = {
  name: string;
  email: string;
  /** e.g. "Admin · ABC Engineering". */
  subtitle: string;
};
