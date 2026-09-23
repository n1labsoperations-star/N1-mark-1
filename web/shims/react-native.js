/**
 * Web entry for `react-native` imports: react-native-web plus the few
 * native-only exports that shared packages expect to exist.
 *
 * @format
 */

export * from 'react-native-web';

// Injected by webpack's DefinePlugin (see webpack.config.js).
// eslint-disable-next-line no-undef
const version = __REACT_NATIVE_VERSION__;
const [major, minor, patch] = version.split('.').map(Number);

export const ReactNativeVersion = {
  version: { major, minor, patch, prerelease: null },
  getVersionString: () => version,
};
