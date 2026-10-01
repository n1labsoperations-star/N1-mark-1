import { useCallback, useMemo, useRef, useState } from 'react';

export type FormErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Minimal form state: values, per-field errors and stable change handlers.
 *
 *   const form = useForm(initial, validate);
 *   <N1TextInput value={form.values.name} onChangeText={form.bind('name')}
 *                errorText={form.errors.name} />
 *   <N1Button onPress={form.submit(save)} />
 */
export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validate?: (values: T) => FormErrors<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const handlers = useRef(new Map<keyof T, (value: never) => void>());

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues(current => ({ ...current, [key]: value }));
    setErrors(current => {
      if (!current[key]) {
        return current;
      }
      const rest = { ...current };
      delete rest[key];
      return rest;
    });
  }, []);

  /** Change handler for one field; the same function every render. */
  const bind = useCallback(
    <K extends keyof T>(key: K): ((value: T[K]) => void) => {
      let handler = handlers.current.get(key);
      if (!handler) {
        handler = (value: never) => setField(key, value);
        handlers.current.set(key, handler);
      }
      return handler as (value: T[K]) => void;
    },
    [setField],
  );

  const runValidation = useCallback(() => {
    const found = validate?.(values) ?? {};
    setErrors(found);
    return Object.keys(found).length === 0;
  }, [validate, values]);

  const submit = useCallback(
    (onValid: (values: T) => void) => () => {
      if (runValidation()) {
        onValid(values);
      }
    },
    [runValidation, values],
  );

  const reset = useCallback((next: T) => {
    setValues(next);
    setErrors({});
  }, []);

  return useMemo(
    () => ({
      values,
      errors,
      setField,
      setValues,
      bind,
      submit,
      validate: runValidation,
      reset,
    }),
    [values, errors, setField, bind, submit, runValidation, reset],
  );
}
