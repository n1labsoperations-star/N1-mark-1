import { useCallback, type ReactNode } from 'react';
import {
  AdminLayout,
  AsyncContent,
  ComingSoon,
} from '../../../shared/components';
import { N1View } from '../../../shared/components';
import { useSession } from '../../../features/profile';
import {
  ADMIN_NAV_ITEMS,
  ROUTE_SECTION,
  isSectionRoot,
  type AdminSection,
} from './navItems';
import type { AdminRouteName } from './types';

export const SHELL_STRINGS = {
  signedOutTitle: 'You’re signed out',
  signedOutMessage:
    'The login flow will take over here. For now, sign back in with the mock account.',
  signIn: 'Sign in again',
} as const;

type Props = {
  routeName: AdminRouteName;
  onNavigateSection: (section: AdminSection) => void;
  onOpenProfile: () => void;
  children: ReactNode;
};

/** Connects the shared AdminLayout to the session and the admin stack. */
export function AdminShell({
  routeName,
  onNavigateSection,
  onOpenProfile,
  children,
}: Props) {
  const { shellUser, organization, status, error, reload, signedOut } =
    useSession();
  const signIn = useCallback(() => reload(), [reload]);

  if (signedOut) {
    return (
      <N1View flex={1} background="background" padding="xxl" justify="center">
        <ComingSoon
          icon="lock"
          title={SHELL_STRINGS.signedOutTitle}
          message={SHELL_STRINGS.signedOutMessage}
          actionLabel={SHELL_STRINGS.signIn}
          onAction={signIn}
        />
      </N1View>
    );
  }

  if (!shellUser || !organization) {
    return (
      <N1View flex={1} background="background" padding="xxl" justify="center">
        <AsyncContent status={status} error={error} onRetry={reload}>
          {null}
        </AsyncContent>
      </N1View>
    );
  }

  return (
    <AdminLayout
      items={ADMIN_NAV_ITEMS}
      activeKey={ROUTE_SECTION[routeName]}
      onNavigate={onNavigateSection}
      organizationName={organization.name}
      organizationShortName={organization.shortName}
      user={shellUser}
      onProfilePress={onOpenProfile}
      showCompactBar={isSectionRoot(routeName)}
    >
      {children}
    </AdminLayout>
  );
}
