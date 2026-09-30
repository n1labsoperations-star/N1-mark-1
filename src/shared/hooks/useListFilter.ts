import { useMemo, useState } from 'react';
import { SEARCH_DEBOUNCE_MS } from '../../config/constants';
import { useDebouncedValue } from './useDebouncedValue';

type Options<T, F extends Record<string, string>> = {
  /**
   * Text searched by the query. Define it outside the component (or memoise
   * it) so the filtered list is only recomputed when the data changes.
   */
  getSearchText: (item: T) => string;
  /** Filter drop-down values; 'all' means "don't filter on this key". */
  initialFilters?: F;
  matchesFilters?: (item: T, filters: F) => boolean;
};

export const ALL = 'all';

/**
 * Search box + filter drop-downs over an in-memory list. The query is
 * debounced so typing stays smooth on long lists.
 */
export function useListFilter<T, F extends Record<string, string>>(
  items: readonly T[],
  { getSearchText, initialFilters, matchesFilters }: Options<T, F>,
) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<F>(() => initialFilters ?? ({} as F));
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    return items.filter(
      item =>
        (!needle || getSearchText(item).toLowerCase().includes(needle)) &&
        (!matchesFilters || matchesFilters(item, filters)),
    );
  }, [items, debouncedQuery, filters, getSearchText, matchesFilters]);

  const setFilter = useMemo(
    () =>
      <K extends keyof F>(key: K, value: F[K]) =>
        setFilters(current => ({ ...current, [key]: value })),
    [],
  );

  return { query, setQuery, filters, setFilter, filtered };
}

/** true when `value` is 'all' or equals `actual`. */
export const matchesOption = (value: string, actual: string) =>
  value === ALL || value === actual;
