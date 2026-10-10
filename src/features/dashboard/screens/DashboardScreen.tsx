import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import {
  N1PageHeader,
  N1Tabs,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
  useN1Theme,
} from '../../../shared/components';

import { AdminScreen, AsyncContent } from '../../../shared/components';
import { formatCurrency } from '../../../shared/utils';
import { useOrganizationName, useSession } from '../../profile';
import { CustomersCard } from '../components/CustomersCard';
import DashboardHero from '../components/DashboardHero';
import { PriorityJobsCard } from '../components/PriorityJobsCard';
import SummaryCard from '../components/SummaryCard';
import { DASHBOARD_STRINGS as S } from '../constants';
import { useDashboard } from '../hooks/useDashboard';
import type { AdminDrawerParamList, DashboardPeriod } from '../types';

/** Phones list only the top customers and jobs; View all opens the rest. */
const COMPACT_ROWS = 5;

const makeStyles = createN1Styles(t => ({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.lg },
  // Wide screens: the columns fill the window height below the header.
  fill: { flex: 1, alignItems: 'stretch' },
  column: { gap: t.spacing.lg },
  summary: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.lg },
  main: { flex: 3 },
  side: { flex: 2 },
  // Phones: the hero's black runs edge to edge behind the page top.
  // White from where the black ends.
  compactRoot: { flex: 1, backgroundColor: t.colors.surface },
  compactScroll: { flex: 1 },
  compactContent: {
    gap: t.spacing.lg,
    padding: t.spacing.lg,
    paddingTop: t.spacing.xs,
  },
  // Phones: Customers and Priority jobs as plain white sections, edge to edge.
  flushSection: { marginHorizontal: -t.spacing.lg, borderRadius: 0 },
  // Only the page gap separates Customers from Priority jobs below it.
  flushTop: { paddingTop: 0 },
  flushBottom: { paddingBottom: 0 },
  // Phones: the stat cards in one row that scrolls sideways, edge to edge.
  // The vertical padding keeps the card shadows from being clipped.
  carousel: {
    marginHorizontal: -t.spacing.lg,
    marginVertical: -t.spacing.lg,
    flexGrow: 0,
  },
  carouselCard: { flex: 0, boxShadow: t.shadow.soft },
  carouselContent: { gap: t.spacing.md, padding: t.spacing.lg },
}));

export function DashboardScreen() {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  const navigation =
    useNavigation<DrawerNavigationProp<AdminDrawerParamList>>();
  const { isDesktop, isCompact } = useN1Breakpoint();
  const { width } = useWindowDimensions();
  // Phones: two cards fit with the next one peeking in from the right.
  const cardWidth = (width - theme.spacing.lg * 2 - theme.spacing.md) / 2.2;
  const organizationName = useOrganizationName();
  const { shellUser } = useSession();
  const [period, setPeriod] = useState<DashboardPeriod>('month');
  const dashboard = useDashboard(period);

  const openCustomer = useCallback(
    (customerId: string) =>
      navigation.navigate('Customers', {
        screen: 'CustomerDetails',
        // Back on the customer returns here, not to the Customers list.
        params: { customerId, from: 'dashboard' },
        initial: false,
      }),
    [navigation],
  );
  const openCustomers = useCallback(
    () => navigation.navigate('Customers'),
    [navigation],
  );
  const openOrders = useCallback(
    () => navigation.navigate('Orders'),
    [navigation],
  );
  const openJobCard = useCallback(
    (jobCardId: string) =>
      // Pushed on the dashboard's stack: Back returns to the dashboard.
      navigation.navigate('Overview', {
        screen: 'JobCardDetails',
        params: { jobCardId, from: 'dashboard' },
      }),
    [navigation],
  );
  const openJobCards = useCallback(
    () => navigation.navigate('JobCards'),
    [navigation],
  );

  const openBilling = useCallback(
    () => navigation.navigate('Billing'),
    [navigation],
  );

  const { stats } = dashboard;
  const summary = useMemo(
    () => [
      {
        key: 'billed',
        label: S.stats.billed,
        value: formatCurrency(stats.billed),
        icon: 'receipt' as const,
        tone: 'success' as const,
        onOpen: openBilling,
      },
      {
        key: 'outstanding',
        label: S.stats.outstanding,
        value: formatCurrency(stats.outstanding),
        icon: 'clock' as const,
        tone: 'warning' as const,
        onOpen: openBilling,
      },
      {
        key: 'orders',
        label: S.stats.orders,
        value: stats.orders,
        icon: 'package' as const,
        tone: 'info' as const,
        onOpen: openOrders,
      },
    ],
    [stats, openBilling, openOrders],
  );

  const summaryCards = summary.map((item, index) => (
    <SummaryCard
      key={item.key}
      label={item.label}
      value={item.value}
      icon={item.icon}
      tone={item.tone}
      // Phones: every card is a white widget on the black hero.
      featured={!isCompact && index === 0}
      onOpen={item.onOpen}
      style={isCompact && [styles.carouselCard, { width: cardWidth }]}
      testID={`stat-${item.key}`}
    />
  ));

  const content = (
    <AsyncContent
      status={dashboard.status}
      error={dashboard.error}
      onRetry={dashboard.reload}
    >
      {/* Wide screens: summary cards with the customers table filling the
          rest of the left column, priority jobs down the right. The page
          doesn't scroll; the table rows and the priority list do. */}
      <View style={isDesktop ? [styles.row, styles.fill] : styles.column}>
        <View style={[styles.column, isDesktop && styles.main]}>
          {isCompact ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              contentContainerStyle={styles.carouselContent}
              testID="dashboard-stats"
            >
              {summaryCards}
            </ScrollView>
          ) : (
            <View style={styles.summary} testID="dashboard-stats">
              {summaryCards}
            </View>
          )}
          <CustomersCard
            customers={
              isCompact
                ? dashboard.customers.slice(0, COMPACT_ROWS)
                : dashboard.customers
            }
            onOpenCustomer={openCustomer}
            onViewAll={openCustomers}
            scrollable={isDesktop}
            style={isCompact && [styles.flushSection, styles.flushBottom]}
          />
        </View>
        <View style={isDesktop && styles.side}>
          <PriorityJobsCard
            jobs={
              isCompact ? dashboard.jobs.slice(0, COMPACT_ROWS) : dashboard.jobs
            }
            total={dashboard.totalJobs}
            onOpenJob={openJobCard}
            onViewAll={openJobCards}
            scrollable={isDesktop}
            style={isCompact && [styles.flushSection, styles.flushTop]}
          />
        </View>
      </View>
    </AsyncContent>
  );

  if (isCompact) {
    return (
      <View style={styles.compactRoot} testID="dashboard-screen">
        <ScrollView
          style={styles.compactScroll}
          contentContainerStyle={styles.compactContent}
        >
          <DashboardHero period={period} onPeriodChange={setPeriod} />
          {content}
        </ScrollView>
      </View>
    );
  }

  return (
    <AdminScreen testID="dashboard-screen" fixed>
      <N1PageHeader
        title={S.title(shellUser?.name)}
        subtitle={S.subtitle(organizationName)}
        right={<N1Tabs tabs={S.periods} value={period} onChange={setPeriod} />}
      />
      {content}
    </AdminScreen>
  );
}
