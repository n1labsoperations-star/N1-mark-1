/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

// The native drawer views depend on Reanimated, whose native module is
// unavailable under Jest. Use their plain-JS (web) implementations instead.
// The web drawer listens for DOM transition events on its View, which the test
// renderer can't provide, so use the same layout without those listeners.
jest.mock(
  './node_modules/react-native-drawer-layout/lib/module/views/Drawer',
  () => {
    const React = require('react');
    const { View } = require('react-native');
    const {
      DrawerProgressContext,
    } = require('./node_modules/react-native-drawer-layout/lib/module/utils/DrawerProgressContext.js');
    function Drawer({
      drawerType = 'front',
      drawerStyle,
      open,
      renderDrawerContent,
      children,
      style,
    }) {
      const visible = drawerType === 'permanent' || open;
      return React.createElement(
        DrawerProgressContext.Provider,
        { value: { value: visible ? 1 : 0 } },
        React.createElement(
          View,
          { style: [{ flex: 1, flexDirection: 'row' }, style] },
          React.createElement(
            View,
            { style: drawerStyle, 'aria-hidden': !visible },
            renderDrawerContent(),
          ),
          React.createElement(View, { style: { flex: 1 } }, children),
        ),
      );
    }
    return { Drawer };
  },
);
jest.mock(
  './node_modules/react-native-drawer-layout/lib/module/views/Overlay',
  () =>
    jest.requireActual(
      './node_modules/react-native-drawer-layout/lib/module/views/Overlay.js',
    ),
);
