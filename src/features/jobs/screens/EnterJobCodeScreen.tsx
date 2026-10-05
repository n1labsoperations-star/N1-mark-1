import { useCallback, useState } from 'react';
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
import { JOBS_STRINGS } from '../constants';
import { useImportJobByCode } from '../hooks/useImportJobByCode';
import type { JobsScreenProps } from '../types';

const S = JOBS_STRINGS.code;

const makeStyles = createN1Styles(t => ({
  heading: { gap: t.spacing.xs },
}));

/** Import a job by the code printed on its job card or route card. */
export function EnterJobCodeScreen({
  route,
  navigation,
}: JobsScreenProps<'EnterJobCode'>) {
  const styles = useN1Styles(makeStyles);
  const { importCode, loading, importError } = useImportJobByCode(
    route.params?.qcKind,
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();

  const changeCode = useCallback((value: string) => {
    setCode(value);
    setError(undefined);
  }, []);

  const importJob = () => setError(importCode(code));

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
      {importError && (
        <N1Text variant="small" color="danger">
          {importError}
        </N1Text>
      )}
      <N1Button
        title={S.importJob}
        leftIcon="arrow-right"
        size="lg"
        fullWidth
        loading={loading}
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
