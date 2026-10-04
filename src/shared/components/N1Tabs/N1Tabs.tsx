import React from 'react';
import {
  Pressable,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1Icon, type N1IconName } from '../N1Icon/N1Icon';
import { N1Text } from '../N1Text/N1Text';

export type N1Tab<K extends string> = {
  key: K;
  label: string;
  /** Shown before the label, e.g. "building" for General. */
  icon?: N1IconName;
  /** Small count after the label, e.g. details still to fill in. */
  badge?: number;
};

export type N1TabsProps<K extends string> = {
  tabs: N1Tab<K>[];
  value: K;
  onChange: (key: K) => void;
  /** Stretch across the parent, splitting the width evenly. */
  fullWidth?: boolean;
  /**
   * segmented: pill track (Invoices / Quotes).
   * menu: stacked side menu (Organization details).
   * underline: text tabs over a hairline, the active one underlined (My profile).
   */
  variant?: 'segmented' | 'menu' | 'underline';
  /** Scroll sideways when the tabs don't fit, e.g. six tabs on a phone. */
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Each tab gets `${testID}-${key}`. */
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  track: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: t.spacing.xs,
    gap: t.spacing.xs,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.surfaceMuted,
  },
  tab: {
    flexDirection: 'row',
    gap: t.spacing.sm,
    height: t.controlHeight.sm,
    paddingHorizontal: t.spacing.lg,
    borderRadius: t.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackFull: { alignSelf: 'stretch' },
  tabFull: { flex: 1 },
  active: { backgroundColor: t.colors.surface, boxShadow: t.shadow.raised },
  scroller: { flexGrow: 0 },
  trackVertical: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    padding: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  tabVertical: {
    justifyContent: 'flex-start',
    height: t.controlHeight.md,
    borderRadius: t.radius.sm,
  },
  activeVertical: { backgroundColor: t.colors.surfaceMuted },
  badge: {
    minWidth: t.iconSize.md,
    paddingHorizontal: t.spacing.xs,
    borderRadius: t.radius.pill,
    alignItems: 'center',
    backgroundColor: t.colors.tone.warning.background,
  },
  badgeVertical: { marginLeft: 'auto' },
  trackUnderline: {
    alignSelf: 'stretch',
    padding: 0,
    gap: t.spacing.xl,
    borderRadius: 0,
    borderBottomWidth: t.borderWidth.hairline,
    borderBottomColor: t.colors.border,
    backgroundColor: 'transparent',
  },
  tabUnderline: {
    height: t.controlHeight.md,
    paddingHorizontal: 0,
    borderRadius: 0,
    // Sits on the track's hairline.
    marginBottom: -t.borderWidth.hairline,
    borderBottomWidth: t.borderWidth.thick,
    borderBottomColor: 'transparent',
  },
  activeUnderline: { borderBottomColor: t.colors.primary },
}));

/** Tabs: a segmented pill, a side menu or underlined text tabs. */
export const N1Tabs = React.memo(function N1TabsComponent<K extends string>({
  tabs,
  value,
  onChange,
  fullWidth = false,
  variant = 'segmented',
  scrollable = false,
  style,
  testID,
}: N1TabsProps<K>) {
  const styles = useN1Styles(makeStyles);
  const vertical = variant === 'menu';
  const underline = variant === 'underline';
  const activeStyle = vertical
    ? styles.activeVertical
    : underline
    ? styles.activeUnderline
    : styles.active;
  const track = (
    <View
      style={[
        styles.track,
        fullWidth && styles.trackFull,
        vertical && styles.trackVertical,
        underline && styles.trackUnderline,
        style,
      ]}
      accessibilityRole="tablist"
    >
      {tabs.map(tab => {
        const active = tab.key === value;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            aria-selected={active}
            onPress={() => onChange(tab.key)}
            style={[
              styles.tab,
              fullWidth && styles.tabFull,
              vertical && styles.tabVertical,
              underline && styles.tabUnderline,
              active && activeStyle,
            ]}
            testID={testID && `${testID}-${tab.key}`}
          >
            {tab.icon && (
              <N1Icon
                name={tab.icon}
                size="sm"
                color={active ? 'textPrimary' : 'textSecondary'}
              />
            )}
            <N1Text
              variant="label"
              weight={active ? 'bold' : 'semiBold'}
              color={active ? 'primary' : 'secondary'}
            >
              {tab.label}
            </N1Text>
            {Boolean(tab.badge) && (
              <View style={[styles.badge, vertical && styles.badgeVertical]}>
                <N1Text variant="caption" weight="bold" color="warning">
                  {tab.badge}
                </N1Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
  if (!scrollable || vertical) {
    return track;
  }
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
    >
      {track}
    </ScrollView>
  );
}) as <K extends string>(props: N1TabsProps<K>) => React.ReactNode;
