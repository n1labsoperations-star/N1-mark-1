import { N1ConfirmDialog, N1Text } from '../../../N1Modules';
import { CUSTOMER_STRINGS } from '../constants';
import type { Customer } from '../types';

type Props = {
  customer: Customer | null;
  organizationName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteCustomerDialog({
  customer,
  organizationName,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const [before, name, after] = CUSTOMER_STRINGS.delete.message(
    customer?.name ?? '',
    organizationName,
  );
  return (
    <N1ConfirmDialog
      visible={customer !== null}
      title={CUSTOMER_STRINGS.delete.title}
      message={
        <>
          {before}
          <N1Text weight="bold">{name}</N1Text>
          {after}
        </>
      }
      confirmLabel={CUSTOMER_STRINGS.delete.confirm}
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
      testID="delete-customer-dialog"
    />
  );
}
