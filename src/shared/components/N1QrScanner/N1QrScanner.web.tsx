import type { N1QrScannerProps } from './types';

/** No camera scanner on web; useCameraAccess reports 'unsupported'. */
export function N1QrScanner(_props: N1QrScannerProps) {
  return null;
}
