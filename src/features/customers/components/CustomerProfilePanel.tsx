import { Pressable, View } from 'react-native';
import {
  N1Avatar,
  N1Badge,
  N1Divider,
  N1Icon,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { formatDate } from '../../../shared/utils';
import { CUSTOMER_STRINGS, CUSTOMER_TYPE_BADGE } from '../constants';
import type { Customer } from '../types';

const D = CUSTOMER_STRINGS.details;

const makeStyles = createN1Styles(t => ({
  panel: { gap: t.spacing.lg },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: t.spacing.xs,
  },
  deleteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    height: t.controlHeight.md,
    borderRadius: t.radius.sm,
  },
  pressed: { opacity: t.opacity.pressed },
  identity: { alignItems: 'center', gap: t.spacing.xs },
  centered: { textAlign: 'center' },
  badge: { alignSelf: 'center' },
  since: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.xs,
  },
  dot: {
    width: t.spacing.sm,
    height: t.spacing.sm,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.tone.success.foreground,
  },
}));

type Props = {
  customer: Customer;
  /** e.g. "Back to customers" or "Back to dashboard". */
  backLabel: string;
  onBack: () => void;
  onDelete: () => void;
  /** The section menu, between who they are and Delete customer. */
  children?: React.ReactNode;
};

/**
 * Customer details, left column: who the customer is, the section menu,
 * then Delete customer at the foot.
 */
export function CustomerProfilePanel({
  customer,
  backLabel,
  onBack,
  onDelete,
  children,
}: Props) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.panel} testID="customer-profile">
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={backLabel}
        onPress={onBack}
        style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
        testID="customer-details-back"
      >
        <N1Icon name="arrow-left" size="sm" color="textSecondary" />
        <N1Text variant="label" color="secondary">
          {backLabel}
        </N1Text>
      </Pressable>

      <View style={styles.identity}>
        <N1Avatar name={customer.name} size="lg" />
        <N1Text variant="h3" style={styles.centered}>
          {customer.name}
        </N1Text>
        {customer.contactPerson ? (
          <N1Text variant="small" color="secondary" style={styles.centered}>
            {`${customer.contactPerson} · ${D.contactPersonSuffix}`}
          </N1Text>
        ) : null}
        <View style={styles.badge}>
          <N1Badge label={CUSTOMER_TYPE_BADGE[customer.type]} tone="info" />
        </View>
        <View style={styles.since}>
          <View style={styles.dot} />
          <N1Text variant="caption" color="secondary">
            {D.since(formatDate(customer.customerSince))}
          </N1Text>
        </View>
      </View>

      {children && (
        <>
          <N1Divider />
          {children}
        </>
      )}

      <N1Divider />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={CUSTOMER_STRINGS.a11y.delete(customer.name)}
        onPress={onDelete}
        style={({ pressed }) => [styles.deleteLink, pressed && styles.pressed]}
        testID="delete-customer"
      >
        <N1Icon name="trash" size="sm" color="danger" />
        <N1Text variant="label" weight="semiBold" color="danger">
          {D.deleteCustomer}
        </N1Text>
      </Pressable>
    </View>
  );
}
