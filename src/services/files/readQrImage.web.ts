import jsQR from 'jsqr';

// The project builds without the DOM typings; just what this file touches.
type PickedFile = { name: string; size: number; type: string };
type FileInput = {
  type: string;
  accept: string;
  files: ArrayLike<PickedFile> | null;
  addEventListener: (event: 'change' | 'cancel', cb: () => void) => void;
  click: () => void;
};
type LoadedImage = {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  onload: (() => void) | null;
  onerror: (() => void) | null;
};
type Canvas = {
  width: number;
  height: number;
  getContext: (kind: '2d') => {
    drawImage: (
      image: LoadedImage,
      x: number,
      y: number,
      w: number,
      h: number,
    ) => void;
    getImageData: (
      x: number,
      y: number,
      w: number,
      h: number,
    ) => {
      data: Uint8ClampedArray;
    };
  } | null;
};
type Browser = {
  document: {
    createElement: ((tag: 'input') => FileInput) & ((tag: 'canvas') => Canvas);
  };
  Image: new () => LoadedImage;
  URL: {
    createObjectURL: (file: PickedFile) => string;
    revokeObjectURL: (url: string) => void;
  };
};
const browser = globalThis as unknown as Browser;

/** Phone photos are scaled down to this before decoding, for speed. */
const MAX_SIDE = 1600;

const loadImage = (file: PickedFile) =>
  new Promise<LoadedImage>((resolve, reject) => {
    const url = browser.URL.createObjectURL(file);
    const image = new browser.Image();
    image.onload = () => {
      browser.URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      browser.URL.revokeObjectURL(url);
      reject(new Error('Not an image'));
    };
    image.src = url;
  });

/** The QR code's text in an image file, or '' when none can be read. */
export async function decodeQrFile(file: PickedFile): Promise<string> {
  const image = await loadImage(file).catch(() => null);
  if (!image?.naturalWidth || !image.naturalHeight) {
    return '';
  }
  const scale = Math.min(
    1,
    MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);
  const canvas = browser.document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    return '';
  }
  context.drawImage(image, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);
  return jsQR(data, width, height)?.data.trim() ?? '';
}

/**
 * Opens the browser's file chooser for a picture of a QR code and reads it.
 * Resolves the code's text, '' when the picture has no readable QR code, or
 * null when the chooser is closed without a choice.
 */
function readQrImage(): Promise<string | null> {
  return new Promise(resolve => {
    const input = browser.document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('cancel', () => resolve(null));
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      resolve(file ? decodeQrFile(file) : null);
    });
    input.click();
  });
}

/** Web only: native builds scan with the camera instead. */
export const qrImageReader: (() => Promise<string | null>) | null = readQrImage;
