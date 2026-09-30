import { N1Table, N1Text } from '../components';
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
