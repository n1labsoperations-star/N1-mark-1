import { memo } from 'react';
import { Pressable, View } from 'react-native';
import {
  N1Icon,
  N1Text,
  createN1Styles,
  useN1Styles,
  type N1IconName,
} from '../../../shared/components';

const makeStyles = createN1Styles(t => ({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.sm,
    padding: t.spacing.lg,
    borderRadius: t.radius.md,
    borderWidth: t.borderWidth.hairline,
    borderStyle: 'dashed',
    borderColor: t.colors.border,
    backgroundColor: t.colors.background,
  },
  row: { flexDirection: 'row' },
  pressed: { opacity: t.opacity.pressed },
}));

type Props = {
  label: string;
  icon: N1IconName;
  onPress: () => void;
  /** 'row' puts the icon beside the label (Add process). */
  layout?: 'stacked' | 'row';
  accessibilityLabel?: string;
  testID?: string;
};

/** Dashed button: the drawing file tile and the "Add process" row. */
export const DashedTile = memo(function DashedTileComponent({
  label,
  icon,
  onPress,
  layout = 'stacked',
  accessibilityLabel,
  testID,
}: Props) {
  const styles = useN1Styles(makeStyles);
  const isRow = layout === 'row';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.tile,
        isRow && styles.row,
        pressed && styles.pressed,
      ]}
    >
      <N1Icon
        name={icon}
        size={isRow ? 'sm' : 'md'}
        color={isRow ? 'textPrimary' : 'textSecondary'}
      />
      <View>
        <N1Text
          variant={isRow ? 'label' : 'small'}
          weight={isRow ? 'semiBold' : 'regular'}
          color={isRow ? 'primary' : 'secondary'}
        >
          {label}
        </N1Text>
      </View>
    </Pressable>
  );
});
