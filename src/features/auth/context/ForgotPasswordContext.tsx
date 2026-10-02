import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

type ForgotPasswordState = {
  /** Email the reset code was sent to. Empty when a step is opened directly. */
  email: string;
  setEmail: (email: string) => void;
};

const ForgotPasswordContext = createContext<ForgotPasswordState | null>(null);

/**
 * Shares the email across the forgot password steps without putting it in
 * route params (which would show it in the web URL). Lives only as long as
 * the flow is mounted.
 */
export const ForgotPasswordProvider = React.memo(
  function ForgotPasswordProviderComponent({
    children,
  }: {
    children: ReactNode;
  }) {
    const [email, setEmail] = useState('');
    return (
      <ForgotPasswordContext.Provider value={{ email, setEmail }}>
        {children}
      </ForgotPasswordContext.Provider>
    );
  },
);
ForgotPasswordProvider.displayName = 'ForgotPasswordProvider';

export function useForgotPassword(): ForgotPasswordState {
  const state = useContext(ForgotPasswordContext);
  if (!state) {
    throw new Error(
      'useForgotPassword must be used inside ForgotPasswordProvider',
    );
  }
  return state;
}
