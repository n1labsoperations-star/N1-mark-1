// The project builds without the DOM typings; just what the web scanner uses.
export type WebTrack = {
  stop: () => void;
  getCapabilities?: () => { torch?: boolean };
  applyConstraints: (constraints: {
    advanced: { torch: boolean }[];
  }) => Promise<void>;
};
export type WebStream = { getVideoTracks: () => WebTrack[] };
type MediaDevices = {
  getUserMedia: (constraints: {
    audio: false;
    video: { facingMode: { ideal: 'environment' } };
  }) => Promise<WebStream>;
};
type Browser = {
  isSecureContext?: boolean;
  navigator?: { mediaDevices?: MediaDevices };
};
const browser = globalThis as unknown as Browser;

/**
 * The browser's camera API, or undefined without one. Browsers only expose
 * it on HTTPS pages and localhost.
 */
export const browserCamera = (): MediaDevices | undefined =>
  browser.isSecureContext !== false &&
  typeof browser.navigator?.mediaDevices?.getUserMedia === 'function'
    ? browser.navigator.mediaDevices
    : undefined;

/** The back camera on phones, any camera elsewhere; asks for permission. */
export function openBackCamera(): Promise<WebStream> {
  const camera = browserCamera();
  if (!camera) {
    return Promise.reject(new Error('No camera'));
  }
  return camera.getUserMedia({
    audio: false,
    video: { facingMode: { ideal: 'environment' } },
  });
}

/** Turns the camera off (and its in-use light). */
export function stopStream(stream: WebStream) {
  stream.getVideoTracks().forEach(track => track.stop());
}
