import {
  N1Button,
  createN1Styles,
  useN1Styles,
  type N1IconName,
} from '../../../N1Modules';
import { COMMON_STRINGS } from '../../constants';

export type FormFooterProps = {
  submitLabel: string;
  onSubmit: () => void;
  onCancel?: () => void;
  cancelLabel?: string;
  loading?: boolean;
  submitIcon?: N1IconName;
  /** 'danger' for destructive confirmations. */
  tone?: 'primary' | 'danger';
  /** Keep buttons their natural width (right-aligned page footers). */
  compact?: boolean;
  submitTestID?: string;
};

const makeStyles = createN1Styles(() => ({
  grow: { flex: 1 },
}));

/** Cancel + primary action, sharing the width, for modal and page forms. */
export function FormFooter({
  submitLabel,
  onSubmit,
  onCancel,
  cancelLabel = COMMON_STRINGS.cancel,
  loading = false,
  submitIcon,
  tone = 'primary',
  compact = false,
  submitTestID,
}: FormFooterProps) {
  const styles = useN1Styles(makeStyles);
  const grow = compact ? undefined : styles.grow;
  return (
    <>
      {onCancel && (
        <N1Button
          title={cancelLabel}
          variant="secondary"
          fullWidth={!compact}
          style={grow}
          disabled={loading}
          onPress={onCancel}
        />
      )}
      <N1Button
        title={submitLabel}
        variant={tone}
        leftIcon={submitIcon}
        fullWidth={!compact}
        style={grow}
        loading={loading}
        onPress={onSubmit}
        testID={submitTestID}
      />
    </>
  );
}
