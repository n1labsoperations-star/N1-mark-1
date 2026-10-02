import { useCallback, useEffect } from 'react';
import {
  FormFooter,
  N1DropDown,
  N1Modal,
  N1Text,
  N1TextInput,
  N1UploadBox,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useForm, useOnSettled } from '../../../shared/hooks';
import { formatFileSize } from '../../../shared/utils';
import { pickDocument } from '../../../services/files/pickDocument';
import { useSession } from '../hooks/useSession';
import {
  BUSINESS_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
  ORGANIZATION_SECTIONS,
  ORGANIZATION_STRINGS as S,
  PAYMENT_TERMS_OPTIONS,
  STATE_OPTIONS,
  sectionChanges,
  toFormValues,
  validateSection,
  type OrganizationFormValues,
  type OrganizationSection,
} from '../organization';

/** The sections this form edits; GST has its own settings modal. */
type FormSection = Exclude<OrganizationSection, 'gst'>;
import type { Organization } from '../types';

const F = S.fields;
const P = S.placeholders;

type FileField = 'logo' | 'invoiceLogo' | 'signature';

type Props = {
  /** The section being edited; null hides the dialog. */
  section: FormSection | null;
  organization: Organization;
  onClose: () => void;
};

/** Edits one section of the organization (General, Address, …). */
export function EditOrganizationSectionModal({
  section,
  organization,
  onClose,
}: Props) {
  const { updateOrganization, saving, saveError } = useSession();
  const validate = useCallback(
    (v: OrganizationFormValues) => (section ? validateSection(section, v) : {}),
    [section],
  );
  const form = useForm<OrganizationFormValues>(
    toFormValues(organization),
    validate,
  );
  const { reset, values, errors, bind, setField } = form;

  useEffect(() => {
    if (section) {
      reset(toFormValues(organization));
    }
  }, [section, organization, reset]);

  useOnSettled(saving, saveError, onClose);

  const save = useCallback(
    (v: OrganizationFormValues) => {
      if (section) {
        updateOrganization(sectionChanges(section, v));
      }
    },
    [section, updateOrganization],
  );

  const attach = useCallback(
    async (field: FileField) => {
      const file = await pickDocument(F[field], `${field}.png`);
      if (file) {
        setField(field, file);
      }
    },
    [setField],
  );

  const text = (
    key: keyof typeof P & keyof OrganizationFormValues,
    extra?: Partial<React.ComponentProps<typeof N1TextInput>>,
  ) => (
    <N1TextInput
      key={key}
      label={F[key as keyof typeof F]}
      value={values[key] as string}
      onChangeText={bind(key) as (value: string) => void}
      placeholder={P[key]}
      errorText={errors[key]}
      testID={`organization-form-${key}`}
      {...extra}
    />
  );

  const upload = (key: FileField) => {
    const file = values[key];
    return (
      <N1UploadBox
        key={key}
        label={F[key]}
        hint={S.uploadHint}
        onPress={() => attach(key)}
        fileName={file?.name}
        fileSize={file ? formatFileSize(file.sizeBytes) : undefined}
        onRemove={() => setField(key, null)}
        testID={`organization-form-${key}`}
      />
    );
  };

  const fields = () => {
    switch (section) {
      case 'general':
        return (
          <>
            {text('name', { required: true })}
            {upload('logo')}
            {text('phone', { keyboardType: 'phone-pad' })}
            {text('email', {
              required: true,
              keyboardType: 'email-address',
              autoCapitalize: 'none',
            })}
            {text('website', { autoCapitalize: 'none', keyboardType: 'url' })}
          </>
        );
      case 'business':
        return (
          <>
            <N1DropDown
              label={F.businessType}
              options={BUSINESS_TYPE_OPTIONS}
              value={values.businessType || null}
              onChange={bind('businessType')}
              placeholder={P.businessType}
              testID="organization-form-businessType"
            />
            <N1DropDown
              label={F.industry}
              options={INDUSTRY_OPTIONS}
              value={values.industry || null}
              onChange={bind('industry')}
              placeholder={P.industry}
              testID="organization-form-industry"
            />
            {text('registrationDetails')}
          </>
        );
      case 'address':
        return (
          <>
            {text('address', { multiline: true })}
            {text('city')}
            <N1DropDown
              label={F.state}
              options={STATE_OPTIONS}
              value={values.state || null}
              onChange={bind('state')}
              placeholder={P.state}
              testID="organization-form-state"
            />
            {text('pinCode', { keyboardType: 'number-pad', maxLength: 6 })}
            {text('country')}
          </>
        );
      case 'invoice':
        return (
          <>
            {text('invoicePrefix', { autoCapitalize: 'characters' })}
            {text('invoiceStartNumber', {
              required: true,
              keyboardType: 'number-pad',
              helperText: S.help.invoiceStartNumber,
            })}
            <N1DropDown
              label={F.paymentTerms}
              options={PAYMENT_TERMS_OPTIONS}
              value={values.paymentTerms || null}
              onChange={bind('paymentTerms')}
              placeholder={P.paymentTerms}
              testID="organization-form-paymentTerms"
            />
            {text('invoiceFooter', { multiline: true })}
          </>
        );
      case 'documents':
        return (
          <>
            {upload('invoiceLogo')}
            {text('termsAndConditions', { multiline: true })}
            {upload('signature')}
          </>
        );
      default:
        return null;
    }
  };

  const title = ORGANIZATION_SECTIONS.find(s => s.key === section)?.title ?? '';
  return (
    <N1Modal
      visible={section !== null}
      onClose={onClose}
      title={S.edit(title)}
      subtitle={S.editSubtitle}
      footer={
        <FormFooter
          onCancel={onClose}
          submitLabel={COMMON_STRINGS.save}
          onSubmit={form.submit(save)}
          loading={saving}
          submitTestID="organization-form-submit"
        />
      }
      testID="organization-form"
    >
      {fields()}
      {saveError && (
        <N1Text variant="small" color="danger">
          {saveError}
        </N1Text>
      )}
    </N1Modal>
  );
}
