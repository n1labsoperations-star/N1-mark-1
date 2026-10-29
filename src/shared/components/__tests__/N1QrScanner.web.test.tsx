import jsQR from 'jsqr';
import ReactTestRenderer from 'react-test-renderer';
import { QR_RESCAN_DELAY_MS } from '../../constants';
import type { CameraAccess, N1QrScannerProps } from '../N1QrScanner';
import { N1QrScanner } from '../N1QrScanner/N1QrScanner.web';
import { useCameraAccess } from '../N1QrScanner/useCameraAccess.web';

jest.mock('jsqr', () => jest.fn());
const mockJsQR = jsQR as unknown as jest.Mock;

const g = globalThis as unknown as {
  isSecureContext?: boolean;
  navigator?: unknown;
  document?: unknown;
};
const original = {
  isSecureContext: g.isSecureContext,
  navigator: g.navigator,
  document: g.document,
};

const track = {
  stop: jest.fn(),
  getCapabilities: jest.fn(() => ({ torch: true })),
  applyConstraints: jest.fn(() => Promise.resolve()),
};
const stream = { getVideoTracks: () => [track] };
const getUserMedia = jest.fn();
const context = {
  drawImage: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
};

/** A browser with (or without) a camera, on an HTTPS page (or not). */
function browser(camera: boolean, secure = true) {
  g.isSecureContext = secure;
  g.navigator = camera ? { mediaDevices: { getUserMedia } } : {};
  g.document = { createElement: () => ({ getContext: () => context }) };
}

const settle = () => ReactTestRenderer.act(async () => {});

beforeEach(() => {
  jest.useFakeTimers();
  getUserMedia.mockReset().mockResolvedValue(stream);
  track.stop.mockClear();
  track.applyConstraints.mockClear();
  mockJsQR.mockReset();
});

afterEach(() => {
  jest.useRealTimers();
  Object.assign(g, original);
});

async function access(camera: boolean, secure = true) {
  browser(camera, secure);
  const result: { current?: CameraAccess } = {};
  function Probe() {
    result.current = useCameraAccess();
    return null;
  }
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<Probe />);
  });
  await settle();
  return result as { current: CameraAccess };
}

describe('useCameraAccess (web)', () => {
  test('is unsupported without a camera API or outside HTTPS', async () => {
    expect((await access(false)).current.status).toBe(
      'unsupported',
    );
    expect((await access(true, false)).current.status).toBe(
      'unsupported',
    );
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  test('asks on mount, asks for the back camera and frees it again', async () => {
    const camera = await access(true);
    expect(camera.current.status).toBe('granted');
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: { facingMode: { ideal: 'environment' } },
    });
    expect(track.stop).toHaveBeenCalled();
  });

  test('a refusal is denied until a retry succeeds', async () => {
    getUserMedia.mockRejectedValueOnce({ name: 'NotAllowedError' });
    const camera = await access(true);
    expect(camera.current.status).toBe('denied');

    await ReactTestRenderer.act(() => camera.current.request());
    await settle();
    expect(camera.current.status).toBe('granted');
  });

  test('no camera on the device is unsupported', async () => {
    getUserMedia.mockRejectedValueOnce({ name: 'NotFoundError' });
    expect((await access(true)).current.status).toBe(
      'unsupported',
    );
  });
});

describe('N1QrScanner (web)', () => {
  const video = {
    srcObject: null as unknown,
    readyState: 4,
    videoWidth: 1280,
    videoHeight: 720,
    play: jest.fn(() => Promise.resolve()),
  };

  async function mount(props: Partial<N1QrScannerProps> = {}) {
    browser(true);
    const onScan = jest.fn();
    const all = { active: true, onScan, ...props };
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<N1QrScanner {...all} />, {
        createNodeMock: () => video,
      });
    });
    await settle();
    const update = (next: Partial<N1QrScannerProps>) =>
      ReactTestRenderer.act(() =>
        renderer.update(<N1QrScanner {...all} {...next} />),
      );
    const tick = (ms: number) =>
      ReactTestRenderer.act(() => {
        jest.advanceTimersByTime(ms);
      });
    return { renderer, onScan, update, tick };
  }

  test('shows the camera and reports each code once per rescan window', async () => {
    const { renderer, onScan, tick } = await mount();
    expect(renderer.root.findByProps({ 'data-testid': 'qr-camera' })).toBe(
      renderer.root.findByType('video' as never),
    );
    expect(video.srcObject).toBe(stream);
    expect(video.play).toHaveBeenCalled();

    await tick(200);
    expect(onScan).not.toHaveBeenCalled();

    mockJsQR.mockReturnValue({ data: ' WO-1 ' });
    await tick(200);
    await tick(200);
    expect(onScan.mock.calls).toEqual([['WO-1']]);
    // Frames are scaled down before decoding.
    expect(context.drawImage).toHaveBeenLastCalledWith(video, 0, 0, 640, 360);

    // Held in view it stays reported once; shown again after a gap, it counts.
    await tick(QR_RESCAN_DELAY_MS);
    expect(onScan).toHaveBeenCalledTimes(1);
    mockJsQR.mockReturnValue(null);
    await tick(QR_RESCAN_DELAY_MS);
    mockJsQR.mockReturnValue({ data: 'WO-1' });
    await tick(200);
    expect(onScan).toHaveBeenCalledTimes(2);
  });

  test('skips frames that are not ready yet', async () => {
    mockJsQR.mockReturnValue({ data: 'WO-1' });
    video.readyState = 1;
    const { onScan, tick } = await mount();
    await tick(200);
    expect(onScan).not.toHaveBeenCalled();
    video.readyState = 4;
  });

  test('turns the camera off when inactive and on again when active', async () => {
    const { update } = await mount();
    expect(track.stop).not.toHaveBeenCalled();

    await update({ active: false });
    expect(track.stop).toHaveBeenCalled();
    expect(video.srcObject).toBeNull();

    await update({ active: true });
    await settle();
    expect(getUserMedia).toHaveBeenCalledTimes(2);
    expect(video.srcObject).toBe(stream);
  });

  test('reports the flash and switches it', async () => {
    const onTorchAvailable = jest.fn();
    const { update } = await mount({ onTorchAvailable });
    expect(onTorchAvailable).toHaveBeenCalledWith(true);

    await update({ torch: true });
    expect(track.applyConstraints).toHaveBeenCalledWith({
      advanced: [{ torch: true }],
    });
  });

  test('forwards a camera that fails to start', async () => {
    getUserMedia.mockRejectedValueOnce(new Error('in use'));
    const onError = jest.fn();
    await mount({ onError });
    expect(onError).toHaveBeenCalledWith(new Error('in use'));
  });
});
