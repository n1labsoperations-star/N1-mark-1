import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import {
  N1Card,
  N1Divider,
  N1DropDown,
  N1Text,
  N1TextInput,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../N1Modules';
import type { AdminScreenProps } from '../../../app/navigation/admin/types';
import {
  AdminScreen,
  AsyncContent,
  ComingSoon,
  DetailHeader,
  FormFooter,
  FormRow,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useForm, useOnSettled, type FormErrors } from '../../../shared/hooks';
import { isBlank, isNumeric, toNumber } from '../../../shared/utils';
import { BillingSection } from '../components/BillingSection';
import { LineItemsEditor } from '../components/LineItemsEditor';
import { TotalsSummary } from '../components/TotalsSummary';
import { BILLING_STRINGS, QUOTE_STATUS_OPTIONS } from '../constants';
import { useQuote } from '../hooks/useBilling';
import { useLineItems } from '../hooks/useLineItems';
import type { LineItem, Quote, QuoteStatus } from '../types';
import { calculateTotals } from '../utils';

const Q = BILLING_STRINGS.quote;
const L = BILLING_STRINGS.lineItems;

type Values = {
  customerName: string;
  partName: string;
  quantity: string;
  material: string;
  status: QuoteStatus;
};

const EMPTY: Values = {
  customerName: '',
  partName: '',
  quantity: '',
  material: '',
  status: 'draft',
};

// New quotes start with the shop's usual turning sequence, as in the design.
const STARTER_LINES: LineItem[] = [
  {
    id: 'new-1',
    operation: 'Facing',
    description: '',
    minutesPerPiece: 0,
    ratePerMinute: 0,
  },
  {
    id: 'new-2',
    operation: 'Turning',
    description: '',
    minutesPerPiece: 0,
    ratePerMinute: 0,
  },
];

const toValues = (q?: Quote): Values =>
  q
    ? {
        customerName: q.customerName,
        partName: q.partName,
        quantity: String(q.quantity),
        material: q.material,
        status: q.status,
      }
    : EMPTY;

const validate = (v: Values): FormErrors<Values> => {
  const errors: FormErrors<Values> = {};
  if (isBlank(v.customerName)) {
    errors.customerName = COMMON_STRINGS.required;
  }
  if (isBlank(v.partName)) {
    errors.partName = COMMON_STRINGS.required;
  }
  if (!isNumeric(v.quantity) || Number(v.quantity) <= 0) {
    errors.quantity = COMMON_STRINGS.invalidNumber;
  }
  return errors;
};

const makeStyles = createN1Styles(t => ({
  body: { gap: t.spacing.lg },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.sm,
  },
}));

export function QuoteFormScreen({
  route,
  navigation,
}: AdminScreenProps<'QuoteForm'>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const quoteId = route.params?.quoteId;
  const {
    quote,
    status,
    error,
    reload,
    create,
    update,
    saving,
    saveError,
    clearErrors,
  } = useQuote(quoteId);
  const form = useForm<Values>(toValues(quote), validate);
  const lines = useLineItems(quote?.lineItems ?? STARTER_LINES);
  const { values, errors, bind, submit, reset } = form;

  const { reset: resetLines } = lines;
  const loadedId = useRef<string | null>(null);
  useEffect(() => {
    if (quote && loadedId.current !== quote.id) {
      loadedId.current = quote.id;
      reset(toValues(quote));
      resetLines(quote.lineItems);
    }
  }, [quote, reset, resetLines]);

  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  useOnSettled(saving, saveError, goBack);

  const quantity = toNumber(values.quantity);
  const totals = useMemo(
    () => calculateTotals(lines.items, quantity),
    [lines.items, quantity],
  );
  const noLines = lines.items.length === 0;

  const save = useCallback(
    (v: Values) => {
      if (lines.items.length === 0) {
        return;
      }
      const input = {
        customerName: v.customerName.trim(),
        partName: v.partName.trim(),
        quantity: toNumber(v.quantity),
        material: v.material.trim(),
        status: v.status,
        lineItems: lines.items,
      };
      if (quoteId) {
        update(quoteId, input);
      } else {
        create(input);
      }
    },
    [lines.items, quoteId, create, update],
  );

  const header = (
    <DetailHeader
      title={Q.addTitle}
      subtitle={quoteId ?? Q.newSubtitle}
      onBack={goBack}
    />
  );

  if (quoteId && !quote) {
    return (
      <AdminScreen header={header}>
        <AsyncContent status={status} error={error} onRetry={reload}>
          <ComingSoon icon="receipt" title={Q.addTitle} message={Q.notFound} />
        </AsyncContent>
      </AdminScreen>
    );
  }

  const footer = (
    <FormFooter
      onCancel={goBack}
      submitLabel={COMMON_STRINGS.save}
      onSubmit={submit(save)}
      loading={saving}
      compact={!isCompact}
      submitTestID="save-quote"
    />
  );

  const body = (
    <View style={styles.body}>
      {isCompact && (
        <N1Text variant="small" color="secondary">
          {quoteId ?? Q.newSubtitle}
        </N1Text>
      )}
      <FormRow>
        <N1TextInput
          label={Q.customer}
          required
          placeholder={Q.customerPlaceholder}
          value={values.customerName}
          onChangeText={bind('customerName')}
          errorText={errors.customerName}
          testID="quote-customer"
        />
        <N1TextInput
          label={Q.partName}
          required
          placeholder={Q.partNamePlaceholder}
          value={values.partName}
          onChangeText={bind('partName')}
          errorText={errors.partName}
          testID="quote-part"
        />
        <N1TextInput
          label={Q.quantity}
          required
          placeholder={Q.quantityPlaceholder}
          value={values.quantity}
          onChangeText={bind('quantity')}
          errorText={errors.quantity}
          keyboardType="number-pad"
          testID="quote-quantity"
        />
      </FormRow>
      <FormRow>
        <N1TextInput
          label={Q.material}
          placeholder={Q.materialPlaceholder}
          value={values.material}
          onChangeText={bind('material')}
        />
        {quoteId ? (
          <N1DropDown
            label={Q.status}
            options={QUOTE_STATUS_OPTIONS}
            value={values.status}
            onChange={bind('status')}
          />
        ) : (
          <View />
        )}
      </FormRow>
      <N1Divider />
      <BillingSection
        title={L.title}
        caption={isCompact ? L.customizableShort : L.customizableQuote}
      >
        <LineItemsEditor controller={lines} quantity={quantity} />
        {noLines && (
          <N1Text variant="small" color="danger">
            {L.needsOne}
          </N1Text>
        )}
      </BillingSection>
      <TotalsSummary totals={totals} />
      {saveError && (
        <N1Text variant="small" color="danger">
          {saveError}
        </N1Text>
      )}
    </View>
  );

  return (
    <AdminScreen
      header={header}
      compactFooter={footer}
      testID="quote-form-screen"
    >
      {isCompact ? body : <N1Card padding="xxl">{body}</N1Card>}
      {!isCompact && <View style={styles.footer}>{footer}</View>}
    </AdminScreen>
  );
}
