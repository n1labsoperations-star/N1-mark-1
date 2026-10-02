import React from 'react';
import type { ReactNode } from 'react';
import { Modal, View } from 'react-native';
import { N1Icon, type N1IconName } from '../N1Icon/N1Icon';
import {
  createN1Styles,
  useN1Styles,
  useN1Theme,
} from '../../../theme/N1ThemeProvider';
import { N1Button } from '../N1Button/N1Button';
import { N1Text } from '../N1Text/N1Text';

export type N1ConfirmDialogProps = {
  visible: boolean;
  title: string;
  /** Pass nodes to bold part of the message, e.g. the customer name. */
  message?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** 'danger' gives a red icon and button (delete actions). */
  tone?: 'danger' | 'primary';
  icon?: N1IconName;
  /** Shows a spinner on the confirm button while the action runs. */
  loading?: boolean;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  backdrop: {
    flex: 1,
    backgroundColor: t.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: t.spacing.xxl,
  },
  dialog: {
    width: '100%',
    maxWidth: t.modalWidth.sm,
    alignItems: 'center',
    gap: t.spacing.md,
    padding: t.spacing.xxl,
    borderRadius: t.radius.xl,
    backgroundColor: t.colors.surface,
    boxShadow: t.shadow.modal,
  },
  iconCircle: {
    width: t.controlHeight.lg + t.spacing.xs,
    height: t.controlHeight.lg + t.spacing.xs,
    borderRadius: t.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: t.spacing.md,
    marginTop: t.spacing.sm,
  },
  button: { flex: 1 },
}));

/** "Are you sure?" dialog (e.g. Delete customer). */
export const N1ConfirmDialog = React.memo(function N1ConfirmDialogComponent({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  tone = 'danger',
  icon = tone === 'danger' ? 'trash' : 'info',
  loading = false,
  testID,
}: N1ConfirmDialogProps) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  const toneColors =
    theme.colors.tone[tone === 'danger' ? 'danger' : 'neutral'];
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      testID={testID}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityRole="alert">
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: toneColors.background },
            ]}
          >
            <N1Icon name={icon} size="lg" tintColor={toneColors.foreground} />
          </View>
          <N1Text variant="h2" align="center">
            {title}
          </N1Text>
          {message !== undefined && (
            <N1Text color="secondary" align="center">
              {message}
            </N1Text>
          )}
          <View style={styles.footer}>
            <N1Button
              title={cancelLabel}
              variant="secondary"
              style={styles.button}
              disabled={loading}
              onPress={onCancel}
            />
            <N1Button
              title={confirmLabel}
              variant={tone}
              style={styles.button}
              loading={loading}
              onPress={onConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
});
N1ConfirmDialog.displayName = 'N1ConfirmDialog';
