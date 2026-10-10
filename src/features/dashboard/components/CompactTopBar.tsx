import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { Platform, Pressable, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  N1Icon,
  N1Text,
  getInitials,
  useN1Styles,
  useN1Theme,
} from '../../../shared/components';
import { NAV_STRINGS } from '../../../shared/constants';
import { DASHBOARD_STRINGS as S } from '../constants';
import { makeCompactTopBarStyles } from '../styles';
import type { TopBarAction } from '../types';

type Props = {
  userName: string;
  /** Shown in place of the greeting, e.g. "My profile". */
  title?: string;
  /** Replaces the initials (and My profile) on the right, e.g. Create. */
  action?: TopBarAction;
  onMenuPress: () => void;
  onProfilePress: () => void;
};

/**
 * Phone header on every admin screen, on black: the menu and the greeting,
 * with the user's initials (opens My profile) on the right. A `title`
 * replaces the greeting.
 */
function CompactTopBar({
  userName,
  title,
  action,
  onMenuPress,
  onProfilePress,
}: Props) {
  const styles = useN1Styles(makeCompactTopBarStyles);
  const theme = useN1Theme();
  const insets = useSafeAreaInsets();

  // Light status bar text over the black while this screen is shown.
  useFocusEffect(
    useCallback(() => {
      // Web has no status bar stack.
      if (Platform.OS === 'web') {
        return undefined;
      }
      const entry = StatusBar.pushStackEntry({ barStyle: 'light-content' });
      return () => StatusBar.popStackEntry(entry);
    }, []),
  );

  return (
    <View
      style={[styles.bar, { paddingTop: insets.top + theme.spacing.md }]}
      testID="compact-top-bar"
    >
      <View style={styles.topRow}>
        <View style={styles.user}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            onPress={onMenuPress}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <N1Icon name="menu" size="md" color="textInverse" />
          </Pressable>
          <View style={styles.greeting}>
            {title ? (
              <N1Text
                variant="h3"
                color="inverse"
                numberOfLines={1}
                accessibilityRole="header"
              >
                {title}
              </N1Text>
            ) : (
              <>
                <N1Text variant="small" color="tertiary">
                  {S.greeting}
                </N1Text>
                <N1Text variant="h3" color="inverse" numberOfLines={1}>
                  {userName}
                </N1Text>
              </>
            )}
          </View>
        </View>
        {action ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={action.onPress}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
            testID={action.testID}
          >
            <N1Icon name={action.icon} size="md" color="textInverse" />
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={NAV_STRINGS.openProfile}
            onPress={onProfilePress}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
            testID="open-profile"
          >
            <N1Text variant="label" weight="bold" color="inverse">
              {getInitials(userName)}
            </N1Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default React.memo(CompactTopBar);
