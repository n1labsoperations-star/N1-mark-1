import type { ReactNode } from 'react';
import { View } from 'react-native';
import {
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';

const makeStyles = createN1Styles(t => ({
  section: { gap: t.spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
}));

/** Uppercase section heading with an optional caption on the right. */
export function BillingSection({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
}) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <N1Text variant="overline">{title}</N1Text>
        {caption && (
          <N1Text variant="caption" color="secondary">
            {caption}
          </N1Text>
        )}
      </View>
      {children}
    </View>
  );
}
