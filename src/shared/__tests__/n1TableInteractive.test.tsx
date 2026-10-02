import ReactTestRenderer from 'react-test-renderer';
import { N1Table, N1Text, lightTheme } from '../components';
import { render } from '../testing/testUtils';

let mockWidth = 1280;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 900, scale: 1, fontScale: 1 }),
}));

const rows = [{ id: '1', name: 'Row' }];
const rowRoles = async (interactive: boolean) => {
  const r = await render(
    <N1Table
      columns={[
        { key: 'name', title: 'Name' },
        {
          key: 'a',
          title: '',
          interactive,
          render: () => <N1Text>act</N1Text>,
        },
      ]}
      data={rows}
      keyExtractor={row => row.id}
      onRowPress={() => undefined}
    />,
  );
  return r.root
    .findAll(
      n =>
        (typeof n.type === 'string' && typeof n.props.onClick === 'function') ||
        (typeof n.type === 'string' && n.props.accessibilityRole === 'button'),
    )
    .map(n => n.props.accessibilityRole);
};

test.each([1280, 390])(
  'rows with interactive cells are not buttons (width %i)',
  async width => {
    mockWidth = width;
    expect(await rowRoles(false)).toContain('button');
    expect(await rowRoles(true)).not.toContain('button');
  },
);

test.each([true, false])(
  'rows turn light grey on hover (clickable: %s)',
  async clickable => {
    mockWidth = 1280;
    const r = await render(
      <N1Table
        columns={[{ key: 'name', title: 'Name' }]}
        data={rows}
        keyExtractor={row => row.id}
        onRowPress={clickable ? () => undefined : undefined}
      />,
    );
    // The row Pressable, and the view it renders (which holds the style).
    const row = () => r.root.find(n => typeof n.props.onHoverIn === 'function');
    const background = () =>
      [row().findAll(n => typeof n.type === 'string')[0].props.style]
        .flat(Infinity)
        .reduce(
          (color: unknown, s: { backgroundColor?: string } | undefined) =>
            s?.backgroundColor ?? color,
          undefined,
        );

    expect(background()).toBeUndefined();
    await ReactTestRenderer.act(() => row().props.onHoverIn({}));
    expect(background()).toBe(lightTheme.colors.background);
    await ReactTestRenderer.act(() => row().props.onHoverOut({}));
    expect(background()).toBeUndefined();
  },
);
