import { useUnsupportedCamera } from './unsupported';

/** The web build has no camera scanner; screens fall back to typed codes. */
export const useCameraAccess = useUnsupportedCamera;
