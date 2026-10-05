import React, { useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet } from 'react-native';
import type {
  Barcode,
  TargetBarcodeFormat,
} from 'react-native-vision-camera-barcode-scanner';
import { QR_RESCAN_DELAY_MS } from '../../constants';
import type { N1QrScannerProps } from './types';
import { cameraModules, type CameraModules } from './visionCamera';

// Module-level so the scanner output (memoised on its formats) is built once.
const FORMATS: TargetBarcodeFormat[] = ['qr-code'];

// iOS can report 'unknown' at launch, so only 'background' stops the camera.
const isForeground = (state?: string | null) => state !== 'background';

function useAppActive() {
  const [active, setActive] = useState(isForeground(AppState.currentState));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state =>
      setActive(isForeground(state)),
    );
    return () => subscription.remove();
  }, []);
  return active;
}

function createScanner({ camera, scanner }: CameraModules) {
  const { Camera, useCameraDevice } = camera;
  const { useBarcodeScannerOutput } = scanner;
  return React.memo(function N1QrScannerComponent({
    active,
    torch = false,
    onTorchAvailable,
    onScan,
    onError,
  }: N1QrScannerProps) {
    const device = useCameraDevice('back');
    const hasTorch = device?.hasTorch ?? false;
    useEffect(() => {
      onTorchAvailable?.(hasTorch);
    }, [hasTorch, onTorchAvailable]);
    const appActive = useAppActive();
    const last = useRef({ value: '', at: 0 });
    const handlers = useRef({ onScan, onError });
    handlers.current = { onScan, onError };

    const output = useBarcodeScannerOutput({
      barcodeFormats: FORMATS,
      onBarcodeScanned: (barcodes: Barcode[]) => {
        const value = barcodes.find(b => b.rawValue)?.rawValue;
        if (!value) {
          return;
        }
        // The same code stays in view for many frames; report it once.
        const now = Date.now();
        const repeat =
          value === last.current.value &&
          now - last.current.at < QR_RESCAN_DELAY_MS;
        last.current = { value, at: now };
        if (!repeat) {
          handlers.current.onScan(value);
        }
      },
      onError: error => handlers.current.onError?.(error),
    });

    if (!device) {
      return null;
    }
    return (
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={active && appActive}
        outputs={[output]}
        // Any torchMode, even 'off', throws on a camera without a flash.
        torchMode={hasTorch ? (torch ? 'on' : 'off') : undefined}
        onError={onError}
      />
    );
  });
}

/** Builds without the camera native code show no camera (see visionCamera). */
function NoCamera(_props: N1QrScannerProps) {
  return null;
}

/**
 * Back-camera QR reader (ML Kit on Android and iOS). Fills its parent — put
 * it inside N1ScanFrame. Only render it once camera permission is granted
 * (see useCameraAccess). The camera stops while the app is in the background.
 */
export const N1QrScanner = cameraModules
  ? createScanner(cameraModules)
  : NoCamera;
