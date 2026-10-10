import { FormFooter, N1Button } from '..';
import { COMMON_STRINGS } from '../../constants';

export type EditableFormFooterProps = {
  editing: boolean;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  /** Screen-reader label for Edit, e.g. "Edit general". */
  editLabel?: string;
  editTestID?: string;
  submitTestID?: string;
};

/**
 * Phones: an EditableSectionHeader's buttons for the screen's bottom bar.
 * Edit, then Cancel + Save while editing.
 */
export function EditableFormFooter({
  editing,
  saving,
  onEdit,
  onCancel,
  onSave,
  editLabel,
  editTestID,
  submitTestID,
}: EditableFormFooterProps) {
  return editing ? (
    <FormFooter
      submitLabel={COMMON_STRINGS.save}
      onSubmit={onSave}
      onCancel={onCancel}
      loading={saving}
      submitTestID={submitTestID}
    />
  ) : (
    <N1Button
      title={COMMON_STRINGS.edit}
      leftIcon="edit"
      fullWidth
      accessibilityLabel={editLabel}
      onPress={onEdit}
      testID={editTestID}
    />
  );
}
