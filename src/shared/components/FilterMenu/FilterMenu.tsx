import { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  type HostInstance,
} from 'react-native';
import {
  N1BottomSheet,
  N1Button,
  N1Checkbox,
  N1Icon,
  N1IconButton,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
  useN1Theme,
} from '..';
import { COMMON_STRINGS } from '../../constants';

export type FilterGroup = {
  key: string;
  /** e.g. "Role". */
  label: string;
  options: { value: string; label: string }[];
};

/** Picked values per group key; an empty list means "all". */
export type FilterValues = Record<string, readonly string[]>;

export type FilterMenuProps = {
  groups: FilterGroup[];
  value: FilterValues;
  onApply: (value: FilterValues) => void;
  /**
   * inverse: an icon-only dark tile for the black header on phones
   * (HeaderSearchBar), the applied count as a dot badge.
   */
  variant?: 'default' | 'inverse';
  testID?: string;
};

/** Panel width on wide screens; phones use the window width. */
const PANEL_WIDTH = 440;
const PANEL_MAX_HEIGHT = 420;
const GROUP_LIST_WIDTH = 140;
/** Phones: height of the group list and options inside the bottom sheet. */
const SHEET_BODY_HEIGHT = 280;

const makeStyles = createN1Styles(t => ({
  // Matches the toolbar's filled search and buttons.
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    height: t.controlHeight.sm,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.radius.sm,
    backgroundColor: t.colors.background,
  },
  count: {
    minWidth: t.iconSize.md,
    height: t.iconSize.md,
    paddingHorizontal: t.spacing.xs,
    borderRadius: t.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.primary,
  },
  inverseTrigger: {
    width: t.controlHeight.md,
    height: t.controlHeight.md,
    borderRadius: t.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceInverseActive,
  },
  inverseCount: {
    position: 'absolute',
    top: -t.spacing.xs,
    right: -t.spacing.xs,
  },
  pressed: { opacity: t.opacity.pressed },
  backdrop: { flex: 1 },
  panel: {
    position: 'absolute',
    maxHeight: PANEL_MAX_HEIGHT,
    borderRadius: t.radius.compact,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
    boxShadow: t.shadow.modal,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
    borderBottomWidth: t.borderWidth.hairline,
    borderBottomColor: t.colors.border,
  },
  body: { flexDirection: 'row', flexShrink: 1 },
  // Groups and options share a row height and top inset, so both columns
  // line up row for row.
  groups: {
    width: GROUP_LIST_WIDTH,
    padding: t.spacing.sm,
    borderRightWidth: t.borderWidth.hairline,
    borderRightColor: t.colors.border,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: t.controlHeight.md,
    paddingHorizontal: t.spacing.sm,
    borderRadius: t.radius.sm,
  },
  groupActive: { backgroundColor: t.colors.background },
  options: { flex: 1 },
  optionsContent: {
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
  },
  // Phones: the same 10pt gap off the divider as the groups have on either
  // side; the rows run to the sheet's edge like the header's line.
  sheetOptionsContent: { paddingLeft: t.spacing.sm, paddingRight: 0 },
  option: {
    height: t.controlHeight.md,
    justifyContent: 'center',
    borderBottomWidth: t.borderWidth.hairline,
    borderBottomColor: t.colors.border,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    borderTopWidth: t.borderWidth.hairline,
    borderTopColor: t.colors.border,
  },
  // Phones: the sheet sizes to content, so the two columns get a height.
  sheetBody: {
    height: SHEET_BODY_HEIGHT,
    borderTopWidth: t.borderWidth.hairline,
    borderTopColor: t.colors.border,
  },
  sheetFooter: { paddingHorizontal: 0 },
  clearAll: { flex: 1 },
  clearAllText: { textDecorationLine: 'underline' },
}));

const countPicked = (value: FilterValues) =>
  Object.values(value).reduce((n, picked) => n + picked.length, 0);

/**
 * "Filter" button that opens a panel: groups on the left, checkboxes on the
 * right. Picks only take effect on Apply.
 */
export function FilterMenu({
  groups,
  value,
  onApply,
  variant = 'default',
  testID,
}: FilterMenuProps) {
  const styles = useN1Styles(makeStyles);
  const inverse = variant === 'inverse';
  const { isCompact } = useN1Breakpoint();
  const sheet = isCompact;
  const theme = useN1Theme();
  const edge = theme.spacing.lg;
  const window = useWindowDimensions();
  const trigger = useRef<HostInstance | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterValues>(value);
  const [activeGroup, setActiveGroup] = useState(groups[0]?.key ?? '');
  // Where the panel opens: under the button, right edges aligned.
  const [anchor, setAnchor] = useState({ top: 0, right: 0 });

  const applied = countPicked(value);
  const width = Math.min(PANEL_WIDTH, window.width - 2 * edge);
  const group = groups.find(g => g.key === activeGroup) ?? groups[0];

  const show = () => {
    setDraft(value);
    setOpen(true);
    trigger.current?.measureInWindow((x, y, w, h) => {
      setAnchor({
        top: y + h + 6,
        // Right-aligned to the trigger, but never past either screen edge.
        right: Math.min(
          Math.max(edge, window.width - (x + w)),
          window.width - edge - width,
        ),
      });
    });
  };

  const toggle = (key: string, option: string) =>
    setDraft(current => {
      const picked = current[key] ?? [];
      return {
        ...current,
        [key]: picked.includes(option)
          ? picked.filter(v => v !== option)
          : [...picked, option],
      };
    });

  const clearAll = () =>
    setDraft(Object.fromEntries(groups.map(g => [g.key, []])));

  const apply = () => {
    onApply(draft);
    setOpen(false);
  };

  // Group list, options and Clear all / Close / Apply: in the anchored
  // panel on wide screens, in a bottom sheet on phones.
  const content = (
    <>
      <View style={[styles.body, sheet && styles.sheetBody]}>
        <View style={styles.groups} accessibilityRole="tablist">
          {groups.map(g => {
            const picked = draft[g.key]?.length ?? 0;
            const active = g.key === group?.key;
            return (
              <Pressable
                key={g.key}
                accessibilityRole="tab"
                aria-selected={active}
                onPress={() => setActiveGroup(g.key)}
                style={[styles.group, active && styles.groupActive]}
              >
                <N1Text variant="small" weight={active ? 'bold' : 'regular'}>
                  {g.label}
                </N1Text>
                {picked > 0 && (
                  <N1Text variant="caption" color="secondary">
                    {picked}
                  </N1Text>
                )}
              </Pressable>
            );
          })}
        </View>
        <ScrollView
          style={styles.options}
          contentContainerStyle={[
            styles.optionsContent,
            sheet && styles.sheetOptionsContent,
          ]}
        >
          {group?.options.map(option => (
            <View key={option.value} style={styles.option}>
              <N1Checkbox
                label={option.label}
                checked={draft[group.key]?.includes(option.value) ?? false}
                onChange={() => toggle(group.key, option.value)}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.footer, sheet && styles.sheetFooter]}>
        <View style={styles.clearAll}>
          <Pressable accessibilityRole="button" onPress={clearAll} hitSlop={4}>
            <N1Text
              variant="small"
              weight="semiBold"
              style={styles.clearAllText}
            >
              {COMMON_STRINGS.clearAll}
            </N1Text>
          </Pressable>
        </View>
        <N1Button
          title={COMMON_STRINGS.close}
          variant="secondary"
          size="sm"
          onPress={() => setOpen(false)}
        />
        <N1Button
          title={COMMON_STRINGS.apply}
          size="sm"
          onPress={apply}
          testID={testID && `${testID}-apply`}
        />
      </View>
    </>
  );

  return (
    <>
      <Pressable
        ref={trigger}
        accessibilityRole="button"
        accessibilityLabel={
          applied
            ? `${COMMON_STRINGS.filter} (${applied})`
            : COMMON_STRINGS.filter
        }
        aria-expanded={open}
        onPress={show}
        style={({ pressed }) => [
          inverse ? styles.inverseTrigger : styles.trigger,
          pressed && styles.pressed,
        ]}
        testID={testID}
      >
        {inverse ? (
          <>
            <N1Icon name="filter" size="md" color="textInverse" />
            {applied > 0 && (
              <View style={[styles.count, styles.inverseCount]}>
                <N1Text variant="caption" weight="bold" color="onPrimary">
                  {applied}
                </N1Text>
              </View>
            )}
          </>
        ) : (
          <>
            <N1Icon name="filter" size="sm" color="textPrimary" />
            <N1Text variant="small" weight="semiBold">
              {COMMON_STRINGS.filter}
            </N1Text>
            {applied > 0 && (
              <View style={styles.count}>
                <N1Text variant="caption" weight="bold" color="onPrimary">
                  {applied}
                </N1Text>
              </View>
            )}
            <N1Icon name="chevron-down" size="sm" color="textSecondary" />
          </>
        )}
      </Pressable>

      {sheet ? (
        <N1BottomSheet
          open={open}
          onClose={() => setOpen(false)}
          title={COMMON_STRINGS.filters}
          testID={testID && `${testID}-panel`}
        >
          {content}
        </N1BottomSheet>
      ) : (
        <Modal
          visible={open}
          transparent
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <Pressable
            style={styles.backdrop}
            accessibilityLabel={COMMON_STRINGS.close}
            onPress={() => setOpen(false)}
          />
          <View
            style={[
              styles.panel,
              { top: anchor.top, right: anchor.right, width },
            ]}
            testID={testID && `${testID}-panel`}
          >
            <View style={styles.header}>
              <N1Text weight="bold">{COMMON_STRINGS.filters}</N1Text>
              <N1IconButton
                icon="close"
                variant="ghost"
                size="sm"
                accessibilityLabel={COMMON_STRINGS.close}
                onPress={() => setOpen(false)}
              />
            </View>

            {content}
          </View>
        </Modal>
      )}
    </>
  );
}
