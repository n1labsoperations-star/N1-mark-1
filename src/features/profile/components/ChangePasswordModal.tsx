import { useCallback, useEffect, useMemo } from 'react';
import {
  N1Checklist,
  N1Modal,
  N1Text,
  N1TextInput,
} from '../../../shared/components';
import { FormFooter } from '../../../shared/components';
import { COMMON_STRINGS, PASSWORD_STRINGS } from '../../../shared/constants';
import { useForm, useOnSettled, type FormErrors } from '../../../shared/hooks';
import { checkPassword, isBlank } from '../../../shared/utils';
import { PROFILE_STRINGS } from '../constants';
import { useSession } from '../hooks/useSession';

type Values = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const EMPTY: Values = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};
const F = PROFILE_STRINGS.fields;

const validate = (v: Values): FormErrors<Values> => {
  const errors: FormErrors<Values> = {};
  if (isBlank(v.currentPassword)) {
    errors.currentPassword = COMMON_STRINGS.required;
  }
  const rules = checkPassword(v.newPassword, v.confirmPassword);
  if (!rules.minLength || !rules.lettersAndNumbers) {
    errors.newPassword = PROFILE_STRINGS.passwordRulesUnmet;
  } else if (!rules.matches) {
    errors.confirmPassword = PASSWORD_STRINGS.match;
  }
  return errors;
};

type Props = { visible: boolean; onClose: () => void };

export function ChangePasswordModal({ visible, onClose }: Props) {
  const { changePassword, changingPassword, passwordError } = useSession();
  const form = useForm<Values>(EMPTY, validate);
  const { reset, values, errors, bind } = form;

  useEffect(() => {
    if (visible) {
      reset(EMPTY);
    }
  }, [visible, reset]);

  useOnSettled(changingPassword, passwordError, onClose);

  const rules = useMemo(() => {
    const r = checkPassword(values.newPassword, values.confirmPassword);
    return [
      { label: PASSWORD_STRINGS.minLength, done: r.minLength },
      { label: PASSWORD_STRINGS.lettersAndNumbers, done: r.lettersAndNumbers },
      { label: PASSWORD_STRINGS.match, done: r.matches },
    ];
  }, [values.newPassword, values.confirmPassword]);

  const save = useCallback(
    (v: Values) =>
      changePassword({
        currentPassword: v.currentPassword,
        newPassword: v.newPassword,
      }),
    [changePassword],
  );

  return (
    <N1Modal
      visible={visible}
      onClose={onClose}
      title={PROFILE_STRINGS.passwordTitle}
      subtitle={PROFILE_STRINGS.passwordSubtitle}
      footer={
        <FormFooter
          onCancel={onClose}
          submitLabel={PROFILE_STRINGS.passwordSubmit}
          onSubmit={form.submit(save)}
          loading={changingPassword}
          submitTestID="password-form-submit"
        />
      }
      testID="password-form"
    >
      <N1TextInput
        label={F.currentPassword}
        secure
        placeholder={F.currentPasswordPlaceholder}
        value={values.currentPassword}
        onChangeText={bind('currentPassword')}
        errorText={errors.currentPassword}
        autoCapitalize="none"
      />
      <N1TextInput
        label={F.newPassword}
        secure
        placeholder={F.newPasswordPlaceholder}
        value={values.newPassword}
        onChangeText={bind('newPassword')}
        errorText={errors.newPassword}
        autoCapitalize="none"
      />
      <N1TextInput
        label={F.confirmPassword}
        secure
        placeholder={F.confirmPasswordPlaceholder}
        value={values.confirmPassword}
        onChangeText={bind('confirmPassword')}
        errorText={errors.confirmPassword}
        autoCapitalize="none"
      />
      <N1Checklist items={rules} />
      {passwordError && (
        <N1Text variant="small" color="danger">
          {passwordError}
        </N1Text>
      )}
    </N1Modal>
  );
}
