import { memo } from 'react';
import { View } from 'react-native';
import {
  N1IconButton,
  N1Icon,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import type { Attachment } from '../../../shared/types';
import { formatFileSize } from '../../../shared/utils';
import { ORDER_STRINGS } from '../constants';

type Props = {
  documents: readonly Attachment[];
  onDownload: (doc: Attachment) => void;
};

const makeStyles = createN1Styles(t => ({
  list: { gap: t.spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  icon: {
    padding: t.spacing.sm,
    borderRadius: t.radius.sm,
    backgroundColor: t.colors.tone.info.background,
  },
  text: { flex: 1, gap: t.spacing.xxs },
}));

export const DocumentList = memo(function DocumentListComponent({
  documents,
  onDownload,
}: Props) {
  const styles = useN1Styles(makeStyles);
  if (documents.length === 0) {
    return (
      <N1Text variant="small" color="secondary">
        {ORDER_STRINGS.details.noDocuments}
      </N1Text>
    );
  }
  return (
    <View style={styles.list}>
      {documents.map(doc => (
        <View key={doc.id} style={styles.row}>
          <View style={styles.icon}>
            <N1Icon name="file" size="md" color="textPrimary" />
          </View>
          <View style={styles.text}>
            <N1Text variant="label" numberOfLines={1}>
              {doc.name}
            </N1Text>
            <N1Text variant="caption" color="secondary">
              {[doc.kind, formatFileSize(doc.sizeBytes)]
                .filter(Boolean)
                .join(' · ')}
            </N1Text>
          </View>
          <N1IconButton
            icon="download"
            size="sm"
            variant="soft"
            accessibilityLabel={ORDER_STRINGS.details.download(doc.name)}
            onPress={() => onDownload(doc)}
          />
        </View>
      ))}
    </View>
  );
});
