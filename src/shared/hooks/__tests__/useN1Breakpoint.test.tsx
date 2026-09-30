/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  lightTheme,
  useN1Breakpoint,
  type N1Breakpoint,
} from '../../components';

let mockWidth = 0;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 800, scale: 1, fontScale: 1 }),
}));

function measure(width: number): N1Breakpoint {
  mockWidth = width;
  let result: N1Breakpoint | undefined;
  function Probe() {
    result = useN1Breakpoint();
    return null;
  }
  ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<Probe />);
  });
  return result as N1Breakpoint;
}

test.each([
  [375, true, false],
  [lightTheme.breakpoints.tablet, false, false],
  [lightTheme.breakpoints.desktop, false, true],
])('width %i → compact %s, desktop %s', (width, isCompact, isDesktop) => {
  expect(measure(width)).toMatchObject({ width, isCompact, isDesktop });
});
