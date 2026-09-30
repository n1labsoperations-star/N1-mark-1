import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  N1Avatar,
  N1IconButton,
  N1Logo,
  N1Text,
  useN1Styles,
  useN1Theme,
} from '../../../shared/components';
import { CURRENT_USER, ORGANIZATION } from '../constants';
import { makeTopBarStyles } from '../styles';

type Props = {
  compact: boolean;
  onMenuPress: () => void;
};

/**
 * Wide screens: organization name and the signed-in user.
 * Phones: menu button, logo and the user's avatar.
 */
function TopBar({ compact, onMenuPress }: Props) {
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
        <N1Avatar name={CURRENT_USER.name} size="sm" tone="neutral" />
      </View>
    );
  }

  return (
    <View style={styles.bar}>
      <N1Text variant="h3" numberOfLines={1}>
        {ORGANIZATION.name}
      </N1Text>
      <View style={styles.user}>
        <N1Avatar name={CURRENT_USER.name} />
        <View>
          <N1Text variant="title">{CURRENT_USER.name}</N1Text>
          <N1Text variant="small" color="secondary">
            {CURRENT_USER.email}
          </N1Text>
        </View>
      </View>
    </View>
  );
}

export default React.memo(TopBar);
