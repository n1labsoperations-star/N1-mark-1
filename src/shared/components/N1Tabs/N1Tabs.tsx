import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1Text } from '../N1Text/N1Text';

export type N1Tab<K extends string> = {
  key: K;
  label: string;
};

export type N1TabsProps<K extends string> = {
  tabs: N1Tab<K>[];
  value: K;
  onChange: (key: K) => void;
  /** Stretch across the parent, splitting the width evenly. */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
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
    height: t.controlHeight.sm,
    paddingHorizontal: t.spacing.lg,
    borderRadius: t.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackFull: { alignSelf: 'stretch' },
  tabFull: { flex: 1 },
  active: { backgroundColor: t.colors.surface, boxShadow: t.shadow.raised },
}));

/** Segmented tabs (e.g. Invoices / Quotes). */
export function N1Tabs<K extends string>({
  tabs,
  value,
  onChange,
  fullWidth = false,
  style,
}: N1TabsProps<K>) {
  const styles = useN1Styles(makeStyles);
  return (
    <View
      style={[styles.track, fullWidth && styles.trackFull, style]}
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
              active && styles.active,
            ]}
          >
            <N1Text
              variant="label"
              weight={active ? 'bold' : 'semiBold'}
              color={active ? 'primary' : 'secondary'}
            >
              {tab.label}
            </N1Text>
          </Pressable>
        );
      })}
    </View>
  );
}
