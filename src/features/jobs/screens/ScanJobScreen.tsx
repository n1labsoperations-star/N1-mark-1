import { useCallback, useState, type ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
  N1Button,
  N1Header,
  N1IconButton,
  N1QrScanner,
  N1ScanFrame,
  type N1ScanState,
  createN1Styles,
  useCameraAccess,
  useN1Styles,
} from '../../../shared/components';
import {
  SCANNER_STRINGS,
  SCAN_SUCCESS_DELAY_MS,
} from '../../../shared/constants';
import { useToggle } from '../../../shared/hooks';
import { qrImageReader } from '../../../services/files/readQrImage';
import { JOBS_STRINGS } from '../constants';
import { useImportJobByCode } from '../hooks/useImportJobByCode';
import type { JobsScreenProps } from '../types';

const S = JOBS_STRINGS.scan;
const IS_WEB = Platform.OS === 'web';

const makeStyles = createN1Styles(t => ({
  root: { flex: 1, backgroundColor: t.colors.scannerBackground },
}));

/**
 * Scans a job's QR code and imports it the same way as a typed code. The
 * frame shows a spinner while the code is looked up, then a tick before the
 * job opens, or a cross with the reason and Scan again. The camera pauses
 * until then, and while another screen is on top.
 */
export function ScanJobScreen({
  route,
  navigation,
}: JobsScreenProps<'ScanJob'>) {
  const styles = useN1Styles(makeStyles);
  const camera = useCameraAccess();
  const isFocused = useIsFocused();
  const { importCode, loading, importError, confirming, foundLabel } =
    useImportJobByCode(route.params?.qcKind, SCAN_SUCCESS_DELAY_MS);
  const [torch, , , toggleTorch] = useToggle();
  const [error, setError] = useState<string>();
  // Only this visit's scans show a lookup error, not one from Enter code.
  const [scanned, setScanned] = useState(false);
  const [cameraFailed, setCameraFailed] = useState(false);
  // A new key remounts the camera to try it again.
  const [cameraKey, setCameraKey] = useState(0);
  const [hasTorch, setHasTorch] = useState(false);

  const close = useCallback(() => navigation.goBack(), [navigation]);
  const enterCode = useCallback(
    () => navigation.navigate('EnterJobCode', route.params),
    [navigation, route.params],
  );
  const onScan = useCallback(
    (value: string) => {
      setError(importCode(value));
      setScanned(true);
    },
    [importCode],
  );
  // Web: reads the QR code in a picked image, then imports it like a scan.
  const uploadImage = useCallback(async () => {
    const value = await qrImageReader?.();
    if (value === null || value === undefined) {
      return;
    }
    setScanned(true);
    setError(value ? importCode(value) : S.noQr);
  }, [importCode]);
  const scanAgain = useCallback(() => {
    setError(undefined);
    setScanned(false);
  }, []);
  const onCameraError = useCallback(() => setCameraFailed(true), []);
  const retryCamera = useCallback(() => {
    setCameraFailed(false);
    setCameraKey(k => k + 1);
  }, []);

  const granted = camera.status === 'granted';
  const failure = error ?? (scanned ? importError : null);
  let state: N1ScanState = 'scanning';
  let title: string = S.frameTitle;
  let message: string | undefined = S.message;
  let retry: { title: string; onPress: () => void } | undefined;
  // A browser without a usable camera (or not on HTTPS) gets an image upload
  // instead; a picked image goes through the same lookup.
  const unsupported = camera.status === 'unsupported';
  const canUpload = unsupported && !!qrImageReader;
  if (!unsupported && !granted) {
    title = SCANNER_STRINGS.permissionTitle;
    // Browsers have no Settings to open; the site settings unblock the camera.
    message =
      IS_WEB && camera.status === 'denied'
        ? SCANNER_STRINGS.browserDenied
        : SCANNER_STRINGS.permissionMessage;
  } else if (cameraFailed) {
    state = 'error';
    title = SCANNER_STRINGS.cameraFailedTitle;
    message = SCANNER_STRINGS.cameraFailed;
    retry = { title: SCANNER_STRINGS.retry, onPress: retryCamera };
  } else if (loading) {
    state = 'checking';
    title = S.checking;
    message = undefined;
  } else if (confirming) {
    state = 'success';
    title = S.found;
    message = foundLabel && S.opening(foundLabel);
  } else if (failure) {
    state = 'error';
    title = S.failed;
    message = failure;
    retry = canUpload
      ? { title: S.uploadAgain, onPress: uploadImage }
      : { title: S.again, onPress: scanAgain };
  } else if (canUpload) {
    title = S.uploadTitle;
    message = S.uploadMessage;
  } else if (unsupported) {
    message = SCANNER_STRINGS.unsupported;
  }

  let accessory: ReactNode = null;
  if (camera.status === 'prompt' || camera.status === 'denied') {
    accessory = (
      <N1Button
        title={
          camera.status === 'prompt'
            ? SCANNER_STRINGS.allow
            : IS_WEB
            ? SCANNER_STRINGS.retry
            : SCANNER_STRINGS.openSettings
        }
        leftIcon="camera"
        variant="secondary"
        onPress={camera.request}
        testID="scan-camera-access"
      />
    );
  } else if (retry) {
    accessory = (
      <N1Button
        title={retry.title}
        leftIcon={canUpload ? 'upload' : 'refresh'}
        onPress={retry.onPress}
        testID="scan-retry"
      />
    );
  } else if (canUpload && state === 'scanning') {
    accessory = (
      <N1Button
        title={S.upload}
        leftIcon="upload"
        variant="secondary"
        onPress={uploadImage}
        testID="scan-upload"
      />
    );
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
        state={state}
        title={title}
        message={message}
        accessory={accessory}
        actionLabel={S.manual}
        onActionPress={enterCode}
      >
        {granted && (
          <N1QrScanner
            key={cameraKey}
            active={isFocused && state === 'scanning'}
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
