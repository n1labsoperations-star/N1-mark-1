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
import { useForm, useOnSettled, type FormErrors } from '../../../shared/hooks';
import { isBlank, isPinCode } from '../../../shared/utils';
import { STATE_OPTIONS, USER_STRINGS } from '../constants';
import { useUsers } from '../hooks/useUsers';
import type { AdminUser } from '../types';

const D = USER_STRINGS.details;
const A = D.addressFields;

type Values = Pick<
  AdminUser,
  'address' | 'city' | 'state' | 'pinCode' | 'country'
>;

const toValues = (u: AdminUser): Values => ({
  address: u.address,
  city: u.city,
  state: u.state,
  pinCode: u.pinCode,
  country: u.country,
});

const validate = (v: Values): FormErrors<Values> => {
  const errors: FormErrors<Values> = {};
  if (!isBlank(v.pinCode) && !isPinCode(v.pinCode)) {
    errors.pinCode = A.pinCodeInvalid;
  }
  return errors;
};

const makeStyles = createN1Styles(t => ({
  panel: { gap: t.spacing.lg },
  fields: { gap: t.spacing.lg },
}));

type Props = {
  user: AdminUser;
  /** Fields are locked until Edit is pressed. */
  editing: boolean;
  onEdit: () => void;
  /** Cancel, or a successful save: lock the fields again. */
  onDone: () => void;
};

/** User details → Address details: where the person lives, edited in place. */
export function UserAddressForm({ user, editing, onEdit, onDone }: Props) {
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
        address: v.address.trim(),
        city: v.city.trim(),
        state: v.state,
        pinCode: v.pinCode.trim(),
        country: v.country.trim(),
      }),
    [user.id, update],
  );

  const text = (
    key: 'address' | 'city' | 'pinCode' | 'country',
    label: string,
    placeholder: string,
    extra?: Partial<React.ComponentProps<typeof N1TextInput>>,
  ) => (
    <N1TextInput
      label={label}
      value={values[key]}
      onChangeText={bind(key)}
      errorText={errors[key]}
      readOnly={locked}
      placeholder={editing ? placeholder : undefined}
      testID={`user-address-${key}`}
      {...extra}
    />
  );

  return (
    <View style={styles.panel} testID="user-address-form">
      <EditableSectionHeader
        title={D.sections.address}
        editing={editing}
        saving={saving}
        onEdit={onEdit}
        onCancel={onDone}
        onSave={form.submit(save)}
        editLabel={USER_STRINGS.a11y.edit(user.name)}
        editTestID="edit-user-address"
        submitTestID="user-address-submit"
      />
      <View style={styles.fields}>
        {text('address', A.address, A.addressPlaceholder, { multiline: true })}
        <FormRow>
          {text('city', A.city, A.cityPlaceholder)}
          <N1DropDown
            label={A.state}
            options={STATE_OPTIONS}
            value={values.state}
            onChange={bind('state')}
            placeholder={A.statePlaceholder}
            disabled={locked}
            testID="user-address-state"
          />
        </FormRow>
        <FormRow>
          {text('pinCode', A.pinCode, A.pinCodePlaceholder, {
            keyboardType: 'number-pad',
            maxLength: 6,
          })}
          {text('country', A.country, A.countryPlaceholder)}
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
