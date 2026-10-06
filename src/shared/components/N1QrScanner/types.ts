export type N1QrScannerProps = {
  /** Runs the camera; pass false when the screen is out of focus or busy. */
  active: boolean;
  /** Ignored when the camera has no flash (see onTorchAvailable). */
  torch?: boolean;
  /** Reports whether the camera has a flash, e.g. to hide a flash button. */
  onTorchAvailable?: (available: boolean) => void;
  /** Called once per newly read QR code value. */
  onScan: (value: string) => void;
  onError?: (error: Error) => void;
};

export type CameraAccess = {
  status: 'granted' | 'prompt' | 'denied' | 'unsupported';
  /** Asks for permission, or opens Settings once the user has said no. */
  request: () => void;
};
