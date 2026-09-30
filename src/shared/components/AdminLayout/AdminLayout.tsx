import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  N1Avatar,
  N1IconButton,
  N1Text,
  useN1Breakpoint,
  useN1Styles,
} from '..';
import { NAV_STRINGS } from '../../constants';
import { useToggle } from '../../hooks';
import { AdminSidebar } from './AdminSidebar';
import { makeLayoutStyles } from './AdminLayout.styles';
import type { AdminNavItem, AdminUserSummary } from './types';

export type AdminLayoutProps<K extends string> = {
  items: readonly AdminNavItem<K>[];
  activeKey?: K;
  onNavigate: (key: K) => void;
  /** Full name in the desktop top bar, e.g. "ABC Engineering Pvt Ltd". */
  organizationName: string;
  /** Shorter name for the phone bar, e.g. "ABC Engineering". */
  organizationShortName?: string;
  user: AdminUserSummary;
  onProfilePress: () => void;
  /**
   * Phones only: show the dark bar with the menu button. Detail screens turn
   * it off and draw their own back header.
   */
  showCompactBar?: boolean;
  children: ReactNode;
};

/**
 * Admin shell. Desktop / tablet: sidebar + top bar around the content.
 * Phone: dark top bar with a menu button that opens the sidebar as a drawer.
 */
export function AdminLayout<K extends string>({
  items,
  activeKey,
  onNavigate,
  organizationName,
  organizationShortName,
  user,
  onProfilePress,
  showCompactBar = true,
  children,
}: AdminLayoutProps<K>) {
  const styles = useN1Styles(makeLayoutStyles);
  const { isCompact } = useN1Breakpoint();
  const [collapsed, , , toggleCollapsed] = useToggle(false);
  const [drawerOpen, openDrawer, closeDrawer] = useToggle(false);

  if (isCompact) {
    const navigateAndClose = (key: K) => {
      closeDrawer();
      onNavigate(key);
    };
    const profileAndClose = () => {
      closeDrawer();
      onProfilePress();
    };
    return (
      <View style={styles.compactRoot}>
        {showCompactBar && (
          <SafeAreaView edges={['top']} style={styles.compactBarSafe}>
            <View style={styles.compactBar}>
              <N1IconButton
                icon="menu"
                size="sm"
                variant="overlay"
                accessibilityLabel={NAV_STRINGS.openMenu}
                onPress={openDrawer}
              />
              <N1Text
                variant="title"
                weight="bold"
                color="inverse"
                numberOfLines={1}
                style={styles.compactTitle}
              >
                {organizationShortName ?? organizationName}
              </N1Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={NAV_STRINGS.openProfile}
                onPress={onProfilePress}
              >
                <N1Avatar name={user.name} size="sm" tone="neutral" />
              </Pressable>
            </View>
          </SafeAreaView>
        )}
        <View style={styles.main}>{children}</View>
        <Modal
          visible={drawerOpen}
          transparent
          animationType="fade"
          onRequestClose={closeDrawer}
        >
          <View style={styles.drawerBackdrop}>
            <SafeAreaView style={styles.drawerPanel} edges={['top', 'bottom']}>
              <AdminSidebar
                items={items}
                activeKey={activeKey}
                onNavigate={navigateAndClose}
                user={user}
                onProfilePress={profileAndClose}
                onHeaderButtonPress={closeDrawer}
                headerButtonMode="close"
              />
            </SafeAreaView>
            <Pressable
              accessibilityLabel={NAV_STRINGS.closeMenu}
              style={styles.drawerDismiss}
              onPress={closeDrawer}
            />
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AdminSidebar
        items={items}
        activeKey={activeKey}
        onNavigate={onNavigate}
        user={user}
        onProfilePress={onProfilePress}
        collapsed={collapsed}
        onHeaderButtonPress={toggleCollapsed}
      />
      <View style={styles.main}>
        <View style={styles.topBar}>
          <N1Text variant="h2" numberOfLines={1} style={styles.topBarTitle}>
            {organizationName}
          </N1Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={NAV_STRINGS.openProfile}
            onPress={onProfilePress}
            style={({ pressed }) => [
              styles.userButton,
              pressed && styles.pressed,
            ]}
          >
            <N1Avatar name={user.name} size="md" />
            <View style={styles.userText}>
              <N1Text variant="label" weight="bold">
                {user.name}
              </N1Text>
              <N1Text variant="caption" color="secondary">
                {user.email}
              </N1Text>
            </View>
          </Pressable>
        </View>
        <View style={styles.main}>{children}</View>
      </View>
    </View>
  );
}
