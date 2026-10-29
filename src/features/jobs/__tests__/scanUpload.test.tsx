import ReactTestRenderer from 'react-test-renderer';
import {
  allText,
  byTestId,
  byText,
  flush,
  hasTestId,
  press,
  renderAppAs,
} from '../../../shared/testing/testUtils';
import { SCAN_SUCCESS_DELAY_MS } from '../../../shared/constants';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, scale: 1, fontScale: 1 }),
}));

// The web build: no camera scanner, and a picked image is read for its QR code.
jest.mock('../../../shared/components/N1QrScanner/useCameraAccess', () =>
  jest.requireActual(
    '../../../shared/components/N1QrScanner/useCameraAccess.web',
  ),
);
const mockReader = jest.fn<Promise<string | null>, []>();
jest.mock('../../../services/files/readQrImage', () => ({
  qrImageReader: () => mockReader(),
}));

let app: ReactTestRenderer.ReactTestRenderer | undefined;

afterEach(async () => {
  await ReactTestRenderer.act(() => app?.unmount());
  app = undefined;
  mockReader.mockReset();
});

async function openScan() {
  app = await renderAppAs('operator@n1.com', 'Operator@123');
  await press(byTestId(app.root, 'import-job'));
  return app.root;
}

/**
 * Upload QR image (or Try another image): the picked image's code reaches the
 * lookup inside act, so the screen shows Checking before the result.
 */
async function upload(
  root: ReactTestRenderer.ReactTestInstance,
  label?: string,
) {
  let button: ReactTestRenderer.ReactTestInstance | null = label
    ? byText(root, label)
    : byTestId(root, 'scan-upload');
  while (button && typeof button.props.onPress !== 'function') {
    button = button.parent;
  }
  // Pressed directly, not with press(): its own act would overlap this one.
  const onPress = button?.props.onPress;
  await ReactTestRenderer.act(async () => {
    onPress();
    // The reader's promise settles in a few microtasks.
    for (let i = 0; i < 5; i += 1) {
      await Promise.resolve();
    }
  });
  await flush();
}

test('web offers Upload QR image in place of the camera', async () => {
  const root = await openScan();
  expect(hasTestId(root, 'qr-camera')).toBe(false);
  const text = allText(root);
  expect(text).toContain('Upload the QR code');
  expect(text).toContain("A photo or screenshot of the job's QR code works.");
  expect(text).toContain('Enter code manually');
});

test("an uploaded image's code is looked up like a scan", async () => {
  const root = await openScan();
  mockReader.mockResolvedValue('WO-01042');
  await upload(root);
  expect(mockReader).toHaveBeenCalledTimes(1);
  expect(hasTestId(root, 'scan-success')).toBe(true);
  expect(allText(root)).toContain('QR code scanned');

  // Then the operator's job opens.
  await ReactTestRenderer.act(
    () => new Promise(resolve => setTimeout(resolve, SCAN_SUCCESS_DELAY_MS)),
  );
  await flush();
  expect(hasTestId(root, 'operator-job-screen')).toBe(true);
});

test('an image without a QR code says so and offers another image', async () => {
  const root = await openScan();
  mockReader.mockResolvedValue('');
  await upload(root);
  expect(hasTestId(root, 'scan-error')).toBe(true);
  expect(allText(root)).toContain(
    'No QR code found in that image. Try a clearer picture.',
  );

  mockReader.mockResolvedValue(null);
  await upload(root, 'Try another image');
  expect(mockReader).toHaveBeenCalledTimes(2);
  // Closing the chooser leaves the screen as it was.
  expect(hasTestId(root, 'scan-error')).toBe(true);
});

test('closing the chooser without a choice changes nothing', async () => {
  const root = await openScan();
  mockReader.mockResolvedValue(null);
  await upload(root);
  expect(hasTestId(root, 'scan-error')).toBe(false);
  expect(hasTestId(root, 'scan-upload')).toBe(true);
});
