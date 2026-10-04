import { createContext, useContext, type ReactNode } from 'react';
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
  SEARCH_INPUT_PROPS,
  TOOLBAR_FILTER_MIN_WIDTH,
  TOOLBAR_SEARCH_WIDTH,
} from '../../constants';

export type ListToolbarProps = {
  query: string;
  onQueryChange: (text: string) => void;
  searchPlaceholder: string;
  /** Filter drop-downs (<ToolbarFilter />) and buttons such as Export. */
  children?: ReactNode;
  /** 'end' right-aligns the row, e.g. inside a table's top bar. */
  align?: 'start' | 'end';
  /** Compact grey search and filters, for a table's top bar. */
  filled?: boolean;
};

/** Lets <ToolbarFilter /> match its toolbar's style. */
const ToolbarVariant = createContext<'outline' | 'filled'>('outline');

const makeStyles = createN1Styles(t => ({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing.md,
  },
  end: { justifyContent: 'flex-end' },
  column: { gap: t.spacing.md },
  search: { width: TOOLBAR_SEARCH_WIDTH, maxWidth: '100%' },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  filter: { minWidth: TOOLBAR_FILTER_MIN_WIDTH },
}));

/** Search box and filters above a list. */
export function ListToolbar({
  query,
  onQueryChange,
  searchPlaceholder,
  children,
  align = 'start',
  filled = false,
}: ListToolbarProps) {
  const variant = filled ? 'filled' : 'outline';
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  return (
    <View
      style={
        isCompact ? styles.column : [styles.row, align === 'end' && styles.end]
      }
    >
      <N1TextInput
        value={query}
        onChangeText={onQueryChange}
        placeholder={searchPlaceholder}
        accessibilityLabel={searchPlaceholder}
        leftIcon="search"
        {...SEARCH_INPUT_PROPS}
        variant={variant}
        containerStyle={!isCompact && styles.search}
      />
      {children && (
        <ToolbarVariant.Provider value={variant}>
          <View style={styles.filters}>{children}</View>
        </ToolbarVariant.Provider>
      )}
    </View>
  );
}

export type ToolbarFilterProps<T extends string> = {
  options: N1DropDownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Screen-reader label, e.g. "Role". */
  label: string;
  testID?: string;
};

/** Label-less drop-down for list filters ("All roles"). */
export function ToolbarFilter<T extends string>({
  options,
  value,
  onChange,
  label,
  testID,
}: ToolbarFilterProps<T>) {
  const styles = useN1Styles(makeStyles);
  const variant = useContext(ToolbarVariant);
  return (
    <N1DropDown
      variant={variant}
      options={options}
      value={value}
      onChange={onChange}
      accessibilityLabel={label}
      containerStyle={styles.filter}
      testID={testID}
    />
  );
}
