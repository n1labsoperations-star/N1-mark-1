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
import { isBlank, isPhone, isPinCode } from '../../../shared/utils';
import { PROFILE_STRINGS as S } from '../constants';
import { useSession } from '../hooks/useSession';
import { ORGANIZATION_STRINGS, STATE_OPTIONS } from '../organization';
import type { MyProfile } from '../types';

const F = S.fields;

type Values = Pick<
  MyProfile,
  | 'name'
  | 'designation'
  | 'phone'
  | 'address'
  | 'city'
  | 'state'
  | 'pinCode'
  | 'country'
>;

const toValues = (p: MyProfile): Values => ({
  name: p.name,
  designation: p.designation,
  phone: p.phone,
  address: p.address,
  city: p.city,
  state: p.state,
  pinCode: p.pinCode,
  country: p.country,
});

// Same labels and hints as the organization's Address section.
const AF = ORGANIZATION_STRINGS.fields;
const AP = ORGANIZATION_STRINGS.placeholders;

const validate = (v: Values): FormErrors<Values> => {
  const errors: FormErrors<Values> = {};
  if (isBlank(v.name)) {
    errors.name = COMMON_STRINGS.required;
  }
  if (!isBlank(v.phone) && !isPhone(v.phone)) {
    errors.phone = COMMON_STRINGS.invalidPhone;
  }
  if (!isBlank(v.pinCode) && !isPinCode(v.pinCode)) {
    errors.pinCode = ORGANIZATION_STRINGS.errors.pinCode;
  }
  return errors;
};

const makeStyles = createN1Styles(t => ({
  panel: { gap: t.spacing.lg },
  fields: { gap: t.spacing.lg },
  subheading: { marginTop: t.spacing.sm },
}));

type Props = {
  profile: MyProfile;
  /** Fields are locked until Edit is pressed. */
  editing: boolean;
  onEdit: () => void;
  /** Cancel, or a successful save: lock the fields again. */
  onDone: () => void;
};

/**
 * My profile → Account settings: name, designation and phone as locked
 * fields that Edit unlocks. The email is the sign-in and isn't edited here.
 */
export function AccountSettingsForm({
  profile,
  editing,
  onEdit,
  onDone,
}: Props) {
  const styles = useN1Styles(makeStyles);
  const { updateProfile, saving, saveError } = useSession();
  const form = useForm<Values>(toValues(profile), validate);
  const { reset, values, errors, bind } = form;
  const locked = !editing;

  // Locked fields always show the saved profile; Cancel drops edits.
  useEffect(() => {
    if (!editing) {
      reset(toValues(profile));
    }
  }, [editing, profile, reset]);

  useOnSettled(saving, saveError, onDone);

  const save = useCallback(
    (v: Values) =>
      updateProfile({
        name: v.name.trim(),
        designation: v.designation.trim(),
        phone: v.phone.trim(),
        address: v.address.trim(),
        city: v.city.trim(),
        state: v.state,
        pinCode: v.pinCode.trim(),
        country: v.country.trim(),
      }),
    [updateProfile],
  );

  return (
    <View style={styles.panel} testID="profile-form">
      <EditableSectionHeader
        title={S.tabs.account}
        editing={editing}
        saving={saving}
        onEdit={onEdit}
        onCancel={onDone}
        onSave={form.submit(save)}
        editLabel={S.editProfile}
        editTestID="edit-profile"
        submitTestID="profile-form-submit"
      />
      <View style={styles.fields}>
        <FormRow>
          <N1TextInput
            label={F.name}
            required={editing}
            value={values.name}
            onChangeText={bind('name')}
            errorText={errors.name}
            readOnly={locked}
            testID="profile-form-name"
          />
          <N1TextInput
            label={F.designation}
            value={values.designation}
            onChangeText={bind('designation')}
            readOnly={locked}
            testID="profile-form-designation"
          />
        </FormRow>
        <FormRow>
          <N1TextInput
            label={F.phone}
            placeholder={editing ? F.phonePlaceholder : undefined}
            value={values.phone}
            onChangeText={bind('phone')}
            errorText={errors.phone}
            keyboardType="phone-pad"
            readOnly={locked}
            testID="profile-form-phone"
          />
          <N1TextInput
            label={S.email}
            value={profile.email}
            helperText={editing ? S.emailHelp : undefined}
            readOnly
            testID="profile-form-email"
          />
        </FormRow>
        <N1Text variant="title" weight="bold" style={styles.subheading}>
          {S.addressTitle}
        </N1Text>
        <N1TextInput
          label={AF.address}
          placeholder={editing ? AP.address : undefined}
          value={values.address}
          onChangeText={bind('address')}
          multiline
          readOnly={locked}
          testID="profile-form-address"
        />
        <FormRow>
          <N1TextInput
            label={AF.city}
            placeholder={editing ? AP.city : undefined}
            value={values.city}
            onChangeText={bind('city')}
            readOnly={locked}
            testID="profile-form-city"
          />
          <N1DropDown
            label={AF.state}
            options={STATE_OPTIONS}
            value={values.state || null}
            onChange={bind('state')}
            placeholder={editing ? AP.state : ''}
            disabled={locked}
            testID="profile-form-state"
          />
        </FormRow>
        <FormRow>
          <N1TextInput
            label={AF.pinCode}
            placeholder={editing ? AP.pinCode : undefined}
            value={values.pinCode}
            onChangeText={bind('pinCode')}
            errorText={errors.pinCode}
            keyboardType="number-pad"
            maxLength={6}
            readOnly={locked}
            testID="profile-form-pinCode"
          />
          <N1TextInput
            label={AF.country}
            placeholder={editing ? AP.country : undefined}
            value={values.country}
            onChangeText={bind('country')}
            readOnly={locked}
            testID="profile-form-country"
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
