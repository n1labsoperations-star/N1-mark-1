/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

// The native drawer views depend on Reanimated, whose native module is
// unavailable under Jest. Use their plain-JS (web) implementations instead.
jest.mock(
  './node_modules/react-native-drawer-layout/lib/module/views/Drawer',
  () =>
    jest.requireActual(
      './node_modules/react-native-drawer-layout/lib/module/views/Drawer.js',
    ),
);
jest.mock(
  './node_modules/react-native-drawer-layout/lib/module/views/Overlay',
  () =>
    jest.requireActual(
      './node_modules/react-native-drawer-layout/lib/module/views/Overlay.js',
    ),
);
