import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1Text } from '../N1Text/N1Text';

type Props = {
  label: string;
  required?: boolean;
  nativeID?: string;
};

const makeStyles = createN1Styles(t => ({
  required: { color: t.colors.danger },
}));

/** Field label with the red asterisk used for required fields. */
export function N1FieldLabel({ label, required, nativeID }: Props) {
  const styles = useN1Styles(makeStyles);
  return (
    <N1Text variant="label" nativeID={nativeID}>
      {label}
      {required && (
        <N1Text variant="label" style={styles.required}>
          {' *'}
        </N1Text>
      )}
    </N1Text>
  );
}

type HelperProps = {
  helperText?: string;
  errorText?: string;
};

/** Error text wins over helper text, so only one line shows under a field. */
export function N1FieldHelper({ helperText, errorText }: HelperProps) {
  if (errorText) {
    return (
      <N1Text variant="caption" color="danger" accessibilityLiveRegion="polite">
        {errorText}
      </N1Text>
    );
  }
  if (helperText) {
    return (
      <N1Text variant="caption" color="secondary">
        {helperText}
      </N1Text>
    );
  }
  return null;
}
