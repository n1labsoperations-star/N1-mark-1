import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  AsyncContent,
  N1Badge,
  N1Button,
  N1Header,
  N1IconButton,
  N1ListItem,
  N1PageHeader,
  N1Tabs,
  N1Text,
  N1TextInput,
  UserScreen,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useListFilter, useToggle } from '../../../shared/hooks';
import { jobCardSearchText, jobHeading, type JobCard } from '../../jobCards';
import { JOBS_STRINGS, QC_STATUS_META, QC_STRINGS } from '../constants';
import { useMyJobs } from '../hooks/useMyJobs';
import { qcItem, type QcKind } from '../qc';
import type { JobsScreenProps } from '../types';

const S = QC_STRINGS;
const L = JOBS_STRINGS.myJobs;

const TABS: { key: QcKind; label: string }[] = [
  { key: 'rm', label: S.tabs.rm },
  { key: 'machine', label: S.tabs.machine },
];

type Navigation = JobsScreenProps<'QcCheck'>['navigation'];

/** QC's Jobs tab: its jobs as Raw Material QC or Machine QC checks. */
export function QcListScreen() {
  const navigation = useNavigation<Navigation>();
  const { items, status, error, reload } = useMyJobs();
  const [kind, setKind] = useState<QcKind>('rm');
  const [searching, openSearch, closeSearch] = useToggle(false);
  const { query, setQuery, filtered } = useListFilter(items, {
    getSearchText: jobCardSearchText,
  });

  const pending = useMemo(
    () => items.filter(c => qcItem(c, kind).status === 'pending').length,
    [items, kind],
  );
  const stopSearching = useCallback(() => {
    setQuery('');
    closeSearch();
  }, [setQuery, closeSearch]);
  const openCheck = useCallback(
    (c: JobCard) => navigation.navigate('QcCheck', { jobCardId: c.id, kind }),
    [navigation, kind],
  );

  return (
    <UserScreen header={<N1Header variant="brand" />} testID="qc-list-screen">
      <N1PageHeader
        title={S.title}
        subtitle={S.subtitle(pending, items.length)}
        right={
          <N1IconButton
            icon={searching ? 'close' : 'search'}
            size="sm"
            accessibilityLabel={searching ? L.closeSearch : L.openSearch}
            onPress={searching ? stopSearching : openSearch}
          />
        }
      />
      {searching && (
        <N1TextInput
          leftIcon="search"
          value={query}
          onChangeText={setQuery}
          placeholder={L.search}
          autoFocus
          testID="my-jobs-search"
        />
      )}
      <N1Tabs tabs={TABS} value={kind} onChange={setKind} fullWidth />
      <N1Button
        title={L.importJob}
        leftIcon="scan"
        size="lg"
        fullWidth
        onPress={() => navigation.navigate('ScanJob', { qcKind: kind })}
        testID="import-job"
      />
      <AsyncContent
        status={status}
        error={error}
        onRetry={reload}
        hasData={items.length > 0}
      >
        {filtered.length === 0 ? (
          <N1Text color="secondary" align="center">
            {items.length ? COMMON_STRINGS.noResults : L.empty}
          </N1Text>
        ) : (
          filtered.map((c, i) => {
            const item = qcItem(c, kind);
            const meta = QC_STATUS_META[item.status];
            return (
              <N1ListItem
                key={c.id}
                title={jobHeading(c)}
                subtitle={`${item.stage} · ${item.subject}`}
                right={<N1Badge label={meta.label} tone={meta.tone} dot />}
                onPress={() => openCheck(c)}
                divider={i < filtered.length - 1}
                testID={`qc-row-${c.id}`}
              />
            );
          })
        )}
      </AsyncContent>
    </UserScreen>
  );
}
