import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import {
  N1Button,
  N1Header,
  N1Text,
  N1TextInput,
  UserScreen,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useOnSettled } from '../../../shared/hooks';
import { JOB_CARD_STRINGS, useJobCards } from '../../jobCards';
import { useOrders } from '../../orders';
import { JOBS_STRINGS, ROLE_JOBS } from '../constants';
import { useMyJobs } from '../hooks/useMyJobs';
import { useOpenOverTabs } from '../hooks/useOpenOverTabs';
import type { JobsScreenProps } from '../types';
import { parseJobCode } from '../utils';

const S = JOBS_STRINGS.code;

const makeStyles = createN1Styles(t => ({
  heading: { gap: t.spacing.xs },
}));

/**
 * Import a job by the code printed on its job card or route card. Second
 * Admin goes on to the order; the shop floor adds the job and opens it.
 */
export function EnterJobCodeScreen({
  route,
  navigation,
}: JobsScreenProps<'EnterJobCode'>) {
  const styles = useN1Styles(makeStyles);
  const orders = useOrders();
  const jobCards = useJobCards();
  const myJobs = useMyJobs();
  const openOverTabs = useOpenOverTabs();
  const { importTo } = ROLE_JOBS[myJobs.role];
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const importing = useRef('');

  useOnSettled(myJobs.importing, myJobs.importError, () => {
    const jobCardId = importing.current;
    if (!jobCardId) {
      return;
    }
    if (importTo === 'qc') {
      const kind = route.params?.qcKind ?? 'rm';
      openOverTabs('QcCheck', { jobCardId, kind });
    } else {
      openOverTabs('OperatorJob', { jobCardId });
    }
  });

  const changeCode = useCallback((value: string) => {
    setCode(value);
    setError(undefined);
  }, []);

  const importJob = () => {
    const orderId = parseJobCode(code);
    if (!orderId) {
      setError(COMMON_STRINGS.required);
    } else if (!orders.items.some(o => o.id === orderId)) {
      setError(S.notFound(code.trim()));
    } else if (importTo === 'order') {
      navigation.navigate('ImportOrder', { orderId });
    } else {
      // Operators can only run jobs that already have a route card; QC can
      // check any job card (raw material comes before the route).
      const jobCard = jobCards.items.find(c => c.id === orderId);
      if (!jobCard || (importTo === 'job' && !jobCard.operations.length)) {
        setError(S.noRoute(JOB_CARD_STRINGS.workOrder(orderId)));
      } else {
        importing.current = orderId;
        myJobs.importJob(orderId);
      }
    }
  };

  return (
    <UserScreen
      header={
        <N1Header
          title={S.title}
          leftIcon="chevron-left"
          onLeftPress={() => navigation.goBack()}
        />
      }
      testID="enter-job-code-screen"
    >
      <View style={styles.heading}>
        <N1Text variant="title" weight="bold">
          {S.heading}
        </N1Text>
        <N1Text variant="small" color="secondary">
          {S.help}
        </N1Text>
      </View>
      <N1TextInput
        label={S.label}
        value={code}
        onChangeText={changeCode}
        placeholder={S.placeholder}
        errorText={error}
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType="go"
        onSubmitEditing={importJob}
        testID="job-code-input"
      />
      {myJobs.importError && (
        <N1Text variant="small" color="danger">
          {myJobs.importError}
        </N1Text>
      )}
      <N1Button
        title={S.importJob}
        leftIcon="arrow-right"
        size="lg"
        fullWidth
        loading={orders.isLoading || jobCards.isLoading || myJobs.importing}
        onPress={importJob}
        testID="job-code-submit"
      />
      <N1Button
        title={S.scanInstead}
        leftIcon="scan"
        variant="secondary"
        size="lg"
        fullWidth
        onPress={() => navigation.popTo('ScanJob', route.params)}
      />
    </UserScreen>
  );
}
