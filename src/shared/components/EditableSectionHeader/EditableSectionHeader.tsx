import { View } from 'react-native';
import {
  N1Button,
  N1Icon,
  N1Text,
  createN1Styles,
  useN1Styles,
  type N1IconName,
} from '..';
import { COMMON_STRINGS } from '../../constants';

export type EditableSectionHeaderProps = {
  title: string;
  icon?: N1IconName;
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

const makeStyles = createN1Styles(t => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: t.spacing.md,
  },
  title: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  actions: { flexDirection: 'row', gap: t.spacing.sm },
}));

/**
 * Title of a form whose fields stay locked until Edit; while editing, Edit
 * becomes Cancel + Save (Organization details, My profile).
 */
export function EditableSectionHeader({
  title,
  icon,
  editing,
  saving,
  onEdit,
  onCancel,
  onSave,
  editLabel,
  editTestID,
  submitTestID,
}: EditableSectionHeaderProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.header}>
      <View style={styles.title}>
        {icon && <N1Icon name={icon} size="sm" />}
        <N1Text variant="h3">{title}</N1Text>
      </View>
      <View style={styles.actions}>
        {editing ? (
          <>
            <N1Button
              title={COMMON_STRINGS.cancel}
              variant="secondary"
              size="sm"
              disabled={saving}
              onPress={onCancel}
            />
            <N1Button
              title={COMMON_STRINGS.save}
              size="sm"
              loading={saving}
              onPress={onSave}
              testID={submitTestID}
            />
          </>
        ) : (
          <N1Button
            title={COMMON_STRINGS.edit}
            leftIcon="edit"
            size="sm"
            accessibilityLabel={editLabel}
            onPress={onEdit}
            testID={editTestID}
          />
        )}
      </View>
    </View>
  );
}
