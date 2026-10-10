import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import type { AdminDrawerExtraOptions, TopBarAction } from '../types';

/**
 * Phones: shows `action` in the top bar in place of the user's initials while
 * the calling screen is mounted. Call it from a screen inside an admin
 * module's stack; the top bar belongs to the drawer above it.
 */
export function useTopBarAction(action: TopBarAction | undefined) {
  const navigation = useNavigation();
  useEffect(() => {
    const drawer = navigation.getParent();
    if (!drawer) {
      return undefined;
    }
    const set = (topBarAction: TopBarAction | undefined) =>
      drawer.setOptions({ topBarAction } as AdminDrawerExtraOptions);
    set(action);
    return () => set(undefined);
  }, [navigation, action]);
}
