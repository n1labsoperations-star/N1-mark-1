import type { CameraAccess } from './types';

/** Access for builds without a camera scanner; screens fall back to typed codes. */
export const UNSUPPORTED_CAMERA: CameraAccess = {
  status: 'unsupported',
  request: () => {},
};

export const useUnsupportedCamera = (): CameraAccess => UNSUPPORTED_CAMERA;
