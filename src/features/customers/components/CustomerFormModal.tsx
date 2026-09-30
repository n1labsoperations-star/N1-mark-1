import { useCallback, useEffect } from 'react';
import {
  N1DropDown,
  N1Modal,
  N1RadioGroup,
  N1Text,
  N1TextInput,
} from '../../../N1Modules';
import { FormFooter, FormRow } from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useForm, useOnSettled, type FormErrors } from '../../../shared/hooks';
import { isBlank, isEmail, isPhone } from '../../../shared/utils';
import {
  CUSTOMER_STRINGS,
  CUSTOMER_TYPE_OPTIONS,
  DEFAULT_STATE,
  STATE_OPTIONS,
} from '../constants';
import { useCustomers } from '../hooks/useCustomers';
import type { Customer, CustomerInput } from '../types';

const F = CUSTOMER_STRINGS.form;
const GSTIN_PATTERN = /^[0-9A-Z]{15}$/;

const EMPTY: CustomerInput = {
  type: 'business',
  name: '',
  contactPerson: '',
  mobile: '',
  email: '',
  gstNumber: '',
  address: '',
  city: '',
  state: DEFAULT_STATE,
  notes: '',
};

const toValues = (c?: Customer | null): CustomerInput =>
  c
    ? {
        type: c.type,
        name: c.name,
        contactPerson: c.contactPerson,
        mobile: c.mobile,
        email: c.email,
        gstNumber: c.gstNumber,
        address: c.address,
        city: c.city,
        state: c.state || DEFAULT_STATE,
        notes: c.notes,
      }
    : EMPTY;

export function validateCustomer(v: CustomerInput): FormErrors<CustomerInput> {
  const errors: FormErrors<CustomerInput> = {};
  if (isBlank(v.name)) {
    errors.name = COMMON_STRINGS.required;
  }
  if (isBlank(v.contactPerson)) {
    errors.contactPerson = COMMON_STRINGS.required;
  }
  if (isBlank(v.mobile)) {
    errors.mobile = COMMON_STRINGS.required;
  } else if (!isPhone(v.mobile)) {
    errors.mobile = COMMON_STRINGS.invalidPhone;
  }
  if (!isBlank(v.email) && !isEmail(v.email)) {
    errors.email = COMMON_STRINGS.invalidEmail;
  }
  if (
    !isBlank(v.gstNumber) &&
    !GSTIN_PATTERN.test(v.gstNumber.trim().toUpperCase())
  ) {
    errors.gstNumber = F.gstInvalid;
  }
  return errors;
}

const trimAll = (v: CustomerInput): CustomerInput => ({
  ...v,
  name: v.name.trim(),
  contactPerson: v.contactPerson.trim(),
  mobile: v.mobile.trim(),
  email: v.email.trim(),
  gstNumber: v.gstNumber.trim().toUpperCase(),
  address: v.address.trim(),
  city: v.city.trim(),
  notes: v.notes.trim(),
});

export type CustomerFormModalProps = {
  visible: boolean;
  customer?: Customer | null;
  organizationName: string;
  onClose: () => void;
};

/** Add customer / Edit customer dialog (full screen on phones). */
export function CustomerFormModal({
  visible,
  customer,
  organizationName,
  onClose,
}: CustomerFormModalProps) {
  const isEdit = Boolean(customer);
  const { create, update, saving, saveError, clearErrors } = useCustomers();
  const form = useForm<CustomerInput>(toValues(customer), validateCustomer);
  const { reset, values, errors, bind } = form;

  useEffect(() => {
    if (visible) {
      reset(toValues(customer));
      clearErrors();
    }
  }, [visible, customer, reset, clearErrors]);

  useOnSettled(saving, saveError, onClose);

  const save = useCallback(
    (v: CustomerInput) =>
      customer ? update(customer.id, trimAll(v)) : create(trimAll(v)),
    [customer, create, update],
  );

  return (
    <N1Modal
      visible={visible}
      onClose={onClose}
      size="lg"
      title={isEdit ? F.editTitle : F.addTitle}
      subtitle={
        isEdit
          ? F.editSubtitle(customer?.name ?? '')
          : F.addSubtitle(organizationName)
      }
      footer={
        <FormFooter
          onCancel={onClose}
          submitLabel={isEdit ? COMMON_STRINGS.save : F.submitAdd}
          onSubmit={form.submit(save)}
          loading={saving}
          submitTestID="customer-form-submit"
        />
      }
      testID="customer-form"
    >
      <N1RadioGroup
        label={F.type}
        options={CUSTOMER_TYPE_OPTIONS}
        value={values.type}
        onChange={bind('type')}
      />
      <N1TextInput
        label={F.name}
        required
        placeholder={F.namePlaceholder}
        value={values.name}
        onChangeText={bind('name')}
        errorText={errors.name}
        testID="customer-form-name"
      />
      <N1TextInput
        label={F.contact}
        required
        placeholder={F.contactPlaceholder}
        value={values.contactPerson}
        onChangeText={bind('contactPerson')}
        errorText={errors.contactPerson}
        testID="customer-form-contact"
      />
      <FormRow>
        <N1TextInput
          label={F.mobile}
          required
          placeholder={F.mobilePlaceholder}
          value={values.mobile}
          onChangeText={bind('mobile')}
          errorText={errors.mobile}
          keyboardType="phone-pad"
          testID="customer-form-mobile"
        />
        <N1TextInput
          label={F.email}
          placeholder={F.emailPlaceholder}
          value={values.email}
          onChangeText={bind('email')}
          errorText={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          testID="customer-form-email"
        />
      </FormRow>
      <N1TextInput
        label={F.gst}
        placeholder={F.gstPlaceholder}
        value={values.gstNumber}
        onChangeText={bind('gstNumber')}
        errorText={errors.gstNumber}
        autoCapitalize="characters"
        autoCorrect={false}
        testID="customer-form-gst"
      />
      <N1TextInput
        label={F.address}
        placeholder={F.addressPlaceholder}
        value={values.address}
        onChangeText={bind('address')}
      />
      <FormRow>
        <N1TextInput
          label={F.city}
          placeholder={F.cityPlaceholder}
          value={values.city}
          onChangeText={bind('city')}
        />
        <N1DropDown
          label={F.state}
          options={STATE_OPTIONS}
          value={values.state}
          onChange={bind('state')}
        />
      </FormRow>
      <N1TextInput
        label={F.notes}
        placeholder={F.notesPlaceholder}
        value={values.notes}
        onChangeText={bind('notes')}
        multiline
      />
      {saveError && (
        <N1Text variant="small" color="danger">
          {saveError}
        </N1Text>
      )}
    </N1Modal>
  );
}
