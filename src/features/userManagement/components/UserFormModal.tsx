import { useCallback, useEffect } from 'react';
import { N1DropDown, N1Modal, N1Text, N1TextInput } from '../../../N1Modules';
import { FormFooter, FormRow } from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useForm, useOnSettled, type FormErrors } from '../../../shared/hooks';
import { isBlank, isEmail, isStrongPassword } from '../../../shared/utils';
import { ROLE_OPTIONS, STATUS_OPTIONS, USER_STRINGS } from '../constants';
import { useUsers } from '../hooks/useUsers';
import type { AdminUser, UserInput, UserRole, UserStatus } from '../types';

type FormValues = {
  name: string;
  designation: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

const EMPTY: FormValues = {
  name: '',
  designation: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active',
};

const toValues = (user?: AdminUser | null): FormValues =>
  user
    ? {
        name: user.name,
        designation: user.designation,
        email: user.email,
        password: '',
        role: user.role,
        status: user.status,
      }
    : EMPTY;

const F = USER_STRINGS.fields;

function makeValidator(isEdit: boolean) {
  return (v: FormValues): FormErrors<FormValues> => {
    const errors: FormErrors<FormValues> = {};
    if (isBlank(v.name)) {
      errors.name = COMMON_STRINGS.required;
    }
    if (isBlank(v.email)) {
      errors.email = COMMON_STRINGS.required;
    } else if (!isEmail(v.email)) {
      errors.email = COMMON_STRINGS.invalidEmail;
    }
    if (!isEdit && isBlank(v.password)) {
      errors.password = COMMON_STRINGS.required;
    } else if (!isBlank(v.password) && !isStrongPassword(v.password)) {
      errors.password = F.passwordWeak;
    }
    return errors;
  };
}

const createValidator = makeValidator(false);
const editValidator = makeValidator(true);

export type UserFormModalProps = {
  visible: boolean;
  /** Edit this user; omit to create a new one. */
  user?: AdminUser | null;
  organizationName: string;
  onClose: () => void;
};

/** Create user / Edit user dialog (full screen on phones). */
export function UserFormModal({
  visible,
  user,
  organizationName,
  onClose,
}: UserFormModalProps) {
  const isEdit = Boolean(user);
  const { create, update, saving, saveError, clearErrors } = useUsers();
  const form = useForm<FormValues>(
    toValues(user),
    isEdit ? editValidator : createValidator,
  );
  const { reset } = form;

  // Refill the form each time it opens.
  useEffect(() => {
    if (visible) {
      reset(toValues(user));
      clearErrors();
    }
  }, [visible, user, reset, clearErrors]);

  useOnSettled(saving, saveError, onClose);

  const save = useCallback(
    ({ password, ...values }: FormValues) => {
      const input: UserInput = {
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
        designation: values.designation.trim(),
        ...(isBlank(password) ? {} : { password }),
      };
      if (user) {
        update(user.id, input);
      } else {
        create(input);
      }
    },
    [user, create, update],
  );

  const { values, errors, bind } = form;

  return (
    <N1Modal
      visible={visible}
      onClose={onClose}
      title={isEdit ? USER_STRINGS.editTitle : USER_STRINGS.createTitle}
      subtitle={
        isEdit
          ? USER_STRINGS.editSubtitle
          : USER_STRINGS.createSubtitle(organizationName)
      }
      footer={
        <FormFooter
          onCancel={onClose}
          submitLabel={isEdit ? COMMON_STRINGS.save : USER_STRINGS.createSubmit}
          onSubmit={form.submit(save)}
          loading={saving}
          submitTestID="user-form-submit"
        />
      }
      testID="user-form"
    >
      <N1TextInput
        label={F.name}
        required
        placeholder={F.namePlaceholder}
        value={values.name}
        onChangeText={bind('name')}
        errorText={errors.name}
        testID="user-form-name"
      />
      <N1TextInput
        label={F.designation}
        placeholder={F.designationPlaceholder}
        value={values.designation}
        onChangeText={bind('designation')}
      />
      <N1TextInput
        label={F.email}
        required
        placeholder={F.emailPlaceholder}
        value={values.email}
        onChangeText={bind('email')}
        errorText={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        testID="user-form-email"
      />
      <N1TextInput
        label={F.password}
        required={!isEdit}
        secure
        placeholder={
          isEdit ? F.passwordEditPlaceholder : F.passwordCreatePlaceholder
        }
        helperText={isEdit ? F.passwordEditHelp : F.passwordCreateHelp}
        value={values.password}
        onChangeText={bind('password')}
        errorText={errors.password}
        autoCapitalize="none"
        testID="user-form-password"
      />
      <FormRow>
        <N1DropDown
          label={F.role}
          options={ROLE_OPTIONS}
          value={values.role}
          onChange={bind('role')}
        />
        <N1DropDown
          label={F.status}
          options={STATUS_OPTIONS}
          value={values.status}
          onChange={bind('status')}
        />
      </FormRow>
      {saveError && (
        <N1Text variant="small" color="danger">
          {saveError}
        </N1Text>
      )}
    </N1Modal>
  );
}
