import { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
  FormFooter,
  N1Modal,
  N1Switch,
  N1Text,
  N1TextInput,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { formatRate, splitGstRate } from '../../../shared/utils';
import { GST_STRINGS as S, validateTaxRate } from '../gst';
import type { TaxRate } from '../types';

const makeStyles = createN1Styles(t => ({
  split: { flexDirection: 'row', gap: t.spacing.md },
  splitItem: { flex: 1 },
}));

type Props = {
  visible: boolean;
  /** The rate being edited; undefined adds a new one. */
  rate?: TaxRate;
  /** Every configured rate, to stop duplicates. */
  rates: readonly TaxRate[];
  onCancel: () => void;
  onSave: (rate: number, active: boolean) => void;
};

/**
 * Add / Edit Tax Rate: only the GST rate is typed; CGST, SGST and IGST are
 * shown, calculated from it.
 */
export function TaxRateModal({
  visible,
  rate,
  rates,
  onCancel,
  onSave,
}: Props) {
  const styles = useN1Styles(makeStyles);
  const [text, setText] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (visible) {
      setText(rate ? String(rate.rate) : '');
      setActive(rate?.active ?? true);
      setError(undefined);
    }
  }, [visible, rate]);

  const valid = !validateTaxRate(text, rates, rate?.id);
  const split = splitGstRate(valid ? Number(text) : 0);
  const shown = (value: number) =>
    valid ? String(Number(value.toFixed(2))) : '';

  const save = () => {
    const problem = validateTaxRate(text, rates, rate?.id);
    setError(problem);
    if (!problem) {
      onSave(Number(text), active);
    }
  };

  return (
    <N1Modal
      visible={visible}
      onClose={onCancel}
      size="sm"
      title={rate ? S.editRate : S.addRate}
      footer={
        <FormFooter
          onCancel={onCancel}
          submitLabel={S.saveRate}
          onSubmit={save}
          submitTestID="tax-rate-submit"
        />
      }
      testID="tax-rate-form"
    >
      <N1TextInput
        label={S.rateField}
        required
        value={text}
        onChangeText={value => {
          setText(value);
          setError(undefined);
        }}
        placeholder={S.ratePlaceholder}
        keyboardType="decimal-pad"
        rightElement={<N1Text color="secondary">%</N1Text>}
        errorText={error}
        testID="tax-rate-value"
      />
      <View style={styles.split}>
        {(['cgst', 'sgst', 'igst'] as const).map(key => (
          <N1TextInput
            key={key}
            label={S.columns[key]}
            value={shown(split[key])}
            readOnly
            rightElement={<N1Text color="secondary">%</N1Text>}
            containerStyle={styles.splitItem}
            testID={`tax-rate-${key}`}
          />
        ))}
      </View>
      <N1Text variant="small" color="secondary">
        {S.calculated}
        {valid ? ` (${formatRate(Number(text))})` : ''}
      </N1Text>
      {rate && (
        <N1Switch
          label={S.rateActive}
          value={active}
          onValueChange={setActive}
          testID="tax-rate-active"
        />
      )}
    </N1Modal>
  );
}
