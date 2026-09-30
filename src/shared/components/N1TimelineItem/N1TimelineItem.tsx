import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { N1Icon } from '../N1Icon/N1Icon';
import {
  createN1Styles,
  useN1Styles,
  useN1Theme,
} from '../../../theme/N1ThemeProvider';
import { N1Badge } from '../N1Badge/N1Badge';
import { N1Text } from '../N1Text/N1Text';

export type N1TimelineStatus = 'done' | 'active' | 'pending';

export type N1TimelineItemProps = {
  /** e.g. "Facing (Lathe)". */
  title: string;
  /** e.g. "Lathe-01 · Ravi Kumar" or "Next operation". */
  subtitle?: string;
  /** e.g. "Completed at: 09:45 AM". */
  meta?: string;
  status: N1TimelineStatus;
  /** Tag text. Defaults to Completed / Running / Pending. */
  statusLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const defaults = {
  done: { label: 'Completed', tone: 'success', icon: 'check-circle' },
  active: { label: 'Running', tone: 'info', icon: 'circle-dot' },
  pending: { label: 'Pending', tone: 'neutral', icon: 'clock' },
} as const;

const makeStyles = createN1Styles(t => ({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.md,
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  text: { flex: 1, gap: t.spacing.xxs },
}));

/** One step on a route card (Material QC ✓ Completed, Turning ● Running). */
export const N1TimelineItem = React.memo(function N1TimelineItemComponent({
  title,
  subtitle,
  meta,
  status,
  statusLabel,
  style,
  testID,
}: N1TimelineItemProps) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  const d = defaults[status];
  const pending = status === 'pending';
  return (
    <View testID={testID} style={[styles.card, style]}>
      <N1Icon
        name={d.icon}
        size="lg"
        tintColor={
          pending ? theme.colors.textTertiary : theme.colors.tone[d.tone].solid
        }
      />
      <View style={styles.text}>
        <N1Text
          variant="label"
          weight="bold"
          color={pending ? 'tertiary' : 'primary'}
        >
          {title}
        </N1Text>
        {subtitle && (
          <N1Text variant="caption" color={pending ? 'tertiary' : 'secondary'}>
            {subtitle}
          </N1Text>
        )}
        {meta && (
          <N1Text variant="caption" weight="semiBold">
            {meta}
          </N1Text>
        )}
      </View>
      <N1Badge label={statusLabel ?? d.label} tone={d.tone} />
    </View>
  );
});
N1TimelineItem.displayName = 'N1TimelineItem';
