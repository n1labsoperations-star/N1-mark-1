import React, { useCallback } from 'react';
import { View } from 'react-native';
import {
  AsyncContent,
  ComingSoon,
  N1Button,
  N1DropDown,
  N1Header,
  N1Text,
  N1TextInput,
  UserScreen,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useForm, useOnSettled, type FormErrors } from '../../../shared/hooks';
import { isBlank } from '../../../shared/utils';
import {
  ORDER_STRINGS,
  SUPPLIER_OPTIONS,
  useOrder,
  type WorkOrder,
} from '../../orders';
import {
  JOBS_STRINGS,
  RAW_MATERIAL_FIELDS,
  SUPPLIER_FIELD,
} from '../constants';
import { useMyJobs } from '../hooks/useMyJobs';
import { useOpenOverTabs } from '../hooks/useOpenOverTabs';
import type { JobsScreenProps, RawMaterialInput } from '../types';
import { isRawMaterialMissing, rawMaterialOf } from '../utils';

const S = JOBS_STRINGS.rawMaterial;

const makeStyles = createN1Styles(t => ({
  heading: { gap: t.spacing.xs },
}));

const validate = (v: RawMaterialInput): FormErrors<RawMaterialInput> => {
  const errors: FormErrors<RawMaterialInput> = {};
  (Object.keys(v) as (keyof RawMaterialInput)[]).forEach(key => {
    if (isBlank(v[key])) {
      errors[key] = COMMON_STRINGS.required;
    }
  });
  return errors;
};

type FormProps = {
  order: WorkOrder;
  header: React.ReactNode;
  /** Called once the job is on My Jobs. */
  onImported: () => void;
};

// Mounted once the order has loaded, so the form starts from its values.
function RawMaterialForm({ order, header, onImported }: FormProps) {
  const styles = useN1Styles(makeStyles);
  const { importJob, importing, importError } = useMyJobs();
  const { values, errors, bind, submit } = useForm(
    rawMaterialOf(order),
    validate,
  );
  const missing = isRawMaterialMissing(order);

  useOnSettled(importing, importError, onImported);

  const save = useCallback(
    (v: RawMaterialInput) =>
      importJob(order.id, {
        rawMaterialGrade: v.rawMaterialGrade.trim(),
        rawMaterialSize: v.rawMaterialSize.trim(),
        heatNumber: v.heatNumber.trim(),
        rmPartNumber: v.rmPartNumber.trim(),
        supplier: v.supplier,
      }),
    [importJob, order.id],
  );

  const workOrder = ORDER_STRINGS.workOrder(order.id);
  return (
    <UserScreen
      header={header}
      footer={
        <N1Button
          title={S.continue}
          leftIcon="arrow-right"
          size="lg"
          fullWidth
          loading={importing}
          onPress={submit(save)}
          testID="raw-material-submit"
        />
      }
      testID="raw-material-screen"
    >
      <View style={styles.heading}>
        <N1Text variant="title" weight="bold">
          {missing ? S.heading : S.confirmHeading}
        </N1Text>
        <N1Text variant="small" color="secondary">
          {missing ? S.help(workOrder) : S.confirmHelp(workOrder)}
        </N1Text>
      </View>
      {RAW_MATERIAL_FIELDS.map(field => (
        <N1TextInput
          key={field.key}
          label={field.label}
          placeholder={field.placeholder}
          value={values[field.key]}
          onChangeText={bind(field.key)}
          errorText={errors[field.key]}
          testID={`raw-material-${field.key}`}
        />
      ))}
      <N1DropDown
        label={SUPPLIER_FIELD.label}
        placeholder={SUPPLIER_FIELD.placeholder}
        options={SUPPLIER_OPTIONS}
        value={values.supplier || null}
        onChange={bind('supplier')}
        errorText={errors.supplier}
        testID="raw-material-supplier"
      />
      {importError && (
        <N1Text variant="small" color="danger">
          {importError}
        </N1Text>
      )}
    </UserScreen>
  );
}

/**
 * Mandatory raw material details, opened as a modal from the order. Continue
 * saves them, creates the job card if needed, adds the job to My Jobs and
 * opens its job card (Back from there returns to My Jobs).
 */
export function RawMaterialScreen({
  route,
  navigation,
}: JobsScreenProps<'RawMaterial'>) {
  const { orderId } = route.params;
  const { order, status, error, reload } = useOrder(orderId);

  const openOverTabs = useOpenOverTabs();
  const openJobCard = useCallback(
    () => openOverTabs('JobCardDetails', { jobCardId: orderId }),
    [openOverTabs, orderId],
  );

  const header = (
    <N1Header
      title={S.title}
      leftIcon="close"
      onLeftPress={() => navigation.goBack()}
    />
  );

  return order ? (
    <RawMaterialForm order={order} header={header} onImported={openJobCard} />
  ) : (
    <UserScreen header={header} testID="raw-material-screen">
      <AsyncContent status={status} error={error} onRetry={reload}>
        <ComingSoon
          icon="package"
          title={S.title}
          message={ORDER_STRINGS.details.notFound}
        />
      </AsyncContent>
    </UserScreen>
  );
}
