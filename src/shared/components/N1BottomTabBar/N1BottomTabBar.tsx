import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { N1Icon, type N1IconName } from '../N1Icon/N1Icon';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1Text } from '../N1Text/N1Text';

export type N1BottomTab<K extends string> = {
  key: K;
  label: string;
  icon: N1IconName;
};

export type N1BottomTabBarProps<K extends string> = {
  tabs: N1BottomTab<K>[];
  value: K;
  onChange: (key: K) => void;
  style?: StyleProp<ViewStyle>;
};

const makeStyles = createN1Styles(t => ({
  bar: {
    backgroundColor: t.colors.surface,
    borderTopWidth: t.borderWidth.hairline,
    borderTopColor: t.colors.border,
  },
  row: { flexDirection: 'row' },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: t.spacing.xxs,
    paddingVertical: t.spacing.sm,
  },
  pressed: { opacity: t.opacity.pressed },
}));

/** Phone tab bar (Jobs / Profile). */
export function N1BottomTabBar<K extends string>({
  tabs,
  value,
  onChange,
  style,
}: N1BottomTabBarProps<K>) {
  const styles = useN1Styles(makeStyles);
  return (
    <SafeAreaView edges={['bottom']} style={[styles.bar, style]}>
      <View style={styles.row} accessibilityRole="tablist">
        {tabs.map(tab => {
          const active = tab.key === value;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              aria-selected={active}
              onPress={() => onChange(tab.key)}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            >
              <N1Icon
                name={tab.icon}
                size="lg"
                color={active ? 'textPrimary' : 'textTertiary'}
              />
              <N1Text
                variant="caption"
                weight={active ? 'bold' : 'regular'}
                color={active ? 'primary' : 'tertiary'}
              >
                {tab.label}
              </N1Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
