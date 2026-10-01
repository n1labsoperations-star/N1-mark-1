import ReactTestRenderer from 'react-test-renderer';
import {
  useConfirmDelete,
  useDebouncedValue,
  useForm,
  useListFilter,
  useOnSettled,
  usePagination,
  useToggle,
  matchesOption,
} from '../hooks';

/** Renders a hook and returns a live view of its latest result. */
function renderHook<P, R>(hook: (props: P) => R, initialProps: P) {
  const result = { current: undefined as unknown as R };
  function Probe({ props }: { props: P }) {
    result.current = hook(props);
    return null;
  }
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<Probe props={initialProps} />);
  });
  return {
    result,
    rerender: (props: P) =>
      ReactTestRenderer.act(() => renderer.update(<Probe props={props} />)),
    act: (fn: () => void) => ReactTestRenderer.act(fn),
  };
}

type Item = { name: string; kind: string };
const ITEMS: Item[] = [
  { name: 'Alpha', kind: 'a' },
  { name: 'Beta', kind: 'b' },
  { name: 'Gamma', kind: 'a' },
];
const text = (i: Item) => i.name;
const byKind = (i: Item, f: { kind: string }) => matchesOption(f.kind, i.kind);

test('useListFilter searches and filters', () => {
  const h = renderHook(
    items =>
      useListFilter(items, {
        getSearchText: text,
        initialFilters: { kind: 'all' },
        matchesFilters: byKind,
      }),
    ITEMS,
  );
  expect(h.result.current.filtered).toHaveLength(3);
  h.act(() => h.result.current.setQuery('a'));
  expect(h.result.current.filtered.map(i => i.name)).toEqual([
    'Alpha',
    'Beta',
    'Gamma',
  ]);
  h.act(() => h.result.current.setQuery('gam'));
  expect(h.result.current.filtered.map(i => i.name)).toEqual(['Gamma']);
  h.act(() => h.result.current.setQuery(''));
  h.act(() => h.result.current.setFilter('kind', 'a'));
  expect(h.result.current.filtered.map(i => i.name)).toEqual([
    'Alpha',
    'Gamma',
  ]);
});

test('useListFilter works without filters', () => {
  const h = renderHook(
    items => useListFilter(items, { getSearchText: text }),
    ITEMS,
  );
  expect(h.result.current.filters).toEqual({});
  expect(h.result.current.filtered).toHaveLength(3);
});

test('usePagination pages and resets when the list shrinks', () => {
  const many = Array.from({ length: 25 }, (_, i) => i);
  const h = renderHook(items => usePagination(items, 10), many);
  expect(h.result.current).toMatchObject({
    page: 0,
    pageCount: 3,
    hasNext: true,
    hasPrevious: false,
    shownCount: 10,
    total: 25,
  });
  h.act(() => h.result.current.next());
  h.act(() => h.result.current.next());
  h.act(() => h.result.current.next());
  expect(h.result.current).toMatchObject({
    page: 2,
    hasNext: false,
    shownCount: 25,
  });
  expect(h.result.current.pageItems).toEqual([20, 21, 22, 23, 24]);
  h.act(() => h.result.current.previous());
  expect(h.result.current.page).toBe(1);
  h.rerender(many.slice(0, 5));
  expect(h.result.current).toMatchObject({
    page: 0,
    pageCount: 1,
    pageItems: [0, 1, 2, 3, 4],
  });
  h.rerender([]);
  expect(h.result.current).toMatchObject({ pageCount: 1, shownCount: 0 });
});

test('useForm binds fields, validates and clears errors', () => {
  const validate = (v: { name: string }) =>
    v.name ? {} : { name: 'Required' };
  const onValid = jest.fn();
  const h = renderHook(() => useForm({ name: '' }, validate), undefined);
  const bindA = h.result.current.bind('name');
  h.act(() => h.result.current.submit(onValid)());
  expect(onValid).not.toHaveBeenCalled();
  expect(h.result.current.errors.name).toBe('Required');
  h.act(() => bindA('Priya'));
  expect(h.result.current.bind('name')).toBe(bindA);
  expect(h.result.current.errors.name).toBeUndefined();
  h.act(() => h.result.current.submit(onValid)());
  expect(onValid).toHaveBeenCalledWith({ name: 'Priya' });
  h.act(() => h.result.current.reset({ name: 'x' }));
  expect(h.result.current.values.name).toBe('x');
  let valid = false;
  h.act(() => {
    valid = h.result.current.validate();
  });
  expect(valid).toBe(true);
});

test('useForm without a validator always submits', () => {
  const onValid = jest.fn();
  const h = renderHook(() => useForm({ a: 1 }), undefined);
  h.act(() => h.result.current.setField('a', 2));
  h.act(() => h.result.current.submit(onValid)());
  expect(onValid).toHaveBeenCalledWith({ a: 2 });
});

test('useOnSettled fires only after a successful request', () => {
  const onSuccess = jest.fn();
  type P = { pending: boolean; error: string | null };
  const h = renderHook(
    ({ pending, error }: P) => useOnSettled(pending, error, onSuccess),
    {
      pending: false,
      error: null,
    } as P,
  );
  h.rerender({ pending: true, error: null });
  h.rerender({ pending: false, error: 'failed' });
  expect(onSuccess).not.toHaveBeenCalled();
  h.rerender({ pending: true, error: null });
  h.rerender({ pending: false, error: null });
  expect(onSuccess).toHaveBeenCalledTimes(1);
});

test('useToggle', () => {
  const h = renderHook(() => useToggle(), undefined);
  h.act(() => h.result.current[1]());
  expect(h.result.current[0]).toBe(true);
  h.act(() => h.result.current[3]());
  expect(h.result.current[0]).toBe(false);
  h.act(() => h.result.current[3]());
  h.act(() => h.result.current[2]());
  expect(h.result.current[0]).toBe(false);
});

test('useDebouncedValue waits before updating', () => {
  jest.useFakeTimers();
  const h = renderHook(
    ({ v, ms }: { v: string; ms: number }) => useDebouncedValue(v, ms),
    { v: 'a', ms: 100 },
  );
  h.rerender({ v: 'b', ms: 100 });
  expect(h.result.current).toBe('a');
  h.act(() => {
    jest.advanceTimersByTime(100);
  });
  expect(h.result.current).toBe('b');
  h.rerender({ v: 'c', ms: 0 });
  expect(h.result.current).toBe('c');
  jest.useRealTimers();
});

test('useConfirmDelete opens, confirms and closes after success', () => {
  const remove = jest.fn();
  const onDeleted = jest.fn();
  const item = { id: 'x' };
  type P = { deletingId: string | null; error: string | null };
  const h = renderHook(
    ({ deletingId, error }: P) =>
      useConfirmDelete(remove, deletingId, error, onDeleted),
    { deletingId: null, error: null } as P,
  );
  h.act(() => h.result.current.confirm());
  expect(remove).not.toHaveBeenCalled();
  h.act(() => h.result.current.request(item));
  expect(h.result.current.target).toBe(item);
  // The real store marks the id as deleting during dispatch.
  remove.mockImplementation(() => h.rerender({ deletingId: 'x', error: null }));
  h.act(() => h.result.current.confirm());
  expect(remove).toHaveBeenCalledWith('x');
  expect(h.result.current.loading).toBe(true);
  expect(onDeleted).not.toHaveBeenCalled();
  h.rerender({ deletingId: null, error: null });
  expect(h.result.current.target).toBeNull();
  expect(onDeleted).toHaveBeenCalledWith(item);
  h.act(() => h.result.current.request(item));
  h.act(() => h.result.current.cancel());
  expect(h.result.current.target).toBeNull();
});

test('useConfirmDelete keeps the dialog open when the delete fails', () => {
  const remove = jest.fn();
  const onDeleted = jest.fn();
  type P = { deletingId: string | null; error: string | null };
  const h = renderHook(
    ({ deletingId, error }: P) =>
      useConfirmDelete(remove, deletingId, error, onDeleted),
    {
      deletingId: null,
      error: null,
    } as P,
  );
  remove.mockImplementation(() => h.rerender({ deletingId: 'y', error: null }));
  h.act(() => h.result.current.request({ id: 'y' }));
  h.act(() => h.result.current.confirm());
  h.rerender({ deletingId: null, error: 'locked' });
  expect(h.result.current).toMatchObject({
    loading: false,
    error: 'locked',
    target: { id: 'y' },
  });
  expect(onDeleted).not.toHaveBeenCalled();
});
