import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import {
  KeyboardScrollView,
  AdminScreen,
  N1Card,
  N1Divider,
  N1Icon,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import { BILLING_STRINGS } from '../constants';
import { BillingSection } from './BillingSection';

/** Amount details box: a little wider than the usual side column. */
const AMOUNTS_WIDTH = 380;

const makeStyles = createN1Styles(t => ({
  card: { gap: t.spacing.xl },
  // Wide screens: one card fills the window and nothing scrolls but the
  // operation rows; the table's header row stays put.
  fixedCard: { flex: 1, minHeight: 0 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: t.spacing.xs,
  },
  pressed: { opacity: t.opacity.pressed },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  // The title block, then any extra (the PO amount) beside it, matching
  // its height: the extra's label lines up with the title, its value with
  // the id underneath.
  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: t.spacing.xxl,
  },
  titles: { gap: t.spacing.xxs },
  // Title, details and operations on the left; the amounts box on the
  // right starts level with the title.
  split: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    gap: t.spacing.xl,
  },
  details: { gap: t.spacing.lg },
  // The operations take whatever height is left in the card.
  fill: { flex: 1, minHeight: 0 },
  amounts: {
    gap: t.spacing.lg,
    padding: t.spacing.lg,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.background,
  },
  // A ScrollView grows to fill the row on web; keep it at its width.
  aside: { width: AMOUNTS_WIDTH, flexGrow: 0, flexShrink: 0 },
  asideContent: { gap: t.spacing.xl },
}));

type BackLinkProps = { label: string; onPress: () => void; testID: string };

/** "← Back to …" at the top of the card, as on the other detail screens. */
export function BillingBackLink({ label, onPress, testID }: BackLinkProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
      testID={testID}
    >
      <N1Icon name="arrow-left" size="sm" color="textSecondary" />
      <N1Text variant="label" color="secondary">
        {label}
      </N1Text>
    </Pressable>
  );
}

type Props = {
  testID: string;
  /** Phones: <DetailHeader /> with back and the screen's name. */
  header?: ReactNode;
  /** <BillingBackLink />. */
  back: ReactNode;
  /** Right of the back link, e.g. View Quote. */
  topRight?: ReactNode;
  title: string;
  /** Status badge beside the title. */
  badge: ReactNode;
  /** Beside the title block, e.g. the invoice's PO amount. */
  titleExtra?: ReactNode;
  /** Under the title, e.g. the document id. */
  subtitle: string;
  /** Right of the title: Edit, or Cancel / Save while editing. */
  headerRight?: ReactNode;
  /** Customer, part, quantity… right under the title. */
  summary: ReactNode;
  /** The operations table or editor (and its error). */
  operations: ReactNode;
  /** Inside the grey amounts box: totals, then actions or edit fields. */
  amounts: ReactNode;
  /** Under the amounts box, e.g. notes. */
  aside?: ReactNode;
  /** Phones: buttons pinned to the bottom. */
  compactFooter?: ReactNode;
};

/**
 * Invoice and quote details: one card with the back link, the title and
 * its details, the operations (only their rows scroll) and the amounts in
 * a grey box on the right. Phones stack it all and scroll the page.
 */
export function BillingDetailLayout({
  testID,
  header,
  back,
  topRight,
  title,
  badge,
  titleExtra,
  subtitle,
  headerRight,
  summary,
  operations,
  amounts,
  aside,
  compactFooter,
}: Props) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();

  const topBar = (
    <View style={styles.topBar}>
      {back}
      {topRight}
    </View>
  );
  const heading = (
    <View style={styles.headingRow}>
      <View style={styles.titleGroup}>
        <View style={styles.titles}>
          <View style={styles.titleRow}>
            <N1Text variant="h2" accessibilityRole="header">
              {title}
            </N1Text>
            {/* The badge pins itself to the top; the wrapper centres it. */}
            <View>{badge}</View>
          </View>
          <N1Text variant="small" color="secondary">
            {subtitle}
          </N1Text>
        </View>
        {titleExtra}
      </View>
      {headerRight}
    </View>
  );
  const details = (
    <View style={[styles.details, !isCompact && styles.fill]}>
      {heading}
      {/* Details sit right under the title, no rule between. */}
      {summary}
      <N1Divider />
      <BillingSection
        title={BILLING_STRINGS.lineItems.title}
        style={!isCompact && styles.fill}
      >
        {operations}
      </BillingSection>
    </View>
  );
  const amountsBox = <View style={styles.amounts}>{amounts}</View>;

  if (isCompact) {
    return (
      <AdminScreen
        header={header}
        testID={testID}
        compactFooter={compactFooter}
      >
        <N1Card radius="sm" style={styles.card}>
          {topBar}
          {details}
          {amountsBox}
          {aside}
        </N1Card>
      </AdminScreen>
    );
  }

  return (
    <AdminScreen header={header} fixed testID={testID}>
      <N1Card radius="sm" style={[styles.card, styles.fixedCard]}>
        {topBar}
        <View style={styles.split}>
          {details}
          {/* Scrolls on its own only when the edit fields don't fit. */}
          <KeyboardScrollView
            style={styles.aside}
            contentContainerStyle={styles.asideContent}
            showsVerticalScrollIndicator={false}
          >
            {amountsBox}
            {aside}
          </KeyboardScrollView>
        </View>
      </N1Card>
    </AdminScreen>
  );
}
