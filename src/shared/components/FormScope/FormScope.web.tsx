import { createElement, type ReactNode } from 'react';

export type FormScopeProps = { children: ReactNode };

// Takes no space of its own: the children lay out as if it weren't there.
const STYLE = { display: 'contents' } as const;

/**
 * Wraps the fields in a real <form>. React Native Web renders no forms, so
 * Chrome treats the whole page as one and fills a picked saved login into
 * any text box, such as the menu search. Inside a <form>, it only fills that
 * form's fields. Enter doesn't submit it; the form's own button does.
 */
export function FormScope({ children }: FormScopeProps) {
  return createElement(
    'form',
    {
      style: STYLE,
      noValidate: true,
      onSubmit: (event: { preventDefault: () => void }) =>
        event.preventDefault(),
    },
    children,
  );
}
