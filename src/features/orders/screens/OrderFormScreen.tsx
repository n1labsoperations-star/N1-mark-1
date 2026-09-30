import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  N1Button,
  N1Card,
  N1DropDown,
  N1Divider,
  N1Text,
  N1TextInput,
  N1UploadBox,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
  type N1DropDownOption,
} from '../../../shared/components';
import type { AdminScreenProps } from '../../../app/navigation/admin/types';
import { pickDocument } from '../../../services/files/pickDocument';
import {
  AdminScreen,
  AsyncContent,
  DetailHeader,
  FormFooter,
  FormRow,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useForm, useOnSettled } from '../../../shared/hooks';
import { formatFileSize } from '../../../shared/utils';
import { useCustomers } from '../../customers';
import { StepIndicator } from '../components/StepIndicator';
import {
  formValuesToOrderInput,
  orderToFormValues,
  validateOrderStep1,
  type OrderFormValues,
} from '../components/orderForm';
import { ORDER_STRINGS, PRIORITY_OPTIONS } from '../constants';
import { useOrder } from '../hooks/useOrders';

const F = ORDER_STRINGS.form;

const makeStyles = createN1Styles(t => ({
  section: { gap: t.spacing.lg },
  actions: { flexDirection: 'row', gap: t.spacing.sm },
}));

type Step = 1 | 2;

export function OrderFormScreen({
  route,
  navigation,
}: AdminScreenProps<'OrderForm'>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const orderId = route.params?.orderId;
  const {
    order,
    status,
    error,
    reload,
    create,
    update,
    saving,
    saveError,
    clearErrors,
  } = useOrder(orderId);
  const { items: customers } = useCustomers();
  const [step, setStep] = useState<Step>(1);
  const isEdit = Boolean(orderId);

  const form = useForm<OrderFormValues>(
    orderToFormValues(order),
    validateOrderStep1,
  );
  const { values, errors, bind, setField, reset } = form;

  // Fill the form once the order arrives (deep link / refresh).
  useEffect(() => {
    if (order) {
      reset(orderToFormValues(order));
    }
  }, [order, reset]);

  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  useOnSettled(saving, saveError, goBack);

  const customerOptions = useMemo<N1DropDownOption<string>[]>(
    () => customers.map(c => ({ value: c.id, label: c.name })),
    [customers],
  );

  const chooseCustomer = useCallback(
    (id: string) => {
      setField('customerId', id);
      const customer = customers.find(c => c.id === id);
      if (customer?.email) {
        setField('customerEmail', customer.email);
      }
    },
    [customers, setField],
  );

  const attach = useCallback(
    async (field: 'designFile' | 'purchaseOrder') => {
      const file =
        field === 'designFile'
          ? await pickDocument('Design file', F.designSample)
          : await pickDocument(F.poKind, F.poSample);
      if (file) {
        setField(field, file);
      }
    },
    [setField],
  );

  const goToStep2 = form.submit(() => setStep(2));
  const goToStep1 = useCallback(() => setStep(1), []);

  const save = useCallback(() => {
    const customerName =
      customers.find(c => c.id === values.customerId)?.name ??
      order?.customerName ??
      '';
    const input = formValuesToOrderInput(values, customerName, order);
    if (orderId) {
      update(orderId, input);
    } else {
      create(input);
    }
  }, [customers, values, order, orderId, create, update]);

  const title = `${isEdit ? F.editTitle : F.createTitle} · ${F.step(step)}`;
  const submitLabel = isEdit ? F.submitEdit : F.submitCreate;

  const desktopActions =
    step === 1 ? (
      <View style={styles.actions}>
        <N1Button
          title={COMMON_STRINGS.cancel}
          variant="secondary"
          onPress={goBack}
        />
        <N1Button
          title={F.next}
          rightIcon="arrow-right"
          onPress={goToStep2}
          testID="order-form-next"
        />
      </View>
    ) : (
      <View style={styles.actions}>
        <N1Button
          title={F.back}
          leftIcon="arrow-left"
          variant="secondary"
          onPress={goToStep1}
        />
        <N1Button
          title={submitLabel}
          loading={saving}
          onPress={save}
          testID="order-form-submit"
        />
      </View>
    );

  const compactFooter =
    step === 1 ? (
      <N1Button
        title={F.next}
        rightIcon="arrow-right"
        fullWidth
        onPress={goToStep2}
        testID="order-form-next"
      />
    ) : (
      <FormFooter
        onCancel={goToStep1}
        cancelLabel={F.back}
        submitLabel={submitLabel}
        onSubmit={save}
        loading={saving}
        submitTestID="order-form-submit"
      />
    );

  const header = (
    <DetailHeader
      title={title}
      subtitle={step === 1 ? F.step1Subtitle : F.step2Subtitle}
      onBack={step === 2 && isCompact ? goToStep1 : goBack}
      backIcon={step === 1 && isCompact ? 'close' : 'arrow-left'}
      right={desktopActions}
      compactRight={null}
    />
  );

  if (isEdit && !order) {
    return (
      <AdminScreen header={header} testID="order-form-screen">
        <AsyncContent status={status} error={error} onRetry={reload}>
          <N1Text>{ORDER_STRINGS.details.notFound}</N1Text>
        </AsyncContent>
      </AdminScreen>
    );
  }

  const heading = (text: string) => <N1Text variant="overline">{text}</N1Text>;

  const step1 = (
    <View style={styles.section}>
      {!isCompact && heading(F.customerSection)}
      <FormRow>
        <N1UploadBox
          label={F.designFile}
          hint={isCompact ? F.designHintCompact : F.designHint}
          onPress={() => attach('designFile')}
          fileName={values.designFile?.name}
          fileSize={
            values.designFile
              ? formatFileSize(values.designFile.sizeBytes)
              : undefined
          }
          onRemove={() => setField('designFile', null)}
          testID="order-form-design"
        />
        <N1UploadBox
          label={F.purchaseOrder}
          hint={isCompact ? F.poHintCompact : F.poHint}
          onPress={() => attach('purchaseOrder')}
          fileName={values.purchaseOrder?.name}
          fileSize={
            values.purchaseOrder
              ? formatFileSize(values.purchaseOrder.sizeBytes)
              : undefined
          }
          onRemove={() => setField('purchaseOrder', null)}
        />
      </FormRow>
      <FormRow>
        <N1DropDown
          label={F.customer}
          placeholder={F.customerPlaceholder}
          options={customerOptions}
          value={values.customerId || null}
          onChange={chooseCustomer}
          testID="order-form-customer"
        />
        <N1TextInput
          label={F.customerEmail}
          placeholder={F.customerEmailPlaceholder}
          value={values.customerEmail}
          onChangeText={bind('customerEmail')}
          errorText={errors.customerEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          testID="order-form-email"
        />
      </FormRow>
      {!isCompact && <N1Divider spacing="sm" />}
      {!isCompact && heading(F.orderSection)}
      <FormRow>
        <N1TextInput
          label={F.poNumber}
          placeholder={F.poNumberPlaceholder}
          value={values.poNumber}
          onChangeText={bind('poNumber')}
        />
        <N1TextInput
          label={F.quantity}
          placeholder={F.quantityPlaceholder}
          value={values.quantity}
          onChangeText={bind('quantity')}
          errorText={errors.quantity}
          keyboardType="number-pad"
          testID="order-form-quantity"
        />
      </FormRow>
      <N1TextInput
        label={F.description}
        placeholder={F.descriptionPlaceholder}
        value={values.description}
        onChangeText={bind('description')}
        multiline
        testID="order-form-description"
      />
      <FormRow>
        <N1DropDown
          label={F.priority}
          placeholder={F.priorityPlaceholder}
          options={PRIORITY_OPTIONS}
          value={values.priority || null}
          onChange={bind('priority')}
          testID="order-form-priority"
        />
        <N1TextInput
          label={F.deliveryDate}
          placeholder={F.datePlaceholder}
          value={values.deliveryDate}
          onChangeText={bind('deliveryDate')}
          errorText={errors.deliveryDate}
          keyboardType="numbers-and-punctuation"
          testID="order-form-delivery"
        />
      </FormRow>
      <FormRow>
        <N1TextInput
          label={F.routeCardNo}
          placeholder={F.routeCardPlaceholder}
          value={values.routeCardNo}
          onChangeText={bind('routeCardNo')}
        />
        <N1TextInput
          label={F.dcNo}
          placeholder={F.dcNoPlaceholder}
          value={values.dcNo}
          onChangeText={bind('dcNo')}
        />
      </FormRow>
      <FormRow>
        <N1TextInput
          label={F.dcDate}
          placeholder={F.datePlaceholder}
          value={values.dcDate}
          onChangeText={bind('dcDate')}
          errorText={errors.dcDate}
          keyboardType="numbers-and-punctuation"
        />
        {/* Keeps DC date at half width, as in the design. */}
        <View />
      </FormRow>
    </View>
  );

  const step2 = (
    <View style={styles.section}>
      {!isCompact && heading(F.partSection)}
      <FormRow>
        <N1TextInput
          label={F.partNumber}
          placeholder={F.partNumberPlaceholder}
          value={values.partNumber}
          onChangeText={bind('partNumber')}
          testID="order-form-part-number"
        />
        <N1TextInput
          label={F.drawingNumber}
          placeholder={F.drawingNumberPlaceholder}
          value={values.drawingNumber}
          onChangeText={bind('drawingNumber')}
        />
      </FormRow>
      <FormRow>
        <N1TextInput
          label={F.rmPartNumber}
          placeholder={F.rmPartNumberPlaceholder}
          value={values.rmPartNumber}
          onChangeText={bind('rmPartNumber')}
        />
        <N1TextInput
          label={F.shopOrderNumber}
          placeholder={F.shopOrderPlaceholder}
          value={values.shopOrderNumber}
          onChangeText={bind('shopOrderNumber')}
        />
      </FormRow>
      <FormRow>
        <N1TextInput
          label={F.rawMaterialSize}
          placeholder={F.rawMaterialSizePlaceholder}
          value={values.rawMaterialSize}
          onChangeText={bind('rawMaterialSize')}
        />
        <N1TextInput
          label={F.heatNumber}
          placeholder={F.heatNumberPlaceholder}
          value={values.heatNumber}
          onChangeText={bind('heatNumber')}
        />
      </FormRow>
      <FormRow>
        <N1TextInput
          label={F.projectId}
          placeholder={F.projectIdPlaceholder}
          value={values.projectId}
          onChangeText={bind('projectId')}
        />
        <N1TextInput
          label={F.rawMaterialGrade}
          placeholder={F.rawMaterialGradePlaceholder}
          value={values.rawMaterialGrade}
          onChangeText={bind('rawMaterialGrade')}
        />
      </FormRow>
    </View>
  );

  const body = (
    <>
      {isCompact && step === 2 && (
        <N1Text variant="small" color="secondary">
          {F.step2Subtitle}
        </N1Text>
      )}
      {step === 1 ? step1 : step2}
      {saveError && (
        <N1Text variant="small" color="danger">
          {saveError}
        </N1Text>
      )}
      {!isCompact && (
        <StepIndicator
          step={step}
          total={2}
          label={step === 1 ? F.step1Footer : F.step2Footer}
        />
      )}
    </>
  );

  return (
    <AdminScreen
      header={header}
      compactFooter={compactFooter}
      testID="order-form-screen"
    >
      {isCompact ? body : <N1Card padding="xxl">{body}</N1Card>}
    </AdminScreen>
  );
}
