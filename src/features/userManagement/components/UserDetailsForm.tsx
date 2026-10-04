import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import {
  EditableSectionHeader,
  FormRow,
  N1DropDown,
  N1Text,
  N1TextInput,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useForm, useOnSettled, type FormErrors } from '../../../shared/hooks';
import { formatDate, isBlank, isEmail, isPhone } from '../../../shared/utils';
import { ROLE_OPTIONS, STATUS_OPTIONS, USER_STRINGS } from '../constants';
import { useUsers } from '../hooks/useUsers';
import type { AdminUser } from '../types';

const F = USER_STRINGS.fields;
const D = USER_STRINGS.details;

type Values = Pick<
  AdminUser,
  'name' | 'designation' | 'email' | 'phone' | 'department' | 'role' | 'status'
>;

const toValues = (u: AdminUser): Values => ({
  name: u.name,
  designation: u.designation,
  email: u.email,
  phone: u.phone,
  department: u.department,
  role: u.role,
  status: u.status,
});

const validate = (v: Values): FormErrors<Values> => {
  const errors: FormErrors<Values> = {};
  if (isBlank(v.name)) {
    errors.name = COMMON_STRINGS.required;
  }
  if (isBlank(v.email)) {
    errors.email = COMMON_STRINGS.required;
  } else if (!isEmail(v.email)) {
    errors.email = COMMON_STRINGS.invalidEmail;
  }
  if (!isBlank(v.phone) && !isPhone(v.phone)) {
    errors.phone = COMMON_STRINGS.invalidPhone;
  }
  return errors;
};

const makeStyles = createN1Styles(t => ({
  panel: { gap: t.spacing.lg },
  fields: { gap: t.spacing.lg },
  subheading: { marginTop: t.spacing.sm },
}));

type Props = {
  user: AdminUser;
  organizationName: string;
  /** Fields are locked until Edit is pressed. */
  editing: boolean;
  onEdit: () => void;
  /** Cancel, or a successful save: lock the fields again. */
  onDone: () => void;
};

/**
 * User details → Profile: the person's details, role and status as locked
 * fields that Edit unlocks in place (no dialog).
 */
export function UserDetailsForm({
  user,
  organizationName,
  editing,
  onEdit,
  onDone,
}: Props) {
  const styles = useN1Styles(makeStyles);
  const { update, saving, saveError } = useUsers();
  const form = useForm<Values>(toValues(user), validate);
  const { reset, values, errors, bind } = form;
  const locked = !editing;

  // Locked fields always show the saved user; Cancel drops edits.
  useEffect(() => {
    if (!editing) {
      reset(toValues(user));
    }
  }, [editing, user, reset]);

  useOnSettled(saving, saveError, onDone);

  const save = useCallback(
    (v: Values) =>
      update(user.id, {
        ...v,
        name: v.name.trim(),
        designation: v.designation.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        department: v.department.trim(),
      }),
    [user.id, update],
  );

  const text = (
    key: 'name' | 'designation' | 'email' | 'phone' | 'department',
    label: string,
    extra?: Partial<React.ComponentProps<typeof N1TextInput>>,
  ) => (
    <N1TextInput
      label={label}
      value={values[key]}
      onChangeText={bind(key)}
      errorText={errors[key]}
      readOnly={locked}
      testID={`user-details-${key}`}
      {...extra}
    />
  );

  return (
    <View style={styles.panel} testID="user-details-form">
      <EditableSectionHeader
        title={D.personalInfo}
        editing={editing}
        saving={saving}
        onEdit={onEdit}
        onCancel={onDone}
        onSave={form.submit(save)}
        editLabel={USER_STRINGS.a11y.edit(user.name)}
        editTestID="edit-user"
        submitTestID="user-details-submit"
      />
      <View style={styles.fields}>
        <FormRow>
          {text('name', F.name, {
            required: editing,
            placeholder: editing ? F.namePlaceholder : undefined,
          })}
          {text('designation', F.designation, {
            placeholder: editing ? F.designationPlaceholder : undefined,
          })}
        </FormRow>
        <FormRow>
          {text('email', F.email, {
            required: editing,
            placeholder: editing ? F.emailPlaceholder : undefined,
            keyboardType: 'email-address',
            autoCapitalize: 'none',
            autoCorrect: false,
            // Another person's email: don't offer the admin's saved login.
            autoComplete: 'off',
          })}
          {text('phone', D.phone, { keyboardType: 'phone-pad' })}
        </FormRow>
        {text('department', D.department)}

        <N1Text variant="title" weight="bold" style={styles.subheading}>
          {D.account}
        </N1Text>
        <FormRow>
          <N1DropDown
            label={F.role}
            options={ROLE_OPTIONS}
            value={values.role}
            onChange={bind('role')}
            disabled={locked}
            testID="user-details-role"
          />
          <N1DropDown
            label={F.status}
            options={STATUS_OPTIONS}
            value={values.status}
            onChange={bind('status')}
            disabled={locked}
            testID="user-details-status"
          />
        </FormRow>
        <FormRow>
          <N1TextInput
            label={D.organization}
            value={organizationName}
            readOnly
            testID="user-details-organization"
          />
          <N1TextInput
            label={D.joinedLabel}
            value={formatDate(user.joinedAt)}
            readOnly
            testID="user-details-joined"
          />
        </FormRow>
      </View>
      {editing && saveError && (
        <N1Text variant="small" color="danger">
          {saveError}
        </N1Text>
      )}
    </View>
  );
}
