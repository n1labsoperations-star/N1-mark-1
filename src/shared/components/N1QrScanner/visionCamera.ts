import type * as VisionCamera from 'react-native-vision-camera';
import type * as BarcodeScanner from 'react-native-vision-camera-barcode-scanner';

export type CameraModules = {
  camera: typeof VisionCamera;
  scanner: typeof BarcodeScanner;
};

/**
 * The camera libraries, or undefined when their native code isn't in this
 * build (e.g. JS served by Metro to an app built before they were added).
 * Requiring them would otherwise throw and crash the screen; without them
 * the scanner reports 'unsupported' and users type the code instead.
 */
function load(): CameraModules | undefined {
  try {
    const camera = require('react-native-vision-camera');
    const scanner = require('react-native-vision-camera-barcode-scanner');
    return camera?.useCameraPermission && scanner?.useBarcodeScannerOutput
      ? { camera, scanner }
      : undefined;
  } catch {
    return undefined;
  }
}

export const cameraModules = load();
