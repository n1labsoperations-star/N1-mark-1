import { useCallback, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { QR_RESCAN_DELAY_MS } from '../../constants';
import type { N1QrScannerProps } from './types';
import {
  openBackCamera,
  stopStream,
  type WebStream,
  type WebTrack,
} from './webCamera';

// The project builds without the DOM typings; just what this file touches.
type Video = {
  srcObject: WebStream | null;
  readyState: number;
  videoWidth: number;
  videoHeight: number;
  play: () => Promise<void>;
};
type Canvas = {
  width: number;
  height: number;
  getContext: (
    kind: '2d',
    options: { willReadFrequently: boolean },
  ) => {
    drawImage: (video: Video, x: number, y: number, w: number, h: number) => void;
    getImageData: (
      x: number,
      y: number,
      w: number,
      h: number,
    ) => { data: Uint8ClampedArray };
  } | null;
};
type Browser = {
  document: { createElement: (tag: 'canvas') => Canvas };
  setInterval: (cb: () => void, ms: number) => number;
  clearInterval: (id: number) => void;
};
const browser = globalThis as unknown as Browser;

/** HTMLMediaElement.HAVE_CURRENT_DATA: a frame is ready to draw. */
const HAVE_CURRENT_DATA = 2;
/** Frames are read this often; jsQR on every frame drains phone batteries. */
const READ_EVERY_MS = 200;
/** Frames are scaled down to this before decoding, for speed. */
const MAX_SIDE = 640;

const VIDEO_STYLE = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
} as const;

/** The QR code's text in the video's current frame, if any. */
function readFrame(video: Video, canvas: Canvas): string | undefined {
  if (video.readyState < HAVE_CURRENT_DATA || !video.videoWidth) {
    return undefined;
  }
  const scale = Math.min(
    1,
    MAX_SIDE / Math.max(video.videoWidth, video.videoHeight),
  );
  const width = Math.round(video.videoWidth * scale);
  const height = Math.round(video.videoHeight * scale);
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return undefined;
  }
  context.drawImage(video, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);
  return (
    jsQR(data, width, height, { inversionAttempts: 'dontInvert' })?.data.trim() ||
    undefined
  );
}

/**
 * Back-camera QR reader for browsers (jsQR on the live video). Fills its
 * parent — put it inside N1ScanFrame. Only render it once camera permission
 * is granted (see useCameraAccess). The camera is off while `active` is false.
 */
export function N1QrScanner({
  active,
  torch = false,
  onTorchAvailable,
  onScan,
  onError,
}: N1QrScannerProps) {
  const video = useRef<Video | null>(null);
  const track = useRef<WebTrack | undefined>(undefined);
  const last = useRef({ value: '', at: 0 });
  const handlers = useRef({ onScan, onError, onTorchAvailable });
  handlers.current = { onScan, onError, onTorchAvailable };

  const setVideo = useCallback((node: unknown) => {
    video.current = node as Video | null;
  }, []);

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    let stream: WebStream | undefined;
    let timer: number | undefined;
    let stopped = false;
    const canvas = browser.document.createElement('canvas');

    const read = () => {
      const value = video.current && readFrame(video.current, canvas);
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
    };

    openBackCamera()
      .then(async opened => {
        stream = opened;
        if (stopped || !video.current) {
          stopStream(opened);
          return;
        }
        video.current.srcObject = opened;
        await video.current.play();
        track.current = opened.getVideoTracks()[0];
        handlers.current.onTorchAvailable?.(
          !!track.current?.getCapabilities?.().torch,
        );
        timer = browser.setInterval(read, READ_EVERY_MS);
      })
      .catch(error => {
        if (!stopped) {
          handlers.current.onError?.(
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      });

    return () => {
      stopped = true;
      if (timer !== undefined) {
        browser.clearInterval(timer);
      }
      if (stream) {
        stopStream(stream);
      }
      if (video.current) {
        video.current.srcObject = null;
      }
      track.current = undefined;
    };
  }, [active]);

  // Only phones with a flash (Chrome on Android) report a torch.
  useEffect(() => {
    if (track.current?.getCapabilities?.().torch) {
      track.current
        .applyConstraints({ advanced: [{ torch }] })
        .catch(() => undefined);
    }
  }, [torch]);

  return (
    <video
      ref={setVideo}
      style={VIDEO_STYLE}
      autoPlay
      muted
      playsInline
      data-testid="qr-camera"
    />
  );
}
