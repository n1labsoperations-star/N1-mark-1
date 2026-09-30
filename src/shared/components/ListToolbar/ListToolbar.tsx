import type { ReactNode } from 'react';
import { View } from 'react-native';
import {
  N1DropDown,
  N1TextInput,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
  type N1DropDownOption,
} from '..';
import {
  TOOLBAR_FILTER_MIN_WIDTH,
  TOOLBAR_SEARCH_WIDTH,
} from '../../constants';

export type ListToolbarProps = {
  query: string;
  onQueryChange: (text: string) => void;
  searchPlaceholder: string;
  /** Filter drop-downs (<ToolbarFilter />) and buttons such as Export. */
  children?: ReactNode;
};

const makeStyles = createN1Styles(t => ({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing.md,
  },
  column: { gap: t.spacing.md },
  search: { width: TOOLBAR_SEARCH_WIDTH, maxWidth: '100%' },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing.md,
  },
  filter: { minWidth: TOOLBAR_FILTER_MIN_WIDTH },
}));

/** Search box and filters above a list. */
export function ListToolbar({
  query,
  onQueryChange,
  searchPlaceholder,
  children,
}: ListToolbarProps) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  return (
    <View style={isCompact ? styles.column : styles.row}>
      <N1TextInput
        value={query}
        onChangeText={onQueryChange}
        placeholder={searchPlaceholder}
        accessibilityLabel={searchPlaceholder}
        leftIcon="search"
        autoCapitalize="none"
        autoCorrect={false}
        containerStyle={!isCompact && styles.search}
      />
      {children && <View style={styles.filters}>{children}</View>}
    </View>
  );
}

export type ToolbarFilterProps<T extends string> = {
  options: N1DropDownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Screen-reader label and sheet title, e.g. "Role". */
  label: string;
  testID?: string;
};

/** Label-less pill drop-down for list filters ("All roles"). */
export function ToolbarFilter<T extends string>({
  options,
  value,
  onChange,
  label,
  testID,
}: ToolbarFilterProps<T>) {
  const styles = useN1Styles(makeStyles);
  return (
    <N1DropDown
      options={options}
      value={value}
      onChange={onChange}
      sheetTitle={label}
      containerStyle={styles.filter}
      testID={testID}
    />
  );
}
