import { useCallback, useMemo, useState } from 'react';
import type { LineItem, LineItemDraft } from '../types';
import { fromDraft, isEmptyDraft, newDraft, toDraft } from '../utils';

type DraftField = Exclude<keyof LineItemDraft, 'id'>;

/**
 * Editable process-operation rows. Handlers are stable, so each memoised row
 * only re-renders when its own values change.
 */
export function useLineItems(initial: readonly LineItem[]) {
  const [drafts, setDrafts] = useState<LineItemDraft[]>(() =>
    initial.map(toDraft),
  );

  const change = useCallback((id: string, field: DraftField, value: string) => {
    setDrafts(rows =>
      rows.map(r => (r.id === id ? { ...r, [field]: value } : r)),
    );
  }, []);
  const add = useCallback(() => setDrafts(rows => [...rows, newDraft()]), []);
  const remove = useCallback(
    (id: string) => setDrafts(rows => rows.filter(r => r.id !== id)),
    [],
  );
  const reset = useCallback(
    (items: readonly LineItem[]) => setDrafts(items.map(toDraft)),
    [],
  );

  /** Saved rows: blanks dropped, numbers parsed. */
  const items = useMemo(
    () => drafts.filter(d => !isEmptyDraft(d)).map(fromDraft),
    [drafts],
  );

  return { drafts, items, change, add, remove, reset };
}

export type LineItemsController = ReturnType<typeof useLineItems>;
