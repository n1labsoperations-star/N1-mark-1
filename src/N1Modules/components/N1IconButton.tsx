import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { N1Icon, type N1IconColor, type N1IconName } from '../icons/N1Icon';
import {
  createN1Styles,
  useN1Styles,
  useN1Theme,
} from '../theme/N1ThemeProvider';
import type { N1Size } from '../theme/tokens';

export type N1IconButtonVariant =
  | 'secondary'
  | 'soft'
  | 'primary'
  | 'danger'
  | 'overlay';

export type N1IconButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  icon: N1IconName;
  /** Required: icon-only buttons have no visible text for screen readers. */
  accessibilityLabel: string;
  /**
   * secondary: white outlined circle (back arrow)
   * soft: grey circle (modal close)
   * primary: black circle
   * danger: outlined circle with a red icon (delete)
   * overlay: dark circle with a white icon, for the camera screen
   */
  variant?: N1IconButtonVariant;
  size?: N1Size;
  style?: StyleProp<ViewStyle>;
};

const iconColor: Record<N1IconButtonVariant, N1IconColor> = {
  secondary: 'textPrimary',
  soft: 'textPrimary',
  primary: 'onPrimary',
  danger: 'danger',
  overlay: 'textInverse',
};

const makeStyles = createN1Styles(t => ({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.pill,
    borderWidth: t.borderWidth.hairline,
    borderColor: 'transparent',
  },
  sm: { width: t.controlHeight.sm, height: t.controlHeight.sm },
  md: { width: t.controlHeight.md, height: t.controlHeight.md },
  lg: { width: t.controlHeight.lg, height: t.controlHeight.lg },
  secondary: {
    backgroundColor: t.colors.surface,
    borderColor: t.colors.border,
  },
  soft: { backgroundColor: t.colors.surfaceMuted },
  primary: { backgroundColor: t.colors.primary },
  danger: { backgroundColor: t.colors.surface, borderColor: t.colors.border },
  overlay: { backgroundColor: t.colors.scannerControl },
  pressed: { opacity: t.opacity.pressed },
  disabled: { opacity: t.opacity.disabled },
}));

export function N1IconButton({
  icon,
  variant = 'secondary',
  size = 'md',
  disabled,
  style,
  ...rest
}: N1IconButtonProps) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  return (
    <Pressable
      accessibilityRole="button"
      aria-disabled={Boolean(disabled)}
      disabled={disabled}
      hitSlop={size === 'sm' ? 4 : undefined}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      <N1Icon
        name={icon}
        size={size === 'lg' ? 'lg' : 'md'}
        color={iconColor[variant]}
        tintColor={
          variant === 'overlay' ? theme.colors.scannerForeground : undefined
        }
      />
    </Pressable>
  );
}
