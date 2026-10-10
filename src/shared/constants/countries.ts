/**
 * Countries offered for addresses: India first, then main trading partners
 * alphabetically. Add a name here to offer it everywhere.
 */
export const COUNTRIES = [
  'India',
  'Australia',
  'Bangladesh',
  'Canada',
  'China',
  'France',
  'Germany',
  'Indonesia',
  'Italy',
  'Japan',
  'Malaysia',
  'Nepal',
  'Netherlands',
  'Oman',
  'Qatar',
  'Saudi Arabia',
  'Singapore',
  'South Africa',
  'South Korea',
  'Sri Lanka',
  'Thailand',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Vietnam',
] as const;

/** COUNTRIES as dropdown options. */
export const COUNTRY_OPTIONS = COUNTRIES.map(name => ({
  label: name,
  value: name as string,
}));
