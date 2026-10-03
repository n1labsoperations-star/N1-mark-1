import { visiblePages } from '../N1Pagination/N1Pagination';
import { N1Pagination, N1Table } from '..';
import { WIDE, allText, press, render } from '../../testing/render';
import { byLabel } from '../../testing/testUtils';

describe('visiblePages', () => {
  test('lists every page when there are only a few', () => {
    expect(visiblePages(0, 3)).toEqual([0, 1, 2]);
    expect(visiblePages(4, 7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  test('first page: the start, a gap, then the last', () => {
    expect(visiblePages(0, 11)).toEqual([0, 1, 2, 3, null, 10]);
  });
  test('middle page: neighbours, with gaps on both sides', () => {
    expect(visiblePages(5, 11)).toEqual([0, null, 4, 5, 6, null, 10]);
  });
  test('last page: the first, a gap, then the end', () => {
    expect(visiblePages(10, 11)).toEqual([0, null, 7, 8, 9, 10]);
  });
});

test('page numbers jump to a page and mark the current one', async () => {
  const onPageChange = jest.fn();
  const root = await render(
    <N1Pagination
      summary="Showing 10 of 30 users"
      hasPrevious={false}
      hasNext
      onPrevious={jest.fn()}
      onNext={jest.fn()}
      page={0}
      pageCount={3}
      onPageChange={onPageChange}
    />,
    WIDE,
  );
  expect(byLabel(root, 'Page 1').props.accessibilityState.selected).toBe(true);
  await press(byLabel(root, 'Page 3'));
  expect(onPageChange).toHaveBeenCalledWith(2);
});

test('a loading table keeps its top bar and footer around the spinner', async () => {
  const root = await render(
    <N1Table
      columns={[{ key: 'name', title: 'Name' }]}
      data={[]}
      keyExtractor={(r: { id: string }) => r.id}
      loading
      scrollable
      toolbarTitle="All users"
      footer={
        <N1Pagination
          summary="Showing 0 of 0 users"
          hasPrevious={false}
          hasNext={false}
          onPrevious={jest.fn()}
          onNext={jest.fn()}
        />
      }
    />,
    WIDE,
  );
  const text = allText(root);
  expect(text).toEqual(
    expect.arrayContaining(['All users', 'Loading…', 'Showing 0 of 0 users']),
  );
  expect(text).not.toContain('Nothing to show yet.');
});
