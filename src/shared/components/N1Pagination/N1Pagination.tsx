import { View, type StyleProp, type ViewStyle } from 'react-native';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1Button } from '../N1Button/N1Button';
import { N1Text } from '../N1Text/N1Text';

export type N1PaginationProps = {
  /** e.g. "Showing 10 of 284 invoices". */
  summary?: string;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  previousLabel?: string;
  nextLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const makeStyles = createN1Styles(t => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: t.spacing.md,
  },
  buttons: { flexDirection: 'row', gap: t.spacing.sm },
}));

export function N1Pagination({
  summary,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  style,
}: N1PaginationProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={[styles.row, style]}>
      <N1Text variant="small" color="secondary">
        {summary}
      </N1Text>
      <View style={styles.buttons}>
        <N1Button
          title={previousLabel}
          variant="secondary"
          size="sm"
          disabled={!hasPrevious}
          onPress={onPrevious}
        />
        <N1Button
          title={nextLabel}
          variant="secondary"
          size="sm"
          disabled={!hasNext}
          onPress={onNext}
        />
      </View>
    </View>
  );
}
