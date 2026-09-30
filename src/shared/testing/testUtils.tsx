/* eslint-env jest */
// Test-only helpers for rendering admin screens against the real store and mock API.
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import ReactTestRenderer, {
  type ReactTestInstance,
  type ReactTestRenderer as Renderer,
} from 'react-test-renderer';
import { N1ThemeProvider } from '../components';
import { AdminNavigator } from '../../app/navigation/admin/AdminNavigator';
import type {
  AdminRouteName,
  AdminStackParamList,
} from '../../app/navigation/admin/types';
import { customersApi } from '../../features/customers/api/customersApi';
import { invoicesApi, quotesApi } from '../../features/billing/api/billingApi';
import { machinesApi } from '../../features/machines/api/machinesApi';
import { ordersApi } from '../../features/orders/api/ordersApi';
import { profileApi } from '../../features/profile/api/profileApi';
import { userManagementApi } from '../../features/userManagement/api/userManagementApi';
import { createStore } from '../../app/store';

const SAFE_AREA = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

/** Puts every mock collection back to its seed data. */
export function resetMockApis() {
  [
    customersApi,
    invoicesApi,
    quotesApi,
    machinesApi,
    ordersApi,
    profileApi,
    userManagementApi,
  ].forEach(api => api.reset());
}

/** Lets pending mock requests and sagas finish. */
export async function flush(rounds = 5) {
  for (let i = 0; i < rounds; i += 1) {
    await ReactTestRenderer.act(async () => {
      await new Promise<void>(resolve => setTimeout(resolve, 0));
    });
  }
}

export async function render(element: ReactElement): Promise<Renderer> {
  let renderer: Renderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(element);
  });
  await flush();
  return renderer as Renderer;
}

export type AdminHarness = {
  renderer: Renderer;
  root: ReactTestInstance;
  store: ReturnType<typeof createStore>;
  navigate: <R extends AdminRouteName>(
    route: R,
    params?: AdminStackParamList[R],
  ) => Promise<void>;
  currentRoute: () => string | undefined;
};

/** Renders the whole admin module (shell + stack) with a fresh store. */
export async function renderAdmin(
  initialRouteName: AdminRouteName = 'Dashboard',
): Promise<AdminHarness> {
  resetMockApis();
  const store = createStore();
  const navRef = createNavigationContainerRef<AdminStackParamList>();
  const renderer = await render(
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={SAFE_AREA}>
        <N1ThemeProvider>
          <NavigationContainer ref={navRef}>
            <AdminNavigator initialRouteName={initialRouteName} />
          </NavigationContainer>
        </N1ThemeProvider>
      </SafeAreaProvider>
    </Provider>,
  );
  return {
    renderer,
    root: renderer.root,
    store,
    navigate: async (route, params) => {
      await ReactTestRenderer.act(() => {
        // Params are optional for most admin routes.
        (navRef.navigate as (r: string, p?: object) => void)(
          route,
          params as object | undefined,
        );
      });
      await flush();
    },
    currentRoute: () => navRef.getCurrentRoute()?.name,
  };
}

const isHost = (n: ReactTestInstance) => typeof n.type === 'string';

/** Every string rendered in a Text, joined with "|". */
export function allText(root: ReactTestInstance): string {
  return root
    .findAll(n => (n.type as unknown) === 'Text')
    .map(n => n.children.filter(c => typeof c === 'string').join(''))
    .join('|');
}

export function byTestId(
  root: ReactTestInstance,
  testID: string,
): ReactTestInstance {
  const [node] = root.findAll(n => isHost(n) && n.props.testID === testID);
  if (!node) {
    throw new Error(`No element with testID "${testID}"`);
  }
  return node;
}

export const hasTestId = (root: ReactTestInstance, testID: string) =>
  root.findAll(n => isHost(n) && n.props.testID === testID).length > 0;

export function byLabel(
  root: ReactTestInstance,
  label: string,
): ReactTestInstance {
  const [node] = root.findAll(
    n => isHost(n) && n.props.accessibilityLabel === label,
  );
  if (!node) {
    throw new Error(`No element labelled "${label}"`);
  }
  return node;
}

/** The nearest host element with this exact text. */
export function byText(
  root: ReactTestInstance,
  text: string,
): ReactTestInstance {
  const [node] = root.findAll(
    n =>
      (n.type as unknown) === 'Text' &&
      n.children.filter(c => typeof c === 'string').join('') === text,
  );
  if (!node) {
    throw new Error(`No text "${text}"`);
  }
  return node;
}

/** Presses the nearest pressable ancestor of `node`, then lets sagas run. */
export async function press(node: ReactTestInstance) {
  let target: ReactTestInstance | null = node;
  while (target && typeof target.props.onPress !== 'function') {
    target = target.parent;
  }
  if (!target) {
    throw new Error('Nothing pressable here');
  }
  const pressable = target;
  await ReactTestRenderer.act(() => {
    pressable.props.onPress();
  });
  await flush();
}

/** Types into the TextInput inside `node` (a testID'd input or its container). */
export async function typeInto(node: ReactTestInstance, text: string) {
  const input =
    typeof node.props.onChangeText === 'function'
      ? node
      : node.find(n => isHost(n) && typeof n.props.onChangeText === 'function');
  await ReactTestRenderer.act(() => {
    input.props.onChangeText(text);
  });
  await flush();
}

/** Picks an option from an N1DropDown by its label. */
export async function choose(
  root: ReactTestInstance,
  dropdownTestId: string,
  optionLabel: string,
) {
  await press(byTestId(root, dropdownTestId));
  const options = root.findAll(
    n =>
      isHost(n) &&
      n.props.accessibilityRole === 'menuitem' &&
      allText(n) === optionLabel,
  );
  if (!options.length) {
    throw new Error(`No option "${optionLabel}"`);
  }
  await press(options[options.length - 1]);
}
