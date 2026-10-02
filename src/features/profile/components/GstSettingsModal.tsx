import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  FormFooter,
  N1Badge,
  N1Button,
  N1Card,
  N1DropDown,
  N1FieldHelper,
  N1IconButton,
  N1Modal,
  N1Table,
  N1Tabs,
  N1Text,
  N1TextInput,
  createN1Styles,
  useN1Styles,
  type N1TableColumn,
} from '../../../shared/components';
import { COMMON_STRINGS, stateForGstin } from '../../../shared/constants';
import { useForm, useOnSettled } from '../../../shared/hooks';
import {
  formatRate,
  normalizeGstin,
  splitGstRate,
} from '../../../shared/utils';
import {
  GST_STRINGS as S,
  activeTaxRates,
  gstSettingsChanges,
  newTaxRateId,
  toGstSettings,
  validateGstSettings,
  type GstSettings,
} from '../gst';
import { useSession } from '../hooks/useSession';
import { STATE_OPTIONS } from '../organization';
import type { Organization, TaxRate } from '../types';
import { TaxRateModal } from './TaxRateModal';

const makeStyles = createN1Styles(t => ({
  section: { gap: t.spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
  how: { gap: t.spacing.sm },
  howRow: { gap: t.spacing.xxs },
}));

type RegisteredKey = 'yes' | 'no';
const REGISTERED_TABS: { key: RegisteredKey; label: string }[] = [
  { key: 'yes', label: S.yes },
  { key: 'no', label: S.no },
];

/** null: closed. undefined rate: adding. */
type RateEditor = { rate?: TaxRate } | null;

type Props = {
  visible: boolean;
  organization: Organization;
  onClose: () => void;
};

/**
 * GST & Tax Settings: registration, the default rate, the configured rates
 * (CGST / SGST / IGST derived) and how GST is applied on invoices. Nothing
 * is saved until Save Changes.
 */
export function GstSettingsModal({ visible, organization, onClose }: Props) {
  const styles = useN1Styles(makeStyles);
  const { updateOrganization, saving, saveError } = useSession();
  const form = useForm<GstSettings>(
    toGstSettings(organization),
    validateGstSettings,
  );
  const { reset, values, errors, setField, submit } = form;
  const [rateEditor, setRateEditor] = useState<RateEditor>(null);

  useEffect(() => {
    if (visible) {
      reset(toGstSettings(organization));
    }
  }, [visible, organization, reset]);

  useOnSettled(saving, saveError, onClose);

  // Typing a valid GSTIN fills in its state.
  const changeGstin = useCallback(
    (value: string) => {
      setField('gstNumber', value);
      const state = stateForGstin(normalizeGstin(value));
      if (state) {
        setField('gstState', state);
      }
    },
    [setField],
  );

  const saveRate = useCallback(
    (rate: number, active: boolean) => {
      const editing = rateEditor?.rate;
      const rates = editing
        ? values.taxRates.map(r =>
            r.id === editing.id ? { ...r, rate, active } : r,
          )
        : [...values.taxRates, { id: newTaxRateId(), rate, active: true }];
      setField(
        'taxRates',
        [...rates].sort((a, b) => a.rate - b.rate),
      );
      // The default follows an edited rate; it's cleared if switched off.
      if (editing && values.defaultTaxRate === editing.rate) {
        setField('defaultTaxRate', active ? rate : null);
      }
      setRateEditor(null);
    },
    [rateEditor, values.taxRates, values.defaultTaxRate, setField],
  );

  const save = useCallback(
    (v: GstSettings) => updateOrganization(gstSettingsChanges(v)),
    [updateOrganization],
  );

  const defaultOptions = useMemo(
    () =>
      activeTaxRates(values.taxRates).map(rate => ({
        label: formatRate(rate),
        value: rate,
      })),
    [values.taxRates],
  );

  const columns = useMemo<N1TableColumn<TaxRate>[]>(
    () => [
      {
        key: 'rate',
        title: S.columns.rate,
        render: r => <N1Text weight="bold">{formatRate(r.rate)}</N1Text>,
      },
      ...(['cgst', 'sgst', 'igst'] as const).map(key => ({
        key,
        title: S.columns[key],
        render: (r: TaxRate) => (
          <N1Text>{formatRate(splitGstRate(r.rate)[key])}</N1Text>
        ),
      })),
      {
        key: 'status',
        title: S.columns.status,
        flex: 1.2,
        render: r =>
          r.active ? (
            <N1Badge label={S.active} tone="success" dot />
          ) : (
            <N1Badge label={S.inactive} tone="neutral" dot />
          ),
      },
      {
        key: 'action',
        title: S.columns.action,
        flex: 0.8,
        align: 'right',
        interactive: true,
        render: r => (
          <N1IconButton
            icon="edit"
            variant="primary"
            size="sm"
            accessibilityLabel={S.editRateA11y(formatRate(r.rate))}
            onPress={() => setRateEditor({ rate: r })}
            testID={`edit-rate-${r.rate}`}
          />
        ),
      },
    ],
    [],
  );

  const example = values.defaultTaxRate ?? 18;
  const exampleSplit = splitGstRate(example);

  return (
    <>
      <N1Modal
        visible={visible && rateEditor === null}
        onClose={onClose}
        size="lg"
        title={S.title}
        subtitle={S.subtitle}
        footer={
          <FormFooter
            onCancel={onClose}
            submitLabel={COMMON_STRINGS.save}
            onSubmit={submit(save)}
            loading={saving}
            submitTestID="gst-settings-submit"
          />
        }
        testID="gst-settings"
      >
        {/* 1. Registration */}
        <View style={styles.section}>
          <N1Text variant="title" weight="bold">
            {S.registered}
          </N1Text>
          <N1Tabs
            tabs={REGISTERED_TABS}
            value={values.gstRegistered ? 'yes' : 'no'}
            onChange={key => setField('gstRegistered', key === 'yes')}
          />
          {values.gstRegistered ? (
            <>
              <N1TextInput
                label={S.gstin}
                required
                value={values.gstNumber}
                onChangeText={changeGstin}
                placeholder={S.gstinPlaceholder}
                errorText={errors.gstNumber}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={15}
                testID="gst-settings-gstin"
              />
              <N1DropDown
                label={S.state}
                required
                options={STATE_OPTIONS}
                value={values.gstState || null}
                onChange={value => setField('gstState', value)}
                placeholder={S.statePlaceholder}
                helperText={S.stateHelp}
                errorText={errors.gstState}
                testID="gst-settings-state"
              />
            </>
          ) : (
            <N1Text color="secondary" testID="gst-not-applied">
              {S.notApplied}
            </N1Text>
          )}
        </View>

        {values.gstRegistered && (
          <>
            {/* 2. Default rate */}
            <N1DropDown
              label={S.defaultRate}
              required
              options={defaultOptions}
              value={values.defaultTaxRate}
              onChange={value => setField('defaultTaxRate', value)}
              placeholder={S.defaultRatePlaceholder}
              helperText={S.defaultRateHelp}
              errorText={errors.defaultTaxRate}
              testID="gst-settings-default"
            />

            {/* 3. Configured rates */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <N1Text variant="title" weight="bold">
                  {S.configured}
                </N1Text>
                <N1Button
                  title={S.addRate}
                  leftIcon="plus"
                  variant="secondary"
                  size="sm"
                  onPress={() => setRateEditor({})}
                  testID="add-tax-rate"
                />
              </View>
              <N1Table
                columns={columns}
                data={values.taxRates}
                keyExtractor={r => r.id}
                testID="tax-rates-table"
              />
              <N1FieldHelper errorText={errors.taxRates} />
            </View>

            {/* 4. How it's applied */}
            <N1Card title={S.howTitle} icon="info" testID="gst-how">
              <View style={styles.how}>
                <N1Text variant="small" color="secondary">
                  {S.howIntro}
                </N1Text>
                <View style={styles.howRow}>
                  <N1Text weight="semiBold">{S.intra}</N1Text>
                  <N1Text variant="small" color="secondary">
                    {`${S.example(formatRate(example))} → CGST ${formatRate(
                      exampleSplit.cgst,
                    )} + SGST ${formatRate(exampleSplit.sgst)}`}
                  </N1Text>
                </View>
                <View style={styles.howRow}>
                  <N1Text weight="semiBold">{S.inter}</N1Text>
                  <N1Text variant="small" color="secondary">
                    {`${S.example(formatRate(example))} → IGST ${formatRate(
                      exampleSplit.igst,
                    )}`}
                  </N1Text>
                </View>
              </View>
            </N1Card>
          </>
        )}
        {saveError && (
          <N1Text variant="small" color="danger">
            {saveError}
          </N1Text>
        )}
      </N1Modal>
      {/* Shown in place of the settings modal so two dialogs never stack. */}
      <TaxRateModal
        visible={visible && rateEditor !== null}
        rate={rateEditor?.rate}
        rates={values.taxRates}
        onCancel={() => setRateEditor(null)}
        onSave={saveRate}
      />
    </>
  );
}
