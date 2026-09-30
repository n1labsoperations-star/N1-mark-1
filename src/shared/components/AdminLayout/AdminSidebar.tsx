import { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import {
  N1Avatar,
  N1Icon,
  N1Logo,
  N1Text,
  useN1Styles,
  useN1Theme,
} from '../../../N1Modules';
import { NAV_STRINGS } from '../../constants';
import { makeSidebarStyles } from './AdminLayout.styles';
import type { AdminNavItem, AdminUserSummary } from './types';

export type AdminSidebarProps<K extends string> = {
  items: readonly AdminNavItem<K>[];
  activeKey?: K;
  onNavigate: (key: K) => void;
  user: AdminUserSummary;
  onProfilePress: () => void;
  collapsed?: boolean;
  /** Collapse on desktop, close in the phone drawer. */
  onHeaderButtonPress?: () => void;
  headerButtonMode?: 'collapse' | 'close';
};

type ItemProps<K extends string> = {
  item: AdminNavItem<K>;
  active: boolean;
  collapsed: boolean;
  onNavigate: (key: K) => void;
};

function SidebarItemBase<K extends string>({
  item,
  active,
  collapsed,
  onNavigate,
}: ItemProps<K>) {
  const styles = useN1Styles(makeSidebarStyles);
  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityLabel={item.label}
      aria-selected={active}
      onPress={() => onNavigate(item.key)}
      style={({ pressed }) => [
        styles.item,
        collapsed && styles.itemCollapsed,
        active && styles.itemActive,
        pressed && styles.itemPressed,
      ]}
    >
      <N1Icon name={item.icon} size="md" color="textInverse" />
      {!collapsed && (
        <N1Text weight={active ? 'bold' : 'regular'} style={styles.inverseText}>
          {item.label}
        </N1Text>
      )}
    </Pressable>
  );
}

const SidebarItem = memo(SidebarItemBase) as typeof SidebarItemBase;

/** Dark navigation column from the AdminFlow design; also the phone drawer. */
export function AdminSidebar<K extends string>({
  items,
  activeKey,
  onNavigate,
  user,
  onProfilePress,
  collapsed = false,
  onHeaderButtonPress,
  headerButtonMode = 'collapse',
}: AdminSidebarProps<K>) {
  const styles = useN1Styles(makeSidebarStyles);
  const theme = useN1Theme();
  const [query, setQuery] = useState('');

  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? items.filter(i => i.label.toLowerCase().includes(needle))
      : items;
  }, [items, query]);

  const headerLabel =
    headerButtonMode === 'close'
      ? NAV_STRINGS.closeMenu
      : collapsed
      ? NAV_STRINGS.expandSidebar
      : NAV_STRINGS.collapseSidebar;

  return (
    <View
      style={[styles.sidebar, collapsed && styles.collapsed]}
      accessibilityRole="menu"
    >
      <View style={styles.brandRow}>
        {!collapsed && <N1Logo size="sm" color="inverse" />}
        {onHeaderButtonPress && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={headerLabel}
            onPress={onHeaderButtonPress}
            style={styles.headerButton}
          >
            <N1Icon
              name={headerButtonMode === 'close' ? 'close' : 'sidebar'}
              size="sm"
              color="textInverse"
            />
          </Pressable>
        )}
      </View>

      {!collapsed && (
        <View style={styles.search}>
          <N1Icon name="search" size="sm" color="textTertiary" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={NAV_STRINGS.searchMenu}
            placeholderTextColor={theme.colors.textTertiary}
            accessibilityLabel={NAV_STRINGS.searchMenu}
            style={styles.searchInput}
          />
        </View>
      )}

      <ScrollView style={styles.fill} contentContainerStyle={styles.menu}>
        {!collapsed && (
          <N1Text variant="overline" style={styles.sectionLabel}>
            {NAV_STRINGS.mainMenu}
          </N1Text>
        )}
        {visibleItems.map(item => (
          <SidebarItem
            key={item.key}
            item={item}
            active={item.key === activeKey}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={NAV_STRINGS.openProfile}
        onPress={onProfilePress}
        style={styles.footer}
      >
        <N1Avatar name={user.name} size="sm" tone="info" />
        {!collapsed && (
          <View style={styles.footerText}>
            <N1Text
              variant="label"
              weight="bold"
              style={styles.inverseText}
              numberOfLines={1}
            >
              {user.name}
            </N1Text>
            <N1Text
              variant="caption"
              style={styles.mutedText}
              numberOfLines={1}
            >
              {user.subtitle}
            </N1Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
