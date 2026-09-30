import { memo } from 'react';
import { View } from 'react-native';
import {
  N1Icon,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import type { Attachment } from '../../../shared/types';
import { formatFileSize } from '../../../shared/utils';

const makeStyles = createN1Styles(t => ({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.sm,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.background,
  },
}));

export const AttachmentList = memo(function AttachmentListComponent({
  files,
}: {
  files: readonly Attachment[];
}) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.row}>
      {files.map(file => (
        <View key={file.id} style={styles.chip}>
          <N1Icon name="file" size="sm" color="textSecondary" />
          <View>
            <N1Text variant="label">{file.name}</N1Text>
            <N1Text variant="caption" color="secondary">
              {formatFileSize(file.sizeBytes)}
            </N1Text>
          </View>
        </View>
      ))}
    </View>
  );
});
