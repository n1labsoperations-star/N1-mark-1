import { Children, type ReactNode } from 'react';
import { View } from 'react-native';
import {
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '..';

export type FormRowProps = {
  /** Fields that sit side by side on wide screens and stack on phones. */
  children: ReactNode;
};

const makeStyles = createN1Styles(t => ({
  row: { flexDirection: 'row', gap: t.spacing.md },
  column: { gap: t.spacing.lg },
  cell: { flex: 1 },
}));

export function FormRow({ children }: FormRowProps) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  if (isCompact) {
    return <View style={styles.column}>{children}</View>;
  }
  return (
    <View style={styles.row}>
      {Children.toArray(children).map((child, index) => (
        <View key={index} style={styles.cell}>
          {child}
        </View>
      ))}
    </View>
  );
}
