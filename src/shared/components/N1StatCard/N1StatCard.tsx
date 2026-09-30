import { View, type StyleProp, type ViewStyle } from 'react-native';
import { N1Icon, type N1IconName } from '../N1Icon/N1Icon';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import type { N1Tone } from '../../../theme/themes';
import { N1Text } from '../N1Text/N1Text';

export type N1StatCardProps = {
  label: string;
  value: string | number;
  icon?: N1IconName;
  /** Colours the value, e.g. Paid = success, Pending = warning. */
  tone?: N1Tone;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  card: {
    flex: 1,
    minWidth: t.statCardMinWidth,
    gap: t.spacing.xs,
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs + t.spacing.xxs,
  },
}));

/** Summary number tile (Total invoices, Running machines, Monthly billed…). */
export function N1StatCard({
  label,
  value,
  icon,
  tone,
  style,
  testID,
}: N1StatCardProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <View testID={testID} style={[styles.card, style]}>
      <View style={styles.labelRow}>
        {icon && <N1Icon name={icon} size="sm" color="textSecondary" />}
        <N1Text variant="caption" color="secondary">
          {label}
        </N1Text>
      </View>
      <N1Text variant="stat" color={tone === 'neutral' ? 'secondary' : tone}>
        {value}
      </N1Text>
    </View>
  );
}
