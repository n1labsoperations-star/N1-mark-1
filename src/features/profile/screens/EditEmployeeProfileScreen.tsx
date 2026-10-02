import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AsyncContent,
  N1Avatar,
  N1Button,
  N1DropDown,
  N1Header,
  N1Text,
  N1TextInput,
  UserScreen,
  useN1Styles,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useForm, useOnSettled, type FormErrors } from '../../../shared/hooks';
import {
  isBlank,
  isEmail,
  isPhone,
  notifyUnavailable,
} from '../../../shared/utils';
import {
  DEPARTMENT_OPTIONS,
  EMPLOYEE_PROFILE_STRINGS as S,
  EMPLOYEE_ROLE_LABELS,
  SHIFT_OPTIONS,
} from '../constants';
import { useEmployeeProfile } from '../hooks/useEmployeeProfile';
import type { EmployeeProfile, EmployeeProfileInput } from '../types';
import { makeEmployeeScreenStyles } from './EmployeeProfileScreen';

const F = S.fields;

const validate = (
  v: EmployeeProfileInput,
): FormErrors<EmployeeProfileInput> => {
  const errors: FormErrors<EmployeeProfileInput> = {};
  if (isBlank(v.name)) {
    errors.name = COMMON_STRINGS.required;
  }
  if (isBlank(v.phone)) {
    errors.phone = COMMON_STRINGS.required;
  } else if (!isPhone(v.phone)) {
    errors.phone = COMMON_STRINGS.invalidPhone;
  }
  if (isBlank(v.email)) {
    errors.email = COMMON_STRINGS.required;
  } else if (!isEmail(v.email)) {
    errors.email = COMMON_STRINGS.invalidEmail;
  }
  return errors;
};

const toValues = (p: EmployeeProfile): EmployeeProfileInput => ({
  name: p.name,
  department: p.department,
  shift: p.shift,
  phone: p.phone,
  email: p.email,
});

type FormProps = {
  profile: EmployeeProfile;
  header: React.ReactNode;
  onDone: () => void;
};

// Mounted once the profile has loaded, so the form starts from its values.
function EditEmployeeProfileForm({ profile, header, onDone }: FormProps) {
  const styles = useN1Styles(makeEmployeeScreenStyles);
  const { updateProfile, saving, saveError } = useEmployeeProfile();
  const { values, errors, bind, submit } = useForm(toValues(profile), validate);

  useOnSettled(saving, saveError, onDone);

  const save = useCallback(
    (v: EmployeeProfileInput) =>
      updateProfile({
        name: v.name.trim(),
        department: v.department,
        shift: v.shift,
        phone: v.phone.trim(),
        email: v.email.trim(),
      }),
    [updateProfile],
  );

  return (
    <UserScreen
      testID="edit-employee-profile-screen"
      header={header}
      footer={
        <N1Button
          title={COMMON_STRINGS.save}
          size="lg"
          fullWidth
          loading={saving}
          onPress={submit(save)}
          testID="employee-form-submit"
        />
      }
    >
      <View style={styles.identity}>
        <N1Avatar name={values.name || profile.name} size="lg" />
        <N1Button
          title={S.changePhoto}
          leftIcon="camera"
          variant="secondary"
          size="sm"
          onPress={() => notifyUnavailable(S.changePhoto)}
          style={styles.centered}
        />
      </View>
      <N1TextInput
        label={F.name}
        value={values.name}
        onChangeText={bind('name')}
        errorText={errors.name}
        autoComplete="name"
        testID="employee-form-name"
      />
      <N1TextInput
        label={F.role}
        value={EMPLOYEE_ROLE_LABELS[profile.role]}
        readOnly
      />
      <N1DropDown
        label={F.department}
        options={DEPARTMENT_OPTIONS}
        value={values.department}
        onChange={bind('department')}
        testID="employee-form-department"
      />
      <N1DropDown
        label={F.shift}
        options={SHIFT_OPTIONS}
        value={values.shift}
        onChange={bind('shift')}
        testID="employee-form-shift"
      />
      <N1TextInput
        label={F.phone}
        value={values.phone}
        onChangeText={bind('phone')}
        errorText={errors.phone}
        keyboardType="phone-pad"
        autoComplete="tel"
        testID="employee-form-phone"
      />
      <N1TextInput
        label={F.email}
        value={values.email}
        onChangeText={bind('email')}
        errorText={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        testID="employee-form-email"
      />
      {saveError && (
        <N1Text variant="small" color="danger">
          {saveError}
        </N1Text>
      )}
    </UserScreen>
  );
}

/** Edit Profile, shared by every non-admin role. Opens over the tabs. */
export function EditEmployeeProfileScreen() {
  const navigation = useNavigation();
  const { profile, status, error, reload } = useEmployeeProfile();
  const close = useCallback(() => navigation.goBack(), [navigation]);
  const header = (
    <N1Header title={S.editTitle} leftIcon="close" onLeftPress={close} />
  );

  return profile ? (
    <EditEmployeeProfileForm profile={profile} header={header} onDone={close} />
  ) : (
    <UserScreen header={header} testID="edit-employee-profile-screen">
      <AsyncContent status={status} error={error} onRetry={reload}>
        {null}
      </AsyncContent>
    </UserScreen>
  );
}
