import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
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
  /** The step being worked on now: tinted, with a stronger border. */
  highlighted?: boolean;
  /**
   * Tap to show / hide the subtitle and meta. Without it the details are
   * always shown.
   */
  onToggle?: () => void;
  /** With onToggle: whether the details are showing. */
  expanded?: boolean;
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
  highlighted: {
    borderWidth: t.borderWidth.thick,
    borderColor: t.colors.tone.info.solid,
    backgroundColor: t.colors.tone.info.background,
    // Keep the content where it was despite the thicker border.
    padding: t.spacing.md - (t.borderWidth.thick - t.borderWidth.hairline),
  },
  text: { flex: 1, gap: t.spacing.xxs },
  right: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  pressed: { opacity: t.opacity.pressed },
}));

/** One step on a route card (Material QC ✓ Completed, Turning ● Running). */
export const N1TimelineItem = React.memo(function N1TimelineItemComponent({
  title,
  subtitle,
  meta,
  status,
  statusLabel,
  highlighted = false,
  onToggle,
  expanded = true,
  style,
  testID,
}: N1TimelineItemProps) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  const d = defaults[status];
  const pending = status === 'pending';
  const showDetails = !onToggle || expanded;
  const content = (
    <>
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
        {showDetails && subtitle && (
          <N1Text variant="caption" color={pending ? 'tertiary' : 'secondary'}>
            {subtitle}
          </N1Text>
        )}
        {showDetails && meta && (
          <N1Text variant="caption" weight="semiBold">
            {meta}
          </N1Text>
        )}
      </View>
      <View style={styles.right}>
        <N1Badge label={statusLabel ?? d.label} tone={d.tone} />
        {onToggle && (
          <N1Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size="sm"
            color="textSecondary"
          />
        )}
      </View>
    </>
  );
  const cardStyle = [styles.card, highlighted && styles.highlighted, style];

  if (!onToggle) {
    return (
      <View
        testID={testID}
        accessibilityState={{ selected: highlighted }}
        style={cardStyle}
      >
        {content}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected: highlighted, expanded }}
      onPress={onToggle}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
});
N1TimelineItem.displayName = 'N1TimelineItem';
