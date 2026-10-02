import type { N1DropDownOption } from '../../shared/components';

export const LOGIN_TAGLINE =
  'N1 brings your organization, your team and your data together in one dashboard.';

export const CREATE_ORGANIZATION_TAGLINE =
  'Register your organization, get its unique code, and bring your team into one dashboard.';

export const FORGOT_PASSWORD_TAGLINE =
  "Locked out? It happens. We'll get you back into your dashboard in a minute.";

export const VERIFY_CODE_TAGLINE =
  "Almost there. Enter the code we sent to confirm it's you.";

export const RESET_PASSWORD_TAGLINE =
  "One last step — choose a new password and you're back in.";

export const PASSWORD_MIN_LENGTH = 8;

/** Digits in the emailed verification code. */
export const VERIFICATION_CODE_LENGTH = 6;

/** Length of the auto-generated organization code. */
export const ORGANIZATION_CODE_LENGTH = 6;

export const INDUSTRY_OPTIONS: N1DropDownOption<string>[] = [
  { label: 'Metal Manufacturing', value: 'metal-manufacturing' },
  { label: 'Automotive', value: 'automotive' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Plastics & Rubber', value: 'plastics-rubber' },
  { label: 'Textiles', value: 'textiles' },
  { label: 'Food & Beverage', value: 'food-beverage' },
  { label: 'Other', value: 'other' },
];
