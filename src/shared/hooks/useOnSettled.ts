import { useEffect, useRef } from 'react';

/**
 * Calls `onSuccess` once a pending request finishes without an error — e.g.
 * close a form after the save saga succeeds. The CRUD slices set `saving`
 * synchronously on dispatch, so the pending state always renders first.
 */
export function useOnSettled(
  pending: boolean,
  error: string | null,
  onSuccess: () => void,
) {
  const wasPending = useRef(pending);
  const callback = useRef(onSuccess);
  callback.current = onSuccess;

  useEffect(() => {
    if (wasPending.current && !pending && !error) {
      callback.current();
    }
    wasPending.current = pending;
  }, [pending, error]);
}
