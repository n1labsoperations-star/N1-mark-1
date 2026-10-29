import { useCallback, useEffect, useState } from 'react';
import type { CameraAccess } from './types';
import { UNSUPPORTED_CAMERA } from './unsupported';
import { browserCamera, openBackCamera, stopStream } from './webCamera';

type Status = CameraAccess['status'];

/** 'denied' or 'unsupported' for a failed request, by the browser's reason. */
const failureStatus = (error: unknown): Status =>
  (error as { name?: string })?.name === 'NotAllowedError'
    ? 'denied'
    : 'unsupported';

/**
 * Camera permission for the web QR scanner. Asks once on mount, like the app.
 * 'unsupported' without a camera or outside HTTPS (browsers only allow the
 * camera on secure pages), so screens offer an image upload or typed code.
 * After a refusal only the browser's site settings can allow it again;
 * `request` tries once more in case the user has.
 */
export function useCameraAccess(): CameraAccess {
  const [supported] = useState(() => !!browserCamera());
  const [status, setStatus] = useState<Status>('prompt');

  const request = useCallback(() => {
    openBackCamera()
      .then(stream => {
        stopStream(stream);
        setStatus('granted');
      })
      .catch(error => setStatus(failureStatus(error)));
  }, []);

  useEffect(() => {
    if (supported) {
      request();
    }
  }, [supported, request]);

  return supported ? { status, request } : UNSUPPORTED_CAMERA;
}
