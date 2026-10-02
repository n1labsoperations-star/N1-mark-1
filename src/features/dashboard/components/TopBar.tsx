import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  N1Avatar,
  N1IconButton,
  N1Logo,
  N1Text,
  useN1Styles,
  useN1Theme,
} from '../../../shared/components';
import { NAV_STRINGS } from '../../../shared/constants';
import { ORGANIZATION_STRINGS } from '../../profile/organization';
import { CURRENT_USER } from '../constants';
import { makeTopBarStyles } from '../styles';

type Props = {
  compact: boolean;
  onMenuPress: () => void;
  /** Opens My profile from the signed-in user. */
  onProfilePress: () => void;
  /** Wide screens: the organization's name, which opens its details. */
  organizationName: string;
  onOrganizationPress: () => void;
};

/**
 * Wide screens: organization name and the signed-in user.
 * Phones: menu button, logo and the user's avatar.
 */
function TopBar({
  compact,
  onMenuPress,
  onProfilePress,
  organizationName,
  onOrganizationPress,
}: Props) {
  const styles = useN1Styles(makeTopBarStyles);
  const theme = useN1Theme();
  const insets = useSafeAreaInsets();

  if (compact) {
    return (
      <View
        style={[
          styles.bar,
          styles.compactBar,
          { paddingTop: insets.top + theme.spacing.md },
        ]}
      >
        <View style={styles.left}>
          <N1IconButton
            icon="menu"
            variant="inverse"
            size="sm"
            accessibilityLabel="Open menu"
            onPress={onMenuPress}
          />
          <N1Logo size="sm" color="inverse" />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={NAV_STRINGS.openProfile}
          onPress={onProfilePress}
          style={({ pressed }) => pressed && styles.pressed}
          testID="open-profile"
        >
          <N1Avatar name={CURRENT_USER.name} size="sm" tone="neutral" />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={ORGANIZATION_STRINGS.open(organizationName)}
        onPress={onOrganizationPress}
        style={({ pressed }) => [
          styles.organization,
          pressed && styles.pressed,
        ]}
        testID="open-organization"
      >
        <N1Text variant="h3" numberOfLines={1}>
          {organizationName}
        </N1Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={NAV_STRINGS.openProfile}
        onPress={onProfilePress}
        style={({ pressed }) => [styles.user, pressed && styles.pressed]}
        testID="open-profile"
      >
        <N1Avatar name={CURRENT_USER.name} />
        <View>
          <N1Text variant="title">{CURRENT_USER.name}</N1Text>
          <N1Text variant="small" color="secondary">
            {CURRENT_USER.email}
          </N1Text>
        </View>
      </Pressable>
    </View>
  );
}

export default React.memo(TopBar);
