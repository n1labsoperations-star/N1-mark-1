import { View } from 'react-native';
import {
  N1Button,
  N1Icon,
  N1Text,
  createN1Styles,
  useN1Styles,
  type N1IconName,
} from '../../../N1Modules';

export type ComingSoonProps = {
  title: string;
  message: string;
  icon?: N1IconName;
  actionLabel?: string;
  onAction?: () => void;
};

const makeStyles = createN1Styles(t => ({
  root: {
    alignItems: 'center',
    gap: t.spacing.md,
    padding: t.spacing.xxxl,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
  },
  icon: {
    padding: t.spacing.lg,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.surfaceMuted,
  },
}));

/** Placeholder for a module that isn't built yet. */
export function ComingSoon({
  title,
  message,
  icon = 'clock',
  actionLabel,
  onAction,
}: ComingSoonProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.root}>
      <View style={styles.icon}>
        <N1Icon name={icon} size="xl" />
      </View>
      <N1Text variant="h2" align="center">
        {title}
      </N1Text>
      <N1Text color="secondary" align="center">
        {message}
      </N1Text>
      {actionLabel && onAction && (
        <N1Button title={actionLabel} variant="secondary" onPress={onAction} />
      )}
    </View>
  );
}
