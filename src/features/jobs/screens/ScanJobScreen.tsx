import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
  N1Button,
  N1Header,
  N1IconButton,
  N1QrScanner,
  N1ScanFrame,
  createN1Styles,
  useCameraAccess,
  useN1Styles,
} from '../../../shared/components';
import { SCANNER_STRINGS } from '../../../shared/constants';
import { useToggle } from '../../../shared/hooks';
import { JOBS_STRINGS } from '../constants';
import { useImportJobByCode } from '../hooks/useImportJobByCode';
import type { JobsScreenProps } from '../types';

const S = JOBS_STRINGS.scan;

const makeStyles = createN1Styles(t => ({
  root: { flex: 1, backgroundColor: t.colors.scannerBackground },
}));

/**
 * Scans a job's QR code and imports it the same way as a typed code. The
 * camera pauses while an import runs or another screen is on top; a bad code
 * shows its error in place of the instructions until the next scan.
 */
export function ScanJobScreen({
  route,
  navigation,
}: JobsScreenProps<'ScanJob'>) {
  const styles = useN1Styles(makeStyles);
  const camera = useCameraAccess();
  const isFocused = useIsFocused();
  const { importCode, loading, importError } = useImportJobByCode(
    route.params?.qcKind,
  );
  const [torch, , , toggleTorch] = useToggle();
  const [error, setError] = useState<string>();
  const [hasTorch, setHasTorch] = useState(false);

  const close = useCallback(() => navigation.goBack(), [navigation]);
  const enterCode = useCallback(
    () => navigation.navigate('EnterJobCode', route.params),
    [navigation, route.params],
  );
  const onScan = useCallback(
    (value: string) => setError(importCode(value)),
    [importCode],
  );
  const onCameraError = useCallback(
    () => setError(SCANNER_STRINGS.cameraFailed),
    [],
  );

  const granted = camera.status === 'granted';
  let title: string = S.frameTitle;
  let message: string = error ?? importError ?? S.message;
  if (camera.status === 'unsupported') {
    message = SCANNER_STRINGS.unsupported;
  } else if (!granted) {
    title = SCANNER_STRINGS.permissionTitle;
    message = SCANNER_STRINGS.permissionMessage;
  }

  return (
    <View style={styles.root} testID="scan-job-screen">
      <N1Header
        variant="dark"
        title={S.title}
        leftIcon="close"
        onLeftPress={close}
        right={
          granted &&
          hasTorch && (
            <N1IconButton
              icon="flash"
              size="sm"
              variant="overlay"
              accessibilityLabel={torch ? S.flashOff : S.flash}
              onPress={toggleTorch}
              testID="scan-flash"
            />
          )
        }
      />
      <N1ScanFrame
        title={title}
        message={message}
        accessory={
          (camera.status === 'prompt' || camera.status === 'denied') && (
            <N1Button
              title={
                camera.status === 'prompt'
                  ? SCANNER_STRINGS.allow
                  : SCANNER_STRINGS.openSettings
              }
              leftIcon="camera"
              variant="secondary"
              onPress={camera.request}
              testID="scan-camera-access"
            />
          )
        }
        actionLabel={S.manual}
        onActionPress={enterCode}
      >
        {granted && (
          <N1QrScanner
            active={isFocused && !loading}
            torch={torch}
            onTorchAvailable={setHasTorch}
            onScan={onScan}
            onError={onCameraError}
          />
        )}
      </N1ScanFrame>
    </View>
  );
}
