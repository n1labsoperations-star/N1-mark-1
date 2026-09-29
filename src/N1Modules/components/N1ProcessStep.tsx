import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { N1Icon } from '../icons/N1Icon';
import { createN1Styles, useN1Styles } from '../theme/N1ThemeProvider';
import { N1Badge } from './N1Badge';
import { N1IconButton } from './N1IconButton';
import { N1Text } from './N1Text';

export type N1StepStatus = 'completed' | 'current' | 'upcoming' | 'draft';

export type N1StepNumberProps = {
  number: number;
  /**
   * completed: green · current: blue ring · upcoming: grey · draft: black
   * (draft is a step still being planned, as in Create flow).
   */
  status?: N1StepStatus;
};

const makeStyles = createN1Styles(t => ({
  circle: {
    width: t.stepNumberSize,
    height: t.stepNumberSize,
    borderRadius: t.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draft: { backgroundColor: t.colors.primary },
  completed: { backgroundColor: t.colors.tone.success.solid },
  current: {
    borderWidth: t.borderWidth.thick,
    borderColor: t.colors.tone.info.solid,
    backgroundColor: t.colors.surface,
  },
  upcoming: { backgroundColor: t.colors.surfaceMuted },
  step: { gap: t.spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
  control: { flex: 1 },
  lockedControl: { pointerEvents: 'none', opacity: t.opacity.disabled },
  status: { marginLeft: t.stepNumberSize + t.spacing.md },
  lock: {
    width: t.controlHeight.sm,
    height: t.controlHeight.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const numberColor = {
  draft: 'onPrimary',
  completed: 'onPrimary',
  current: 'info',
  upcoming: 'secondary',
} as const;

export function N1StepNumber({ number, status = 'draft' }: N1StepNumberProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <View
      style={[styles.circle, styles[status]]}
      accessibilityLabel={`Step ${number}`}
    >
      <N1Text variant="caption" weight="bold" color={numberColor[status]}>
        {number}
      </N1Text>
    </View>
  );
}

const statusBadge = {
  completed: { label: 'Completed', tone: 'success' },
  current: { label: 'In progress', tone: 'info' },
  upcoming: { label: 'Upcoming', tone: 'neutral' },
} as const;

export type N1ProcessStepProps = {
  number: number;
  status?: N1StepStatus;
  /** The step's control, usually an N1DropDown of operations. */
  children: ReactNode;
  /** Shows a remove (✕) button. Ignored for locked steps. */
  onRemove?: () => void;
  /** Completed steps can't be edited; shows a lock instead of remove. */
  locked?: boolean;
  /** Show the status tag under the row (Edit flow). Defaults to true unless draft. */
  showStatus?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** One numbered operation in a process flow (Create flow / Edit flow). */
export function N1ProcessStep({
  number,
  status = 'draft',
  children,
  onRemove,
  locked = status === 'completed',
  showStatus = status !== 'draft',
  style,
  testID,
}: N1ProcessStepProps) {
  const styles = useN1Styles(makeStyles);
  const badge = status !== 'draft' ? statusBadge[status] : undefined;
  return (
    <View testID={testID} style={[styles.step, style]}>
      <View style={styles.row}>
        <N1StepNumber number={number} status={status} />
        <View style={[styles.control, locked && styles.lockedControl]}>
          {children}
        </View>
        {locked ? (
          <View style={styles.lock} accessibilityLabel="Locked">
            <N1Icon name="lock" size="sm" color="textTertiary" />
          </View>
        ) : (
          onRemove && (
            <N1IconButton
              icon="close"
              variant="danger"
              size="sm"
              accessibilityLabel={`Remove step ${number}`}
              onPress={onRemove}
            />
          )
        )}
      </View>
      {showStatus && badge && (
        <View style={styles.status}>
          <N1Badge label={badge.label} tone={badge.tone} />
        </View>
      )}
    </View>
  );
}
