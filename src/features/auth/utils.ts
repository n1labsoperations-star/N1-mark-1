import type { N1ChecklistItem } from '../../shared/components';
import {
  MOCK_USERS,
  type MockUser,
  ORGANIZATION_CODE_LENGTH,
  PASSWORD_MIN_LENGTH,
  VERIFICATION_CODE_LENGTH,
} from './constants';

/** "ABC Engineering Pvt Ltd" → "ABCENG". Empty when the name has no letters or digits. */
export function generateOrganizationCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, ORGANIZATION_CODE_LENGTH);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export type PasswordRules = {
  minLength: boolean;
  lettersAndNumbers: boolean;
  matches: boolean;
};

export function checkPassword(
  password: string,
  confirmPassword: string,
): PasswordRules {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    lettersAndNumbers: /[a-z]/i.test(password) && /\d/.test(password),
    matches: password.length > 0 && password === confirmPassword,
  };
}

/** True when every password rule passes. */
export function isPasswordValid(rules: PasswordRules): boolean {
  return rules.minLength && rules.lettersAndNumbers && rules.matches;
}

/** The rules as rows for N1Checklist. */
export function passwordChecklist(rules: PasswordRules): N1ChecklistItem[] {
  return [
    {
      label: `Minimum ${PASSWORD_MIN_LENGTH} characters`,
      done: rules.minLength,
    },
    { label: 'Letters and numbers', done: rules.lettersAndNumbers },
    { label: 'Passwords match', done: rules.matches },
  ];
}

/** Keeps only digits, capped at the code length. */
export function sanitizeCode(input: string): string {
  return input.replace(/\D/g, '').slice(0, VERIFICATION_CODE_LENGTH);
}

export function isCompleteCode(code: string): boolean {
  return sanitizeCode(code).length === VERIFICATION_CODE_LENGTH;
}

/** The mock user matching these credentials, or undefined. Email ignores case and spaces. */
export function findMockUser(
  email: string,
  password: string,
): MockUser | undefined {
  const normalized = email.trim().toLowerCase();
  return MOCK_USERS.find(
    user => user.email === normalized && user.password === password,
  );
}
