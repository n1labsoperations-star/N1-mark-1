import {
  MockNotFoundError,
  createMockCollection,
  nextSequentialId,
} from '../../services/mock/mockServer';

type Row = { id: string; name: string };

const make = () =>
  createMockCollection<Row, { name: string }>({
    seed: [{ id: 'R-1', name: 'One' }],
    nextId: rows => nextSequentialId(rows, 'R-'),
    build: (input, id) => ({ id, ...input }),
  });

test('list returns copies callers cannot mutate', async () => {
  const c = make();
  const rows = await c.list();
  rows[0].name = 'changed';
  expect((await c.list())[0].name).toBe('One');
});

test('create, get, update, remove and reset', async () => {
  const c = make();
  const created = await c.create({ name: 'Two' });
  expect(created.id).toBe('R-2');
  expect((await c.get('R-2')).name).toBe('Two');
  expect((await c.update('R-2', { name: 'Deux' })).name).toBe('Deux');
  expect(await c.remove('R-1')).toBe('R-1');
  expect((await c.list()).map(r => r.id)).toEqual(['R-2']);
  c.reset();
  expect((await c.list()).map(r => r.id)).toEqual(['R-1']);
});

test('unknown ids reject with MockNotFoundError', async () => {
  const c = make();
  await expect(c.get('nope')).rejects.toBeInstanceOf(MockNotFoundError);
  await expect(c.update('nope', { name: 'x' })).rejects.toThrow(
    'Record nope was not found',
  );
  await expect(c.remove('nope')).rejects.toBeInstanceOf(MockNotFoundError);
});

test('nextSequentialId pads and ignores unrelated ids', () => {
  expect(
    nextSequentialId(
      [{ id: 'INV-2026-0125' }, { id: 'other' }],
      'INV-2026-',
      4,
    ),
  ).toBe('INV-2026-0126');
  expect(nextSequentialId([], 'X-')).toBe('X-1');
});
