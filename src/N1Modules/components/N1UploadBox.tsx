import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { N1Icon } from '../icons/N1Icon';
import { createN1Styles, useN1Styles } from '../theme/N1ThemeProvider';
import { N1FieldHelper, N1FieldLabel } from './N1FieldLabel';
import { N1IconButton } from './N1IconButton';
import { N1Text } from './N1Text';

export type N1UploadBoxProps = {
  label?: string;
  /** e.g. "Click or drop design file (PDF, DWG, STEP)". */
  hint: string;
  /** Open your file picker here; the box itself does not pick files. */
  onPress: () => void;
  /** Once chosen, the file is shown with a remove button. */
  fileName?: string;
  fileSize?: string;
  onRemove?: () => void;
  errorText?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  container: { gap: t.spacing.xs + t.spacing.xxs },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    minHeight: t.controlHeight.lg + t.spacing.lg,
    paddingHorizontal: t.spacing.lg,
    borderRadius: t.radius.md,
    borderWidth: t.borderWidth.hairline,
    borderStyle: 'dashed',
    borderColor: t.colors.textTertiary,
    backgroundColor: t.colors.background,
  },
  boxError: { borderColor: t.colors.danger },
  fileText: { flex: 1 },
  pressed: { opacity: t.opacity.pressed },
  disabled: { opacity: t.opacity.disabled },
}));

/** Dashed drop zone for attachments (design file, PO documents). */
export function N1UploadBox({
  label,
  hint,
  onPress,
  fileName,
  fileSize,
  onRemove,
  errorText,
  disabled = false,
  style,
  testID,
}: N1UploadBoxProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={[styles.container, disabled && styles.disabled, style]}>
      {label && <N1FieldLabel label={label} />}
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={fileName ?? hint}
        aria-disabled={disabled}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.box,
          Boolean(errorText) && styles.boxError,
          pressed && styles.pressed,
        ]}
      >
        <N1Icon
          name={fileName ? 'file' : 'upload'}
          size="sm"
          color="textSecondary"
        />
        <View style={styles.fileText}>
          <N1Text
            variant="small"
            color={fileName ? 'primary' : 'secondary'}
            weight={fileName ? 'semiBold' : 'regular'}
            numberOfLines={1}
          >
            {fileName ?? hint}
          </N1Text>
          {fileName && fileSize && (
            <N1Text variant="caption" color="tertiary">
              {fileSize}
            </N1Text>
          )}
        </View>
        {fileName && onRemove && (
          <N1IconButton
            icon="close"
            variant="soft"
            size="sm"
            accessibilityLabel={`Remove ${fileName}`}
            onPress={onRemove}
          />
        )}
      </Pressable>
      <N1FieldHelper errorText={errorText} />
    </View>
  );
}
