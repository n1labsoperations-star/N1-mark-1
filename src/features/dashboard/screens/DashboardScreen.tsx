import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import {
  N1PageHeader,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import type { AdminNavigation } from '../../../app/navigation/admin/types';
import {
  AdminScreen,
  AsyncContent,
  StatGrid,
} from '../../../shared/components';
import { formatCurrency } from '../../../shared/utils';
import { useOrganizationName } from '../../profile';
import { DistributionCard } from '../components/DistributionCard';
import { PriorityJobsCard } from '../components/PriorityJobsCard';
import { DASHBOARD_STRINGS as S } from '../constants';
import { useDashboard } from '../hooks/useDashboard';

const makeStyles = createN1Styles(t => ({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.lg },
  column: { gap: t.spacing.lg },
  main: { flex: 3 },
  side: { flex: 2 },
}));

export function DashboardScreen() {
  const styles = useN1Styles(makeStyles);
  const navigation = useNavigation<AdminNavigation>();
  const { isDesktop } = useN1Breakpoint();
  const organizationName = useOrganizationName();
  const dashboard = useDashboard();

  const openCustomer = useCallback(
    (customerId: string) =>
      navigation.navigate('CustomerDetails', { customerId }),
    [navigation],
  );
  const openCustomers = useCallback(
    () => navigation.navigate('Customers'),
    [navigation],
  );
  const openOrder = useCallback(
    (orderId: string) => navigation.navigate('OrderDetails', { orderId }),
    [navigation],
  );
  const openOrders = useCallback(
    () => navigation.navigate('Orders'),
    [navigation],
  );

  const { stats } = dashboard;
  const statItems = useMemo(
    () => [
      {
        key: 'monthly',
        label: S.stats.monthly,
        value: formatCurrency(stats.monthlyBilled),
        icon: 'receipt' as const,
      },
      {
        key: 'year',
        label: S.stats.year,
        value: formatCurrency(stats.yearBilled),
        icon: 'check-circle' as const,
      },
      {
        key: 'outstanding',
        label: S.stats.outstanding,
        value: formatCurrency(stats.outstanding),
        icon: 'info' as const,
      },
      {
        key: 'newOrders',
        label: S.stats.newOrders,
        value: stats.newOrders,
        icon: 'package' as const,
      },
    ],
    [stats],
  );

  return (
    <AdminScreen testID="dashboard-screen">
      <N1PageHeader title={S.title} subtitle={S.subtitle(organizationName)} />
      <AsyncContent
        status={dashboard.status}
        error={dashboard.error}
        onRetry={dashboard.reload}
      >
        <StatGrid items={statItems} testID="dashboard-stats" />
        <View style={isDesktop ? styles.row : styles.column}>
          <View style={isDesktop && styles.main}>
            <DistributionCard
              shares={dashboard.shares}
              topCustomers={dashboard.topCustomers}
              activeOrders={dashboard.activeOrders}
              onOpenCustomer={openCustomer}
              onViewMore={openCustomers}
            />
          </View>
          <View style={isDesktop && styles.side}>
            <PriorityJobsCard
              jobs={dashboard.jobs}
              total={dashboard.totalJobs}
              onOpenJob={openOrder}
              onViewAll={openOrders}
            />
          </View>
        </View>
      </AsyncContent>
    </AdminScreen>
  );
}
