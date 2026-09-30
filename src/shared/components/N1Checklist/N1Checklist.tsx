import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { N1Icon } from '../N1Icon/N1Icon';
import {
  createN1Styles,
  useN1Styles,
  useN1Theme,
} from '../../../theme/N1ThemeProvider';
import { N1Text } from '../N1Text/N1Text';

export type N1ChecklistItem = {
  label: string;
  done: boolean;
};

export type N1ChecklistProps = {
  items: N1ChecklistItem[];
  style?: StyleProp<ViewStyle>;
};

const makeStyles = createN1Styles(t => ({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: t.spacing.lg,
    rowGap: t.spacing.xs,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs },
}));

/** Live rule checks under a field, e.g. password requirements. */
export const N1Checklist = React.memo(function N1ChecklistComponent({
  items,
  style,
}: N1ChecklistProps) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  return (
    <View style={[styles.list, style]}>
      {items.map(item => (
        <View
          key={item.label}
          style={styles.item}
          accessibilityLabel={`${item.label}: ${
            item.done ? 'done' : 'not yet'
          }`}
        >
          <N1Icon
            name="check"
            size="sm"
            tintColor={
              item.done
                ? theme.colors.tone.success.solid
                : theme.colors.textTertiary
            }
          />
          <N1Text variant="caption" color={item.done ? 'success' : 'secondary'}>
            {item.label}
          </N1Text>
        </View>
      ))}
    </View>
  );
});
N1Checklist.displayName = 'N1Checklist';
