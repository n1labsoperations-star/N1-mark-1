import { useCallback } from 'react';
import { Image, Pressable, View } from 'react-native';
import { pickFiles } from '../../../services/files/pickFiles';
import {
  N1Icon,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import type { Attachment } from '../../../shared/types';
import { formatFileSize } from '../../../shared/utils';
import { USER_STRINGS } from '../constants';
import { useUsers } from '../hooks/useUsers';
import type { AdminUser } from '../types';

const D = USER_STRINGS.details;
const U = D.upload;

const makeStyles = createN1Styles(t => ({
  panel: { gap: t.spacing.lg },
  heading: { gap: t.spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.md },
  item: { width: t.documentTile.size, gap: t.spacing.xs },
  thumb: {
    width: t.documentTile.size,
    height: t.documentTile.size,
    borderRadius: t.radius.md,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  remove: {
    position: 'absolute',
    top: t.spacing.xs,
    right: t.spacing.xs,
    width: t.iconSize.xl,
    height: t.iconSize.xl,
    borderRadius: t.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surface,
    boxShadow: t.shadow.raised,
  },
  add: {
    width: t.documentTile.size,
    height: t.documentTile.size,
    borderRadius: t.radius.md,
    borderWidth: t.borderWidth.hairline,
    borderStyle: 'dashed',
    borderColor: t.colors.textTertiary,
    backgroundColor: t.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.xs,
  },
  pressed: { opacity: t.opacity.pressed },
  disabled: { opacity: t.opacity.disabled },
}));

type Props = { user: AdminUser };

/**
 * User details → Documents: each upload is a small thumbnail (images are
 * previewed), and the dashed Add tile after the last one adds the next.
 */
export function UserDocuments({ user }: Props) {
  const styles = useN1Styles(makeStyles);
  const { update, saving, saveError } = useUsers();
  const files = user.attachments;

  const save = useCallback(
    (attachments: Attachment[]) => update(user.id, { attachments }),
    [user.id, update],
  );

  const upload = useCallback(async () => {
    const picked = await pickFiles(D.documentsKind, D.documentsSample);
    if (picked.length) {
      save([...files, ...picked]);
    }
  }, [files, save]);

  const remove = useCallback(
    (id: string) => save(files.filter(file => file.id !== id)),
    [files, save],
  );

  return (
    <View style={styles.panel} testID="user-documents">
      <View style={styles.heading}>
        <N1Text variant="h3">{D.attachments}</N1Text>
        <N1Text variant="small" color="secondary">
          {files.length ? U.count(files.length) : D.noDocuments}
        </N1Text>
      </View>

      <View style={styles.row}>
        {files.map(file => (
          <View
            key={file.id}
            style={styles.item}
            testID={`user-document-${file.id}`}
          >
            <View style={styles.thumb}>
              {file.uri ? (
                <Image
                  source={{ uri: file.uri }}
                  style={styles.image}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <N1Icon name="file" size="xl" color="textSecondary" />
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={USER_STRINGS.a11y.removeDocument(file.name)}
                onPress={() => remove(file.id)}
                disabled={saving}
                style={({ pressed }) => [
                  styles.remove,
                  pressed && styles.pressed,
                ]}
              >
                <N1Icon name="close" size="sm" color="textPrimary" />
              </Pressable>
            </View>
            <N1Text variant="caption" weight="semiBold" numberOfLines={1}>
              {file.name}
            </N1Text>
            <N1Text variant="caption" color="tertiary">
              {formatFileSize(file.sizeBytes)}
            </N1Text>
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={U.a11y}
          onPress={upload}
          disabled={saving}
          style={({ pressed }) => [
            styles.add,
            pressed && styles.pressed,
            saving && styles.disabled,
          ]}
          testID="user-documents-upload"
        >
          <N1Icon name="plus" size="lg" color="textSecondary" />
          <N1Text variant="caption" weight="semiBold" color="secondary">
            {U.add}
          </N1Text>
        </Pressable>
      </View>

      <N1Text variant="caption" color="tertiary">
        {U.hint}
      </N1Text>
      {saveError && (
        <N1Text variant="small" color="danger">
          {saveError}
        </N1Text>
      )}
    </View>
  );
}
