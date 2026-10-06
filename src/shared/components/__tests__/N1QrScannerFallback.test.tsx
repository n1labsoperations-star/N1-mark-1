import { N1QrScanner, useCameraAccess } from '../N1QrScanner';

// An app built before the camera libraries were added has no native module,
// so requiring VisionCamera throws.
jest.mock('react-native-vision-camera', () => {
  throw new Error('NitroModules not found');
});

test('a build without the camera native code falls back instead of crashing', () => {
  expect(
    (N1QrScanner as (props: object) => unknown)({ active: true }),
  ).toBeNull();
  expect(useCameraAccess().status).toBe('unsupported');
});
