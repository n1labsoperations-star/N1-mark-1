import { AppState, Linking } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { QR_RESCAN_DELAY_MS } from '../../constants';
import {
  N1QrScanner,
  useCameraAccess,
  type CameraAccess,
} from '../N1QrScanner';
import { N1QrScanner as WebScanner } from '../N1QrScanner/N1QrScanner.web';
import { useCameraAccess as useWebCameraAccess } from '../N1QrScanner/useCameraAccess.web';

async function mount(onScan: (value: string) => void) {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<N1QrScanner active onScan={onScan} />);
  });
  const camera = renderer.root.findByProps({ testID: 'qr-camera' });
  const read = (...values: (string | undefined)[]) =>
    ReactTestRenderer.act(() =>
      camera.props.outputs[0].onBarcodeScanned(
        values.map(rawValue => ({ rawValue })),
      ),
    );
  return { renderer, read };
}

test('reports each code once until the rescan window passes', async () => {
  const now = jest.spyOn(Date, 'now').mockReturnValue(0);
  const onScan = jest.fn();
  const { renderer, read } = await mount(onScan);

  await read();
  await read(undefined, 'WO-1');
  await read('WO-1');
  expect(onScan.mock.calls).toEqual([['WO-1']]);

  // Held in view, a code is reported once however long it stays.
  await read('WO-2');
  now.mockReturnValue(QR_RESCAN_DELAY_MS - 1);
  await read('WO-2');
  now.mockReturnValue(2 * QR_RESCAN_DELAY_MS - 2);
  await read('WO-2');
  expect(onScan.mock.calls).toEqual([['WO-1'], ['WO-2']]);

  // Out of view for the whole window, it counts as a new scan.
  now.mockReturnValue(3 * QR_RESCAN_DELAY_MS);
  await read('WO-2');
  expect(onScan.mock.calls).toEqual([['WO-1'], ['WO-2'], ['WO-2']]);

  now.mockRestore();
  await ReactTestRenderer.act(() => renderer.unmount());
});

test('web has no camera: nothing renders and access is unsupported', () => {
  expect(WebScanner({ active: true, onScan: jest.fn() })).toBeNull();
  const access = useWebCameraAccess();
  expect(access.status).toBe('unsupported');
  expect(access.request()).toBeUndefined();
});

test('stops the camera in the background and forwards scanner errors', async () => {
  const onError = jest.fn();
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <N1QrScanner active onScan={jest.fn()} onError={onError} />,
    );
  });
  const camera = () => renderer.root.findByProps({ testID: 'qr-camera' });
  expect(camera().props.isActive).toBe(true);

  // The preset mocks AppState; the scanner's listener is the latest one.
  const onChange = jest.mocked(AppState.addEventListener).mock.calls.at(-1)![1];
  await ReactTestRenderer.act(() => onChange('background'));
  expect(camera().props.isActive).toBe(false);

  const error = new Error('scanner');
  camera().props.outputs[0].onError(error);
  expect(onError).toHaveBeenCalledWith(error);

  await ReactTestRenderer.act(() => renderer.unmount());
});

test('renders nothing until a back camera is available', async () => {
  const { __device } = jest.requireMock('react-native-vision-camera');
  const backCamera = __device.current;
  __device.current = undefined;
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <N1QrScanner active onScan={jest.fn()} />,
    );
  });
  expect(renderer.toJSON()).toBeNull();
  __device.current = backCamera;
  await ReactTestRenderer.act(() => renderer.unmount());
});

describe('useCameraAccess', () => {
  const permission = jest.requireMock('react-native-vision-camera')
    .__permission as { status: string; request: () => Promise<boolean> };
  afterEach(() => {
    permission.status = 'authorized';
  });

  async function access() {
    const result: { current?: CameraAccess } = {};
    function Probe() {
      result.current = useCameraAccess();
      return null;
    }
    await ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<Probe />);
    });
    return result.current!;
  }

  test('asks on mount, and asks again from the button', async () => {
    permission.status = 'not-determined';
    const ask = jest.mocked(permission.request);
    ask.mockClear();
    const result = await access();
    expect(result.status).toBe('prompt');
    expect(ask).toHaveBeenCalledTimes(1);
    result.request();
    expect(ask).toHaveBeenCalledTimes(2);
  });

  test('after a refusal, the button opens Settings', async () => {
    permission.status = 'denied';
    const openSettings = jest
      .spyOn(Linking, 'openSettings')
      .mockResolvedValue(undefined);
    const result = await access();
    expect(result.status).toBe('denied');
    result.request();
    expect(openSettings).toHaveBeenCalled();
    openSettings.mockRestore();
  });
});

test('a camera without a flash gets no torchMode, which would throw', async () => {
  const { __device } = jest.requireMock('react-native-vision-camera');
  const backCamera = __device.current;
  __device.current = { id: 'back', hasTorch: false };
  const onTorchAvailable = jest.fn();
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <N1QrScanner
        active
        torch
        onScan={jest.fn()}
        onTorchAvailable={onTorchAvailable}
      />,
    );
  });
  const camera = renderer.root.findByProps({ testID: 'qr-camera' });
  expect(camera.props.torchMode).toBeUndefined();
  expect(onTorchAvailable).toHaveBeenLastCalledWith(false);
  __device.current = backCamera;
  await ReactTestRenderer.act(() => renderer.unmount());
});
