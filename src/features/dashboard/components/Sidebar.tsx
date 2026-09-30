import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  N1Avatar,
  N1IconButton,
  N1Logo,
  N1Text,
  useN1Styles,
  useN1Theme,
} from '../../../shared/components';
import { CURRENT_USER, MENU_ITEMS, ORGANIZATION } from '../constants';
import { makeSidebarStyles } from '../styles';
import type { MenuItem } from '../types';
import { visibleMenuItems } from '../utils';
import SidebarItem from './SidebarItem';
import SidebarSearch from './SidebarSearch';

type Props = DrawerContentComponentProps & {
  /** Phone drawer: close button, shorter menu and the user card. */
  compact: boolean;
  /** Wide screens only: icon-only rail. */
  collapsed: boolean;
  onToggleCollapse: () => void;
};

function Sidebar({
  state,
  navigation,
  compact,
  collapsed,
  onToggleCollapse,
}: Props) {
  const styles = useN1Styles(makeSidebarStyles);
  const theme = useN1Theme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const activeRoute = state.routes[state.index]?.name;
  const items = visibleMenuItems(MENU_ITEMS, { compact, query });

  const handlePress = (item: MenuItem) => {
    navigation.navigate(item.route);
    if (compact) {
      navigation.closeDrawer();
    }
  };

  return (
    <View
      style={[
        styles.root,
        collapsed && styles.rootCollapsed,
        // Safe-area insets add to the normal padding (they are 0 on web).
        {
          paddingTop: insets.top + theme.spacing.xl,
          paddingBottom: insets.bottom + theme.spacing.xl,
        },
      ]}
    >
      <View style={[styles.header, collapsed && styles.headerCollapsed]}>
        {collapsed ? null : <N1Logo size="sm" color="inverse" />}
        {compact ? (
          <N1IconButton
            icon="close"
            variant="inverse"
            size="sm"
            accessibilityLabel="Close menu"
            onPress={() => navigation.closeDrawer()}
          />
        ) : (
          <N1IconButton
            icon="sidebar"
            variant="inverse"
            size="sm"
            accessibilityLabel={
              collapsed ? 'Expand sidebar' : 'Collapse sidebar'
            }
            onPress={onToggleCollapse}
          />
        )}
      </View>

      {collapsed ? null : (
        <SidebarSearch
          value={query}
          onChangeText={setQuery}
          shortcut={!compact}
        />
      )}

      <ScrollView contentContainerStyle={styles.menu}>
        {collapsed ? null : (
          <N1Text
            variant="overline"
            color="tertiary"
            style={styles.sectionLabel}
          >
            MAIN MENU
          </N1Text>
        )}
        {items.map(item => (
          <SidebarItem
            key={item.route}
            item={item}
            active={item.route === activeRoute}
            collapsed={collapsed}
            onPress={handlePress}
          />
        ))}
      </ScrollView>

      {compact ? (
        <>
          <View style={styles.spacer} />
          <View style={styles.userCard}>
            <N1Avatar name={CURRENT_USER.name} tone="info" />
            <View style={styles.userCardText}>
              <N1Text variant="title" color="inverse" numberOfLines={1}>
                {CURRENT_USER.name}
              </N1Text>
              <N1Text variant="small" color="tertiary" numberOfLines={1}>
                {`${CURRENT_USER.roleLabel} · ${ORGANIZATION.shortName}`}
              </N1Text>
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}

export default React.memo(Sidebar);
