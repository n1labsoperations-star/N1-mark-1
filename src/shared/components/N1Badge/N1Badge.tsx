import { View, type StyleProp, type ViewStyle } from 'react-native';
import {
  createN1Styles,
  useN1Styles,
  useN1Theme,
} from '../../../theme/N1ThemeProvider';
import type { N1Tone } from '../../../theme/themes';
import { N1Text } from '../N1Text/N1Text';

export type N1BadgeProps = {
  label: string;
  /**
   * success: Active, Paid, Completed, Accepted
   * info: In progress, Running, Sent
   * warning: Pending, QC pending, Maintenance
   * danger: Overdue, Rejected, Suspended
   * neutral: Idle, Draft, User
   */
  tone?: N1Tone;
  /** Small coloured dot before the label (e.g. "● Active"). */
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const DOT_SIZE = 6;

const makeStyles = createN1Styles(t => ({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: t.spacing.xs,
    paddingHorizontal: t.spacing.sm,
    paddingVertical: t.spacing.xxs,
    borderRadius: t.radius.pill,
  },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: t.radius.pill },
}));

/** Status tag. */
export function N1Badge({
  label,
  tone = 'neutral',
  dot = false,
  style,
  testID,
}: N1BadgeProps) {
  const styles = useN1Styles(makeStyles);
  const colors = useN1Theme().colors.tone[tone];
  return (
    <View
      testID={testID}
      style={[styles.badge, { backgroundColor: colors.background }, style]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: colors.solid }]} />}
      <N1Text
        variant="caption"
        weight="semiBold"
        style={{ color: colors.foreground }}
      >
        {label}
      </N1Text>
    </View>
  );
}
