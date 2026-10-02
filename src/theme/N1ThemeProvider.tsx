import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type N1Theme } from './themes';

export type N1ThemeMode = 'system' | 'light' | 'dark';

const N1ThemeContext = createContext<N1Theme>(lightTheme);

type Props = {
  /** 'system' follows the device setting. Defaults to 'light', as in the design. */
  mode?: N1ThemeMode;
  children: ReactNode;
};

export const N1ThemeProvider = React.memo(function N1ThemeProviderComponent({
  mode = 'light',
  children,
}: Props) {
  const scheme = useColorScheme();
  const resolved = mode === 'system' ? scheme ?? 'light' : mode;
  const theme = resolved === 'dark' ? darkTheme : lightTheme;
  return (
    <N1ThemeContext.Provider value={theme}>{children}</N1ThemeContext.Provider>
  );
});
N1ThemeProvider.displayName = 'N1ThemeProvider';

/** The active theme. Without a provider, components fall back to light. */
export function useN1Theme(): N1Theme {
  return useContext(N1ThemeContext);
}

type StyleFactory<T> = (theme: N1Theme) => T;

/** Whatever StyleSheet.create accepts, without naming RN's internal type. */
type N1NamedStyles = Parameters<typeof StyleSheet.create>[0];

const styleCache = new WeakMap<StyleFactory<unknown>, Map<N1Theme, unknown>>();

/**
 * Declare a component's styles once, as a function of the theme:
 *
 *   const makeStyles = createN1Styles(t => ({ box: { padding: t.spacing.lg } }));
 *   const styles = useN1Styles(makeStyles);
 *
 * Results are cached per theme, so every instance shares one StyleSheet.
 */
export function createN1Styles<T extends N1NamedStyles>(
  factory: (theme: N1Theme) => T & N1NamedStyles,
): StyleFactory<Readonly<T>> {
  return theme => StyleSheet.create(factory(theme));
}

export function useN1Styles<T>(factory: StyleFactory<T>): T {
  const theme = useN1Theme();
  return useMemo(() => {
    let byTheme = styleCache.get(factory as StyleFactory<unknown>);
    if (!byTheme) {
      byTheme = new Map();
      styleCache.set(factory as StyleFactory<unknown>, byTheme);
    }
    if (!byTheme.has(theme)) {
      byTheme.set(theme, factory(theme));
    }
    return byTheme.get(theme) as T;
  }, [factory, theme]);
}
