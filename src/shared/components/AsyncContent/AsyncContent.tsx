import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  N1Button,
  N1Icon,
  N1Text,
  createN1Styles,
  useN1Styles,
  useN1Theme,
} from '../../../N1Modules';
import { COMMON_STRINGS } from '../../constants';
import type { RequestStatus } from '../../types';

export type AsyncContentProps = {
  status: RequestStatus;
  error?: string | null;
  onRetry?: () => void;
  /** Keep showing the content while refreshing if it's already there. */
  hasData?: boolean;
  children: ReactNode;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.md,
    padding: t.spacing.xxxl,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
  },
}));

/** Loading spinner / error with retry / content. */
export function AsyncContent({
  status,
  error,
  onRetry,
  hasData = false,
  children,
  testID,
}: AsyncContentProps) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();

  if ((status === 'idle' || status === 'loading') && !hasData) {
    return (
      <View style={styles.center} testID={testID ?? 'async-loading'}>
        <ActivityIndicator color={theme.colors.textSecondary} />
        <N1Text color="secondary">{COMMON_STRINGS.loading}</N1Text>
      </View>
    );
  }

  if (status === 'failed' && !hasData) {
    return (
      <View style={styles.center} testID={testID ?? 'async-error'}>
        <N1Icon name="info" size="xl" color="danger" />
        <N1Text align="center">{error ?? COMMON_STRINGS.loadFailed}</N1Text>
        {onRetry && (
          <N1Button
            title={COMMON_STRINGS.retry}
            variant="secondary"
            onPress={onRetry}
          />
        )}
      </View>
    );
  }

  return <>{children}</>;
}
