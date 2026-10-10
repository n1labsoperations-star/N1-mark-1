import { memo, useCallback, useRef } from 'react';
import { StyleSheet, View, type ScrollViewInstance } from 'react-native';
import {
  KeyboardScrollView,
  N1Button,
  N1IconButton,
  N1Text,
  N1TextInput,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import { formatCurrency } from '../../../shared/utils';
import { BILLING_STRINGS } from '../constants';
import type { LineItemsController } from '../hooks/useLineItems';
import type { LineItemDraft } from '../types';
import { fromDraft, lineAmount } from '../utils';

const L = BILLING_STRINGS.lineItems;

// Relative column widths, shared by the header and every row.
const COLS = StyleSheet.create({
  operation: { flex: 1.2 },
  description: { flex: 2.2 },
  minutes: { flex: 1.1 },
  setup: { flex: 1.1 },
  rate: { flex: 1.2 },
  amount: { flex: 0.9 },
});

const makeStyles = createN1Styles(t => ({
  wrapper: {
    borderRadius: t.radius.lg,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    overflow: 'hidden',
  },
  fill: { flex: 1, minHeight: 0 },
  header: {
    flexDirection: 'row',
    gap: t.spacing.md,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    backgroundColor: t.colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    borderTopWidth: t.borderWidth.hairline,
    borderTopColor: t.colors.border,
  },
  removeCell: { width: t.controlHeight.sm },
  footer: {
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
    borderTopWidth: t.borderWidth.hairline,
    borderTopColor: t.colors.border,
  },
  cards: { gap: t.spacing.md },
  card: {
    gap: t.spacing.sm,
    padding: t.spacing.md,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.background,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  grow: { flex: 1 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between' },
}));

type RowProps = {
  draft: LineItemDraft;
  quantity: number;
  compact: boolean;
  onChange: LineItemsController['change'];
  onRemove: LineItemsController['remove'];
};

const Unit = ({ text }: { text: string }) => (
  <N1Text variant="caption" color="secondary">
    {text}
  </N1Text>
);

const LineItemRow = memo(function LineItemRowComponent({
  draft,
  quantity,
  compact,
  onChange,
  onRemove,
}: RowProps) {
  const styles = useN1Styles(makeStyles);
  const amount = formatCurrency(lineAmount(fromDraft(draft), quantity));
  const removeButton = (
    <N1IconButton
      icon="close"
      size="sm"
      variant="soft"
      accessibilityLabel={L.remove(draft.operation)}
      onPress={() => onRemove(draft.id)}
    />
  );
  const operation = (
    <N1TextInput
      value={draft.operation}
      onChangeText={v => onChange(draft.id, 'operation', v)}
      placeholder={L.operationPlaceholder}
      accessibilityLabel={L.operation}
      containerStyle={compact ? styles.grow : COLS.operation}
      testID={`line-${draft.id}-operation`}
    />
  );
  const description = (
    <N1TextInput
      value={draft.description}
      onChangeText={v => onChange(draft.id, 'description', v)}
      placeholder={L.descriptionPlaceholder}
      accessibilityLabel={L.description}
      containerStyle={!compact && COLS.description}
    />
  );
  const minutes = (
    <N1TextInput
      value={draft.minutes}
      onChangeText={v => onChange(draft.id, 'minutes', v)}
      keyboardType="decimal-pad"
      accessibilityLabel={L.runningTime}
      rightElement={compact ? <Unit text={L.minutesUnit} /> : undefined}
      containerStyle={compact ? styles.grow : COLS.minutes}
      testID={`line-${draft.id}-minutes`}
    />
  );
  const setup = (
    <N1TextInput
      value={draft.setup}
      onChangeText={v => onChange(draft.id, 'setup', v)}
      keyboardType="decimal-pad"
      accessibilityLabel={L.setupTime}
      rightElement={
        compact ? <Unit text={`${L.minutesUnit} ${L.setupUnit}`} /> : undefined
      }
      containerStyle={compact ? styles.grow : COLS.setup}
      testID={`line-${draft.id}-setup`}
    />
  );
  const rate = (
    <N1TextInput
      value={draft.rate}
      onChangeText={v => onChange(draft.id, 'rate', v)}
      keyboardType="decimal-pad"
      accessibilityLabel={L.rate}
      rightElement={compact ? <Unit text={L.rateUnit} /> : undefined}
      containerStyle={compact ? styles.grow : COLS.rate}
      testID={`line-${draft.id}-rate`}
    />
  );

  if (compact) {
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          {operation}
          {removeButton}
        </View>
        {description}
        <View style={styles.cardRow}>
          {minutes}
          {setup}
        </View>
        {rate}
        <View style={styles.amountRow}>
          <N1Text variant="small" color="secondary">
            {L.amount}
          </N1Text>
          <N1Text weight="bold">{amount}</N1Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {operation}
      {description}
      {minutes}
      {setup}
      {rate}
      <N1Text style={COLS.amount} testID={`line-${draft.id}-amount`}>
        {amount}
      </N1Text>
      <View style={styles.removeCell}>{removeButton}</View>
    </View>
  );
});

type Props = {
  controller: LineItemsController;
  quantity: number;
  /** Wide screens: fill the parent's height; only the rows scroll. */
  scrollable?: boolean;
};

/** Editable process operations (invoice edit mode, Add quote). */
export function LineItemsEditor({
  controller,
  quantity,
  scrollable = false,
}: Props) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const { drafts, change, remove, add } = controller;
  // Add row scrolls to the new row once it has been laid out.
  const scrollRef = useRef<ScrollViewInstance>(null);
  const scrollOnGrow = useRef(false);
  const addRow = useCallback(() => {
    scrollOnGrow.current = scrollable;
    add();
  }, [add, scrollable]);
  const onContentSizeChange = useCallback(() => {
    if (scrollOnGrow.current) {
      scrollOnGrow.current = false;
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, []);

  const rows = drafts.map(d => (
    <LineItemRow
      key={d.id}
      draft={d}
      quantity={quantity}
      compact={isCompact}
      onChange={change}
      onRemove={remove}
    />
  ));
  const addRowButton = (
    <N1Button
      title={L.addRow}
      leftIcon="plus"
      variant="ghost"
      size="sm"
      onPress={addRow}
      testID="add-line-item"
    />
  );

  if (isCompact) {
    return (
      <View style={styles.cards}>
        {rows}
        <N1Button
          title={L.addRow}
          leftIcon="plus"
          variant="secondary"
          fullWidth
          onPress={add}
          testID="add-line-item"
        />
      </View>
    );
  }

  const headers = [
    [L.operation, COLS.operation],
    [L.description, COLS.description],
    [L.minutesHeader, COLS.minutes],
    [L.setupHeader, COLS.setup],
    [L.rateHeader, COLS.rate],
    [L.amount, COLS.amount],
  ] as const;

  return (
    <View style={[styles.wrapper, scrollable && styles.fill]}>
      <View style={styles.header}>
        {headers.map(([title, style]) => (
          // Same small labels as the read-only table.
          <N1Text
            key={title}
            variant="caption"
            weight="semiBold"
            color="secondary"
            style={style}
          >
            {title}
          </N1Text>
        ))}
        <View style={styles.removeCell} />
      </View>
      {scrollable ? (
        <KeyboardScrollView
          ref={scrollRef}
          style={styles.fill}
          onContentSizeChange={onContentSizeChange}
          testID="line-items-editor-scroll"
        >
          {rows}
        </KeyboardScrollView>
      ) : (
        rows
      )}
      <View style={styles.footer}>{addRowButton}</View>
    </View>
  );
}
