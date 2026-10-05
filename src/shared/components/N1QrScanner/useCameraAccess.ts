import { useCallback, useEffect } from 'react';
import { Linking } from 'react-native';
import type { CameraAccess } from './types';
import { useUnsupportedCamera } from './unsupported';
import { cameraModules, type CameraModules } from './visionCamera';

function createUseCameraAccess({ camera }: CameraModules) {
  const { useCameraPermission } = camera;
  return function useCameraAccess(): CameraAccess {
    const { hasPermission, canRequestPermission, requestPermission } =
      useCameraPermission();

    useEffect(() => {
      if (canRequestPermission) {
        requestPermission();
      }
    }, [canRequestPermission, requestPermission]);

    const request = useCallback(() => {
      if (canRequestPermission) {
        requestPermission();
      } else {
        Linking.openSettings();
      }
    }, [canRequestPermission, requestPermission]);

    const status = hasPermission
      ? 'granted'
      : canRequestPermission
      ? 'prompt'
      : 'denied';
    return { status, request };
  };
}

/**
 * Camera permission for the QR scanner. Asks once on mount; after a refusal
 * the system won't ask again, so `request` sends the user to Settings.
 * 'unsupported' when this build has no camera native code.
 */
export const useCameraAccess = cameraModules
  ? createUseCameraAccess(cameraModules)
  : useUnsupportedCamera;
