/**
 * Reads a QR code from an uploaded picture. Web only (readQrImage.web.ts):
 * iOS and Android scan with the camera, so there is nothing to offer here.
 */
export const qrImageReader: (() => Promise<string | null>) | null = null;
