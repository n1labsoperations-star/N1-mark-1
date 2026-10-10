import React, {
  Children,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';

export type N1BottomBarProps = {
  /** One or more buttons; they share the width evenly. */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  bar: {
    backgroundColor: t.colors.surface,
    borderTopWidth: t.borderWidth.hairline,
    borderTopColor: t.colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: t.spacing.md,
    padding: t.spacing.lg,
  },
  slot: { flex: 1 },
}));

const InBottomBar = createContext(false);

/**
 * True inside an N1BottomBar. Its slots already share the width, so buttons
 * there mustn't flex: in a slot (a column) native layout would read `flex: 1`
 * as height and collapse them.
 */
export const useInBottomBar = () => useContext(InBottomBar);

/**
 * Action area pinned to the bottom of a screen
 * (Save changes, Pass / Fail, Start / Stop, Confirm & Start).
 * Buttons inside should use `fullWidth`.
 */
export const N1BottomBar = React.memo(function N1BottomBarComponent({
  children,
  style,
  testID,
}: N1BottomBarProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.bar, style]}
      testID={testID}
    >
      <InBottomBar.Provider value>
        <View style={styles.row}>
          {Children.toArray(children).map((child, index) => (
            <View key={index} style={styles.slot}>
              {child}
            </View>
          ))}
        </View>
      </InBottomBar.Provider>
    </SafeAreaView>
  );
});
N1BottomBar.displayName = 'N1BottomBar';
