import { MOCK_LATENCY_MS } from '../../config/constants';

/**
 * In-memory stand-in for the backend. Each feature's api/ file wraps one of
 * these collections; swap those files for real endpoints when the API lands.
 */

export function delay(ms: number = MOCK_LATENCY_MS): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Resolves with a deep copy, so callers can never mutate the mock store. */
export async function respond<T>(data: T): Promise<T> {
  await delay();
  return structuredCopy(data);
}

export class MockNotFoundError extends Error {
  constructor(id: string) {
    super(`Record ${id} was not found`);
    this.name = 'MockNotFoundError';
  }
}

function structuredCopy<T>(data: T): T {
  return data === undefined ? data : JSON.parse(JSON.stringify(data));
}

type WithId = { id: string };

export type MockCollection<T extends WithId, Input> = {
  list: () => Promise<T[]>;
  get: (id: string) => Promise<T>;
  create: (input: Input) => Promise<T>;
  update: (id: string, changes: Partial<Input>) => Promise<T>;
  remove: (id: string) => Promise<string>;
  /** Restores the seed data (used by tests). */
  reset: () => void;
};

type CollectionOptions<T extends WithId, Input> = {
  seed: readonly T[];
  /** Builds a full record from form input and a freshly generated id. */
  build: (input: Input, id: string) => T;
  /** Generates the next id from the existing ones. */
  nextId: (existing: readonly T[]) => string;
};

export function createMockCollection<T extends WithId, Input>({
  seed,
  build,
  nextId,
}: CollectionOptions<T, Input>): MockCollection<T, Input> {
  let rows: T[] = structuredCopy([...seed]);

  const find = (id: string) => {
    const row = rows.find(r => r.id === id);
    if (!row) {
      throw new MockNotFoundError(id);
    }
    return row;
  };

  return {
    list: () => respond(rows),
    get: async id => {
      await delay();
      return structuredCopy(find(id));
    },
    create: async input => {
      await delay();
      const row = build(input, nextId(rows));
      rows = [row, ...rows];
      return structuredCopy(row);
    },
    update: async (id, changes) => {
      await delay();
      const updated = { ...find(id), ...changes } as T;
      rows = rows.map(r => (r.id === id ? updated : r));
      return structuredCopy(updated);
    },
    remove: async id => {
      await delay();
      find(id);
      rows = rows.filter(r => r.id !== id);
      return id;
    },
    reset: () => {
      rows = structuredCopy([...seed]);
    },
  };
}

/** Next id for records numbered like "WO-1042" / "INV-2026-0125". */
export function nextSequentialId(
  existing: readonly WithId[],
  prefix: string,
  padLength = 0,
): string {
  const max = existing.reduce((highest, { id }) => {
    const n = Number(id.slice(prefix.length));
    return Number.isFinite(n) && n > highest ? n : highest;
  }, 0);
  return `${prefix}${String(max + 1).padStart(padLength, '0')}`;
}

/** ISO timestamp `offsetMs` before now; keeps mock activity feeds "recent". */
export function isoAgo(offsetMs: number): string {
  return new Date(Date.now() - offsetMs).toISOString();
}

export const MINUTE_MS = 60 * 1000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
