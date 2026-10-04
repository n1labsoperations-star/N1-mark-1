import type { ReactNode } from 'react';

export type FormScopeProps = { children: ReactNode };

/**
 * Groups a form's fields for the browser's password manager. Native apps
 * have no such grouping, so this renders its children as they are; the web
 * build (FormScope.web.tsx) wraps them in a real <form>.
 */
export function FormScope({ children }: FormScopeProps) {
  return <>{children}</>;
}
