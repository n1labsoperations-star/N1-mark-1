import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  N1PageHeader,
  N1Tabs,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';

import { AdminScreen, AsyncContent } from '../../../shared/components';
import { formatCurrency } from '../../../shared/utils';
import { useOrganizationName, useSession } from '../../profile';
import { CustomersCard } from '../components/CustomersCard';
import { PriorityJobsCard } from '../components/PriorityJobsCard';
import SummaryCard from '../components/SummaryCard';
import { DASHBOARD_STRINGS as S } from '../constants';
import { useDashboard } from '../hooks/useDashboard';
import type { AdminDrawerParamList, DashboardPeriod } from '../types';

const makeStyles = createN1Styles(t => ({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.lg },
  // Wide screens: the columns fill the window height below the header.
  fill: { flex: 1, alignItems: 'stretch' },
  column: { gap: t.spacing.lg },
  summary: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.lg },
  main: { flex: 3 },
  side: { flex: 2 },
}));

export function DashboardScreen() {
  const styles = useN1Styles(makeStyles);
  const navigation =
    useNavigation<DrawerNavigationProp<AdminDrawerParamList>>();
  const { isDesktop } = useN1Breakpoint();
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
      navigation.navigate('JobCards', {
        screen: 'JobCardDetails',
        // Back returns to the dashboard.
        params: { jobCardId, from: 'dashboard' },
        initial: false,
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

  return (
    <AdminScreen testID="dashboard-screen" fixed>
      <N1PageHeader
        title={S.title(shellUser?.name)}
        subtitle={S.subtitle(organizationName)}
        right={<N1Tabs tabs={S.periods} value={period} onChange={setPeriod} />}
      />
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
            <View style={styles.summary} testID="dashboard-stats">
              {summary.map((item, index) => (
                <SummaryCard
                  key={item.key}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                  tone={item.tone}
                  featured={index === 0}
                  onOpen={item.onOpen}
                  testID={`stat-${item.key}`}
                />
              ))}
            </View>
            <CustomersCard
              customers={dashboard.customers}
              onOpenCustomer={openCustomer}
              onViewAll={openCustomers}
              scrollable={isDesktop}
            />
          </View>
          <View style={isDesktop && styles.side}>
            <PriorityJobsCard
              jobs={dashboard.jobs}
              total={dashboard.totalJobs}
              onOpenJob={openJobCard}
              onViewAll={openJobCards}
              scrollable={isDesktop}
            />
          </View>
        </View>
      </AsyncContent>
    </AdminScreen>
  );
}
