/**
 * Render and interaction helpers for screen tests. Screens are wrapped in the
 * providers they need; navigation and breakpoints are mocked by each test
 * file (see `screenSize` for the breakpoint mock).
 */

import React from 'react';
import * as RN from 'react-native';
import ReactTestRenderer, {
  type ReactTestInstance,
  type ReactTestRenderer as Renderer,
} from 'react-test-renderer';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { N1ThemeProvider } from '../../theme';
import { createStore, type AppStore } from '../../app/store';

export const WIDE = 1280;
export const PHONE = 390;

/** Set by `render`; read by each test file's useN1Breakpoint mock. */
export const screenSize = { width: WIDE };

/** Pass a store to read its state afterwards (e.g. who signed in). */
export async function render(
  screen: React.ReactElement,
  width: number,
  store: AppStore = createStore(),
) {
  screenSize.width = width;
  let renderer: Renderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <Provider store={store}>
        <SafeAreaProvider
          initialMetrics={
            initialWindowMetrics ?? {
              frame: { x: 0, y: 0, width, height: 800 },
              insets: { top: 0, left: 0, right: 0, bottom: 0 },
            }
          }
        >
          <N1ThemeProvider>{screen}</N1ThemeProvider>
        </SafeAreaProvider>
      </Provider>,
    );
  });
  return (renderer as Renderer).root;
}

export function allText(root: ReactTestInstance): string[] {
  return root
    .findAllByType(RN.Text)
    .map(node => node.props.children)
    .flat()
    .filter((child): child is string => typeof child === 'string');
}

export function findText(root: ReactTestInstance, text: string) {
  return root.findAll(
    node => node.type === RN.Text && node.props.children === text,
  )[0];
}

/** Presses the nearest pressable ancestor of `node`. */
export async function press(node: ReactTestInstance) {
  let target: ReactTestInstance | null = node;
  while (target && typeof target.props.onPress !== 'function') {
    target = target.parent;
  }
  const pressable = target as ReactTestInstance;
  await ReactTestRenderer.act(() => {
    pressable.props.onPress();
  });
}

export function input(root: ReactTestInstance, placeholder: string) {
  return root.findAll(
    node =>
      node.type === RN.TextInput && node.props.placeholder === placeholder,
  )[0];
}

export async function type(
  root: ReactTestInstance,
  placeholder: string,
  value: string,
) {
  await ReactTestRenderer.act(() => {
    input(root, placeholder).props.onChangeText(value);
  });
}
