import { memo } from 'react';
import { Pressable, View } from 'react-native';
import {
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import { ORDER_STRINGS } from '../constants';

const makeStyles = createN1Styles(t => ({
  root: { gap: t.spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  // Every step but the last stretches, so the lines share the width.
  step: { flex: 1, gap: t.spacing.xs },
  lastStep: { gap: t.spacing.xs },
  track: { flexDirection: 'row', alignItems: 'center' },
  line: {
    flex: 1,
    height: t.borderWidth.thick,
    marginHorizontal: t.spacing.sm,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.border,
  },
  lineDone: { backgroundColor: t.colors.primary },
  // Black, like the form's buttons: done is filled, current is a ring.
  circle: {
    width: t.stepNumberSize,
    height: t.stepNumberSize,
    borderRadius: t.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completed: { backgroundColor: t.colors.primary },
  current: {
    borderWidth: t.borderWidth.thick,
    borderColor: t.colors.primary,
    backgroundColor: t.colors.surface,
  },
  upcoming: { backgroundColor: t.colors.surfaceMuted },
  pressed: { opacity: t.opacity.pressed },
}));

const NUMBER_COLOR = {
  completed: 'onPrimary',
  current: 'primary',
  upcoming: 'secondary',
} as const;

type Props = {
  /** Step names, in order. */
  steps: readonly string[];
  /** 1-based. */
  current: number;
  /** Steps up to this one can be opened from the stepper. */
  reachable: number;
  onSelect: (step: number) => void;
};

/** ① ── ② ── ③ ── ④ across the top of the Create / Edit order form. */
export const OrderStepper = memo(function OrderStepperComponent({
  steps,
  current,
  reachable,
  onSelect,
}: Props) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const statusOf = (n: number) =>
    n < current ? 'completed' : n === current ? 'current' : 'upcoming';

  return (
    <View style={styles.root} testID="order-stepper">
      <View style={styles.row}>
        {steps.map((label, i) => {
          const n = i + 1;
          const isLast = n === steps.length;
          return (
            <View key={label} style={isLast ? styles.lastStep : styles.step}>
              <View style={styles.track}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={ORDER_STRINGS.form.stepA11y(n, label)}
                  accessibilityState={{
                    selected: n === current,
                    disabled: n > reachable,
                  }}
                  disabled={n > reachable || n === current}
                  onPress={() => onSelect(n)}
                  style={({ pressed }) => pressed && styles.pressed}
                  testID={`order-step-${n}`}
                >
                  <View
                    style={[styles.circle, styles[statusOf(n)]]}
                    testID={`order-step-${n}-${statusOf(n)}`}
                  >
                    <N1Text
                      variant="caption"
                      weight="bold"
                      color={NUMBER_COLOR[statusOf(n)]}
                    >
                      {n}
                    </N1Text>
                  </View>
                </Pressable>
                {!isLast && (
                  <View style={[styles.line, n < current && styles.lineDone]} />
                )}
              </View>
              {!isCompact && (
                <N1Text
                  variant="caption"
                  weight={n === current ? 'bold' : undefined}
                  color={n === current ? 'primary' : 'secondary'}
                >
                  {label}
                </N1Text>
              )}
            </View>
          );
        })}
      </View>
      {isCompact && (
        <N1Text variant="small" color="secondary">
          {ORDER_STRINGS.form.stepOf(current, steps.length, steps[current - 1])}
        </N1Text>
      )}
    </View>
  );
});
