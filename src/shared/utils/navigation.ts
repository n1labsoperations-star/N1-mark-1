import type { NavigationProp, ParamListBase } from '@react-navigation/native';

/**
 * The app's top-level navigator, from a screen nested at any depth — e.g. to
 * leave the admin area for the login screen.
 */
export function rootNavigation(
  navigation: NavigationProp<ParamListBase>,
): NavigationProp<ParamListBase> {
  let root = navigation;
  for (let parent = root.getParent(); parent; parent = root.getParent()) {
    root = parent;
  }
  return root;
}
