import { useRef } from 'react';

/**
 * `value` while `visible`; once hidden, the last value it had while visible.
 * Closing a dialog usually clears what it shows (e.g. the user being edited)
 * while it's still fading out, which would flash "Create user" for a moment.
 */
export function useHeldWhileVisible<T>(visible: boolean, value: T): T {
  const held = useRef(value);
  if (visible) {
    held.current = value;
  }
  return held.current;
}
