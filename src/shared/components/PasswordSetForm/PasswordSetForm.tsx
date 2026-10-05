import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  FormRow,
  FormScope,
  N1Button,
  N1Checklist,
  N1Text,
  N1TextInput,
  createN1Styles,
  useN1Styles,
} from '..';
import {
  COMMON_STRINGS,
  NO_AUTOFILL_PASSWORD_PROPS,
  PASSWORD_MASK,
  PASSWORD_STRINGS as S,
} from '../../constants';
import { useForm, useOnSettled, type FormErrors } from '../../hooks';
import { checkPassword } from '../../utils';

export type PasswordSetFormProps = {
  title: string;
  subtitle?: string;
  /** Shows the current password as set (dots) or not set (empty). */
  hasPassword: boolean;
  /** The button that reveals the new-password fields. */
  startLabel?: string;
  saving: boolean;
  error?: string | null;
  onSave: (newPassword: string) => void;
  /** Prefix for test IDs: `${testID}-start`, `-submit`, `-cancel`… */
  testID?: string;
};

type Values = { newPassword: string; confirmPassword: string };

const EMPTY: Values = { newPassword: '', confirmPassword: '' };

const validate = (v: Values): FormErrors<Values> => {
  const errors: FormErrors<Values> = {};
  const rules = checkPassword(v.newPassword, v.confirmPassword);
  if (!rules.minLength || !rules.lettersAndNumbers) {
    errors.newPassword = S.rulesUnmet;
  } else if (!rules.matches) {
    errors.confirmPassword = S.match;
  }
  return errors;
};

const makeStyles = createN1Styles(t => ({
  panel: { gap: t.spacing.lg },
  fields: { gap: t.spacing.lg },
  footer: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
}));

/**
 * The current password shows as set (dots) or not set (empty), locked. The
 * start button reveals a new password and its confirmation, with Cancel /
 * Save (My profile → Security, User details → Security).
 */
export function PasswordSetForm({
  title,
  subtitle,
  hasPassword,
  startLabel,
  saving,
  error,
  onSave,
  testID = 'password-form',
}: PasswordSetFormProps) {
  const styles = useN1Styles(makeStyles);
  // Choosing the new password.
  const [choosing, setChoosing] = useState(false);
  const [changed, setChanged] = useState(false);
  const form = useForm<Values>(EMPTY, validate);
  const { reset, values, errors, bind } = form;

  const start = useCallback(() => {
    setChanged(false);
    setChoosing(true);
  }, []);
  const cancel = useCallback(() => {
    reset(EMPTY);
    setChoosing(false);
  }, [reset]);

  // Saved: locked again, cleared, and say so.
  useOnSettled(saving, error ?? null, () => {
    if (choosing) {
      reset(EMPTY);
      setChoosing(false);
      setChanged(true);
    }
  });

  const rules = useMemo(() => {
    const r = checkPassword(values.newPassword, values.confirmPassword);
    return [
      { label: S.minLength, done: r.minLength },
      { label: S.lettersAndNumbers, done: r.lettersAndNumbers },
      { label: S.match, done: r.matches },
    ];
  }, [values.newPassword, values.confirmPassword]);

  const save = useCallback((v: Values) => onSave(v.newPassword), [onSave]);

  return (
    <View style={styles.panel} testID={testID}>
      <View>
        <N1Text variant="h3">{title}</N1Text>
        {subtitle && (
          <N1Text variant="small" color="secondary">
            {subtitle}
          </N1Text>
        )}
      </View>
      <View style={styles.fields}>
        <N1TextInput
          label={S.current}
          value={hasPassword ? PASSWORD_MASK : ''}
          placeholder={S.noPassword}
          readOnly
          autoComplete="off"
          testID={`${testID}-current`}
        />
        {choosing && (
          // Its own form on web, so Chrome never fills the menu search.
          <FormScope>
            <View style={styles.fields}>
              <FormRow>
                <N1TextInput
                  label={S.newPassword}
                  secure
                  placeholder={S.newPasswordPlaceholder}
                  value={values.newPassword}
                  onChangeText={bind('newPassword')}
                  errorText={errors.newPassword}
                  {...NO_AUTOFILL_PASSWORD_PROPS}
                />
                <N1TextInput
                  label={S.confirmPassword}
                  secure
                  placeholder={S.confirmPasswordPlaceholder}
                  value={values.confirmPassword}
                  onChangeText={bind('confirmPassword')}
                  errorText={errors.confirmPassword}
                  {...NO_AUTOFILL_PASSWORD_PROPS}
                />
              </FormRow>
              <N1Checklist items={rules} />
            </View>
          </FormScope>
        )}
      </View>
      {choosing && error && (
        <N1Text variant="small" color="danger">
          {error}
        </N1Text>
      )}
      <View style={styles.footer}>
        {choosing ? (
          <>
            <N1Button
              title={COMMON_STRINGS.cancel}
              variant="secondary"
              size="sm"
              disabled={saving}
              onPress={cancel}
              testID={`${testID}-cancel`}
            />
            <N1Button
              title={S.save}
              size="sm"
              loading={saving}
              onPress={form.submit(save)}
              testID={`${testID}-submit`}
            />
          </>
        ) : (
          <N1Button
            title={startLabel ?? (hasPassword ? S.update : S.set)}
            size="sm"
            onPress={start}
            testID={`${testID}-start`}
          />
        )}
        {changed && (
          <N1Text variant="small" color="success" testID={`${testID}-changed`}>
            {S.updated}
          </N1Text>
        )}
      </View>
    </View>
  );
}
