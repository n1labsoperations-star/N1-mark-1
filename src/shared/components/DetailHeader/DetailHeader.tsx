import type { ReactNode } from 'react';
import { View } from 'react-native';
import {
  N1Header,
  N1IconButton,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../N1Modules';
import { COMMON_STRINGS, CONTENT_MAX_WIDTH } from '../../constants';

export type DetailHeaderProps = {
  title: string;
  /** Desktop only, e.g. "INV-2026-0125 · Draft". */
  subtitle?: string;
  onBack: () => void;
  /** 'close' for full-screen forms on phones. */
  backIcon?: 'arrow-left' | 'chevron-left' | 'close';
  /** Actions on the right, e.g. an Edit button or status badge. */
  right?: ReactNode;
  /** Phones: a smaller right-hand action (an icon button). Falls back to `right`. */
  compactRight?: ReactNode;
};

const makeStyles = createN1Styles(t => ({
  bar: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    paddingHorizontal: t.spacing.xxl,
    paddingTop: t.spacing.xl,
  },
  titles: { flex: 1, gap: t.spacing.xxs },
  right: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
}));

/** Back button + page title for detail and form screens. */
export function DetailHeader({
  title,
  subtitle,
  onBack,
  backIcon,
  right,
  compactRight,
}: DetailHeaderProps) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();

  if (isCompact) {
    return (
      <N1Header
        title={title}
        leftIcon={backIcon === 'close' ? 'close' : 'chevron-left'}
        leftAccessibilityLabel={
          backIcon === 'close' ? COMMON_STRINGS.close : COMMON_STRINGS.back
        }
        onLeftPress={onBack}
        right={compactRight ?? right}
      />
    );
  }

  return (
    <View style={styles.bar}>
      <N1IconButton
        icon={backIcon === 'chevron-left' ? 'chevron-left' : 'arrow-left'}
        accessibilityLabel={COMMON_STRINGS.back}
        onPress={onBack}
      />
      <View style={styles.titles}>
        <N1Text variant="h1" accessibilityRole="header" numberOfLines={1}>
          {title}
        </N1Text>
        {subtitle && (
          <N1Text variant="small" color="secondary">
            {subtitle}
          </N1Text>
        )}
      </View>
      {right && <View style={styles.right}>{right}</View>}
    </View>
  );
}
