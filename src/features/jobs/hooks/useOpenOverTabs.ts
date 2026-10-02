import { useCallback } from 'react';
import {
  useNavigation,
  type PartialRoute,
  type Route,
} from '@react-navigation/native';
import type { JobsScreenProps, JobsStackParamList } from '../types';

type Navigation = JobsScreenProps<'ScanJob'>['navigation'];
type JobRoute = 'JobCardDetails' | 'OperatorJob' | 'QcCheck';

/**
 * Replaces the history with the host's tabs (on My Jobs) plus one job screen,
 * so the import screens drop out and Back returns to My Jobs.
 */
export function useOpenOverTabs() {
  const navigation = useNavigation<Navigation>();
  return useCallback(
    <R extends JobRoute>(name: R, params: JobsStackParamList[R]) => {
      const [tabs] = navigation.getState().routes;
      const routes: PartialRoute<Route<keyof JobsStackParamList>>[] = [
        { key: tabs.key, name: tabs.name },
        { name, params },
      ];
      navigation.reset({ index: routes.length - 1, routes });
    },
    [navigation],
  );
}
