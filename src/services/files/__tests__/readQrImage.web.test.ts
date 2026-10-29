import jsQR from 'jsqr';
import { decodeQrFile, qrImageReader } from '../readQrImage.web';

jest.mock('jsqr', () => jest.fn());
const mockJsQR = jsQR as unknown as jest.Mock;

type Listener = () => void;
type FakeImage = {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  onload: Listener | null;
  onerror: Listener | null;
};

const g = globalThis as unknown as {
  document?: unknown;
  Image?: unknown;
  URL: { createObjectURL?: unknown; revokeObjectURL?: unknown };
};
const original = {
  document: g.document,
  Image: g.Image,
  createObjectURL: g.URL.createObjectURL,
  revokeObjectURL: g.URL.revokeObjectURL,
};

let input: {
  type: string;
  accept: string;
  files: { name: string; size: number; type: string }[] | null;
  listeners: Record<string, Listener>;
  addEventListener: (event: string, cb: Listener) => void;
  click: jest.Mock;
};
let canvas: { width: number; height: number; getContext: jest.Mock };
let drawImage: jest.Mock;
let imageSize = { width: 3200, height: 1600 };
let imageLoads = true;

beforeEach(() => {
  mockJsQR.mockReset();
  imageSize = { width: 3200, height: 1600 };
  imageLoads = true;
  input = {
    type: '',
    accept: '',
    files: null,
    listeners: {},
    addEventListener(event, cb) {
      this.listeners[event] = cb;
    },
    click: jest.fn(),
  };
  drawImage = jest.fn();
  canvas = {
    width: 0,
    height: 0,
    getContext: jest.fn(() => ({
      drawImage,
      getImageData: (_x: number, _y: number, w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4),
      }),
    })),
  };
  g.document = {
    createElement: (tag: string) => (tag === 'canvas' ? canvas : input),
  };
  g.Image = class {
    onload: Listener | null = null;
    onerror: Listener | null = null;
    naturalWidth = imageSize.width;
    naturalHeight = imageSize.height;
    set src(_url: string) {
      setTimeout(() => (imageLoads ? this.onload?.() : this.onerror?.()));
    }
  } as unknown as new () => FakeImage;
  g.URL.createObjectURL = jest.fn(() => 'blob:qr');
  g.URL.revokeObjectURL = jest.fn();
});

afterEach(() => {
  g.document = original.document;
  g.Image = original.Image;
  g.URL.createObjectURL = original.createObjectURL;
  g.URL.revokeObjectURL = original.revokeObjectURL;
});

const photo = { name: 'qr.png', size: 1024, type: 'image/png' };

test('reads the QR code in the picked image, scaled down for speed', async () => {
  mockJsQR.mockReturnValue({ data: ' WO-01042 ' });
  const read = qrImageReader!();
  expect(input.click).toHaveBeenCalled();
  expect(input).toMatchObject({ type: 'file', accept: 'image/*' });

  input.files = [photo];
  input.listeners.change();
  expect(await read).toBe('WO-01042');
  // 3200 × 1600 → 1600 × 800.
  expect(canvas).toMatchObject({ width: 1600, height: 800 });
  expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1600, 800);
  expect(mockJsQR).toHaveBeenCalledWith(
    expect.any(Uint8ClampedArray),
    1600,
    800,
  );
  expect(g.URL.revokeObjectURL).toHaveBeenCalledWith('blob:qr');
});

test("'' when the image has no readable QR code", async () => {
  mockJsQR.mockReturnValue(null);
  expect(await decodeQrFile(photo)).toBe('');
});

test("'' when the file isn't an image", async () => {
  imageLoads = false;
  expect(await decodeQrFile(photo)).toBe('');
  expect(mockJsQR).not.toHaveBeenCalled();
});

test('null when the chooser is closed', async () => {
  const read = qrImageReader!();
  input.listeners.cancel();
  expect(await read).toBeNull();
});
