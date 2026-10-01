import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * State for an "Are you sure?" delete dialog. Closes itself (and calls
 * `onDeleted`) once the store reports the delete finished without an error.
 *
 * It remembers which id it asked to delete rather than watching for a
 * "deleting" flag to flip, so a very fast response can't be missed.
 */
export function useConfirmDelete<T extends { id: string }>(
  remove: (id: string) => void,
  deletingId: string | null,
  deleteError: string | null,
  onDeleted?: (item: T) => void,
) {
  const [target, setTarget] = useState<T | null>(null);
  const [requested, setRequested] = useState<T | null>(null);
  const onDeletedRef = useRef(onDeleted);
  onDeletedRef.current = onDeleted;

  const request = useCallback((item: T) => setTarget(item), []);
  const cancel = useCallback(() => setTarget(null), []);
  const confirm = useCallback(() => {
    if (target) {
      setRequested(target);
      remove(target.id);
    }
  }, [remove, target]);

  useEffect(() => {
    if (!requested || deletingId === requested.id) {
      return;
    }
    setRequested(null);
    if (!deleteError) {
      setTarget(null);
      onDeletedRef.current?.(requested);
    }
  }, [requested, deletingId, deleteError]);

  return {
    target,
    request,
    cancel,
    confirm,
    loading: requested !== null,
    error: target ? deleteError : null,
  };
}
