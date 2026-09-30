import { useCallback, useEffect } from 'react';
import { N1Modal, N1Text, N1TextInput } from '../../../N1Modules';
import { FormFooter } from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useForm, useOnSettled, type FormErrors } from '../../../shared/hooks';
import { isBlank, isPhone } from '../../../shared/utils';
import { PROFILE_STRINGS } from '../constants';
import { useSession } from '../hooks/useSession';
import type { MyProfile, ProfileInput } from '../types';

const F = PROFILE_STRINGS.fields;

const validate = (v: ProfileInput): FormErrors<ProfileInput> => {
  const errors: FormErrors<ProfileInput> = {};
  if (isBlank(v.name)) {
    errors.name = COMMON_STRINGS.required;
  }
  if (!isBlank(v.phone) && !isPhone(v.phone)) {
    errors.phone = COMMON_STRINGS.invalidPhone;
  }
  return errors;
};

const toValues = (p: MyProfile): ProfileInput => ({
  name: p.name,
  designation: p.designation,
  phone: p.phone,
});

type Props = { visible: boolean; profile: MyProfile; onClose: () => void };

export function EditProfileModal({ visible, profile, onClose }: Props) {
  const { updateProfile, saving, saveError } = useSession();
  const form = useForm<ProfileInput>(toValues(profile), validate);
  const { reset, values, errors, bind } = form;

  useEffect(() => {
    if (visible) {
      reset(toValues(profile));
    }
  }, [visible, profile, reset]);

  useOnSettled(saving, saveError, onClose);

  const save = useCallback(
    (v: ProfileInput) =>
      updateProfile({
        name: v.name.trim(),
        designation: v.designation.trim(),
        phone: v.phone.trim(),
      }),
    [updateProfile],
  );

  return (
    <N1Modal
      visible={visible}
      onClose={onClose}
      title={PROFILE_STRINGS.editTitle}
      subtitle={PROFILE_STRINGS.editSubtitle}
      footer={
        <FormFooter
          onCancel={onClose}
          submitLabel={COMMON_STRINGS.save}
          onSubmit={form.submit(save)}
          loading={saving}
          submitTestID="profile-form-submit"
        />
      }
      testID="profile-form"
    >
      <N1TextInput
        label={F.name}
        required
        value={values.name}
        onChangeText={bind('name')}
        errorText={errors.name}
        testID="profile-form-name"
      />
      <N1TextInput
        label={F.designation}
        value={values.designation}
        onChangeText={bind('designation')}
      />
      <N1TextInput
        label={F.phone}
        placeholder={F.phonePlaceholder}
        value={values.phone}
        onChangeText={bind('phone')}
        errorText={errors.phone}
        keyboardType="phone-pad"
        testID="profile-form-phone"
      />
      {saveError && (
        <N1Text variant="small" color="danger">
          {saveError}
        </N1Text>
      )}
    </N1Modal>
  );
}
