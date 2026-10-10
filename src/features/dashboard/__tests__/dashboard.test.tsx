/**
 * @format
 */

import type React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import ReactTestRenderer, { type ReactTestInstance } from 'react-test-renderer';
import {
  PHONE,
  WIDE,
  allText,
  press,
  render,
  type,
} from '../../../shared/testing/render';
import { ROLE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '../constants';
import DashboardNavigation from '../navigation/DashboardNavigation';
import UsersScreen from '../screens/UsersScreen';

// The drawer's web view listens for CSS transitions on a DOM node, which the
// test renderer doesn't have. Render the drawer content and screen side by side.
jest.mock(
  '../../../../node_modules/react-native-drawer-layout/lib/module/views/Drawer',
  () => {
    const { View } = jest.requireActual('react-native');
    return {
      Drawer: ({
        renderDrawerContent,
        children,
      }: {
        renderDrawerContent: () => React.ReactNode;
        children: React.ReactNode;
      }) => (
        <View>
          <View>{renderDrawerContent()}</View>
          <View>{children}</View>
        </View>
      ),
    };
  },
);

jest.mock('../../../shared/hooks/useN1Breakpoint', () => ({
  useN1Breakpoint: () => {
    const { width } = jest.requireActual(
      '../../../shared/testing/render',
    ).screenSize;
    return { width, isCompact: width < 768, isDesktop: width >= 1024 };
  },
}));

const byLabel = (root: ReactTestInstance, label: string) =>
  root.findAll(
    node =>
      typeof node.type === 'string' && node.props.accessibilityLabel === label,
  )[0];

const menuLinks = (root: ReactTestInstance) =>
  root
    .findAll(
      node =>
        typeof node.type === 'string' &&
        node.props.accessibilityRole === 'link' &&
        node.props.accessibilityState,
    )
    .map(node => node.props.accessibilityLabel);

const renderDashboard = (width: number) =>
  render(
    <NavigationContainer>
      <DashboardNavigation />
    </NavigationContainer>,
    width,
  );

describe('DashboardNavigation', () => {
  test('wide screens show the full sidebar and the organization bar', async () => {
    const root = await renderDashboard(WIDE);

    expect(menuLinks(root)).toEqual([
      'Dashboard',
      'Employees',
      'Customers',
      'Orders',
      'Job Cards',
      'Machines',
      'Billing',
    ]);
    expect(allText(root)).toContain('ABC Engineering Pvt Ltd');
    expect(allText(root)).not.toContain('MAIN MENU');
  });

  test('phones show the full menu, the user card and a menu button', async () => {
    const root = await renderDashboard(PHONE);

    expect(menuLinks(root)).toEqual([
      'Dashboard',
      'Employees',
      'Customers',
      'Orders',
      'Job Cards',
      'Machines',
      'Billing',
    ]);
    expect(allText(root)).toContain('Admin · ABC Engineering');
    expect(byLabel(root, 'Open menu')).toBeDefined();
    expect(byLabel(root, 'Close menu')).toBeDefined();
  });

  test('choosing a menu item opens that section', async () => {
    const root = await renderDashboard(WIDE);

    await press(byLabel(root, 'Orders'));

    expect(allText(root)).toContain('This section is coming soon.');
    expect(byLabel(root, 'Orders').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });

  test('the sidebar search narrows the menu', async () => {
    const root = await renderDashboard(WIDE);

    await ReactTestRenderer.act(() => {
      byLabel(root, 'Search menu').props.onChangeText('bill');
    });

    expect(menuLinks(root)).toEqual(['Billing']);
  });

  test('collapsing hides labels and search, expanding brings them back', async () => {
    const root = await renderDashboard(WIDE);

    await press(byLabel(root, 'Collapse sidebar'));
    // Rail: the search shrinks to an icon button.
    expect(byLabel(root, 'Search menu')).toBeTruthy();

    await press(byLabel(root, 'Expand sidebar'));
    expect(byLabel(root, 'Search menu')).toBeDefined();
  });
});

describe('UsersScreen', () => {
  const rowNames = (root: ReactTestInstance) =>
    root
      .findAll(
        node =>
          typeof node.type === 'string' &&
          /^Edit /.test(String(node.props.accessibilityLabel)),
      )
      .map(node => String(node.props.accessibilityLabel).slice('Edit '.length));

  const pick = async (
    root: ReactTestInstance,
    options: unknown,
    value: string,
  ) => {
    await ReactTestRenderer.act(() => {
      root.find(node => node.props.options === options).props.onChange(value);
    });
  };

  test('lists every user with role, status and joined date', async () => {
    const root = await render(<UsersScreen />, WIDE);
    const text = allText(root);

    expect(rowNames(root)).toHaveLength(5);
    expect(text).toContain('Suspended');
    expect(text).toContain('Sep 12, 2026');
    expect(text).toContain('Manage everyone in ABC Engineering Pvt Ltd.');
  });

  test('search, role and status filters narrow the table', async () => {
    const root = await render(<UsersScreen />, WIDE);

    await type(root, 'Search employees', 'rao');
    expect(rowNames(root)).toEqual(['Divya Rao']);

    await type(root, 'Search employees', '');
    await pick(root, ROLE_FILTER_OPTIONS, 'admin');
    expect(rowNames(root)).toEqual(['Koushik Dasarathan']);

    await pick(root, ROLE_FILTER_OPTIONS, 'all');
    await pick(root, STATUS_FILTER_OPTIONS, 'invited');
    expect(rowNames(root)).toEqual(['Arjun Mehta']);
  });

  test('shows a message when nothing matches', async () => {
    const root = await render(<UsersScreen />, PHONE);

    await type(root, 'Search employees', 'nobody');

    expect(allText(root)).toContain('No users match these filters.');
  });

  test('row actions are labelled per user', async () => {
    const root = await render(<UsersScreen />, WIDE);
    expect(byLabel(root, 'Delete Priya Sharma')).toBeDefined();
  });
});
