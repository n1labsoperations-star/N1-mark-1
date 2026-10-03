import { useCallback, useEffect, useMemo, useState } from 'react';
import { PAGE_SIZE } from '../../config/constants';

/** Client-side paging for list screens. Returns to page 1 when the list changes size. */
export function usePagination<T>(items: readonly T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(0);
  }, [items.length]);

  const current = Math.min(page, pageCount - 1);
  const pageItems = useMemo(
    () => items.slice(current * pageSize, (current + 1) * pageSize),
    [items, current, pageSize],
  );

  const next = useCallback(
    () => setPage(p => Math.min(p + 1, pageCount - 1)),
    [pageCount],
  );
  const previous = useCallback(() => setPage(p => Math.max(p - 1, 0)), []);
  const goTo = useCallback(
    (target: number) => setPage(Math.max(0, Math.min(target, pageCount - 1))),
    [pageCount],
  );

  return {
    pageItems,
    page: current,
    pageCount,
    hasNext: current < pageCount - 1,
    hasPrevious: current > 0,
    next,
    previous,
    goTo,
    /** Rows shown up to and including this page, for "Showing X of Y". */
    shownCount: Math.min((current + 1) * pageSize, items.length),
    total: items.length,
  };
}
