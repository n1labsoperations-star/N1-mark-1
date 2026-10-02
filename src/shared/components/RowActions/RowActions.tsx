import { memo } from 'react';
import { View } from 'react-native';
import { N1IconButton, createN1Styles, useN1Styles } from '..';

export type RowActionsProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel: string;
  deleteLabel: string;
};

const makeStyles = createN1Styles(t => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
}));

/** Edit + delete icon buttons at the end of a table row. */
export const RowActions = memo(function RowActionsComponent({
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: RowActionsProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.row}>
      {onEdit && (
        <N1IconButton
          icon="edit"
          variant="primary"
          size="sm"
          accessibilityLabel={editLabel}
          onPress={onEdit}
        />
      )}
      {onDelete && (
        <N1IconButton
          icon="trash"
          size="sm"
          variant="danger"
          accessibilityLabel={deleteLabel}
          onPress={onDelete}
        />
      )}
    </View>
  );
});
