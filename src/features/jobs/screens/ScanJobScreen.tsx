import { useCallback } from 'react';
import { View } from 'react-native';
import {
  N1Header,
  N1IconButton,
  N1ScanFrame,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { notifyUnavailable } from '../../../shared/utils';
import { JOBS_STRINGS } from '../constants';
import type { JobsScreenProps } from '../types';

const S = JOBS_STRINGS.scan;

const makeStyles = createN1Styles(t => ({
  root: { flex: 1, backgroundColor: t.colors.scannerBackground },
}));

/**
 * Viewfinder for a job's QR code. No camera library is installed yet, so
 * scanning itself isn't wired; "Enter code manually" imports by code.
 */
export function ScanJobScreen({
  route,
  navigation,
}: JobsScreenProps<'ScanJob'>) {
  const styles = useN1Styles(makeStyles);
  const close = useCallback(() => navigation.goBack(), [navigation]);
  const enterCode = useCallback(
    () => navigation.navigate('EnterJobCode', route.params),
    [navigation, route.params],
  );

  return (
    <View style={styles.root} testID="scan-job-screen">
      <N1Header
        variant="dark"
        title={S.title}
        leftIcon="close"
        onLeftPress={close}
        right={
          <N1IconButton
            icon="flash"
            size="sm"
            variant="overlay"
            accessibilityLabel={S.flash}
            onPress={() => notifyUnavailable(S.flash)}
          />
        }
      />
      <N1ScanFrame
        title={S.frameTitle}
        message={S.message}
        actionLabel={S.manual}
        onActionPress={enterCode}
      />
    </View>
  );
}
