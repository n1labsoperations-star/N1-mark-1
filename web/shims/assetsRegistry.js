/**
 * react-native-svg imports this to resolve bundled images inside an SVG.
 * React Native 0.87 no longer ships @react-native/assets-registry, and on web
 * images are plain URLs, so there is never a registered asset to look up.
 *
 * @format
 */

export function getAssetByID() {
  return undefined;
}

export function registerAsset() {
  return 0;
}
