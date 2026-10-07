import { Fragment, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  AsyncContent,
  N1Button,
  N1Divider,
  N1Header,
  N1IconButton,
  N1ListItem,
  N1PageHeader,
  N1Text,
  N1TextInput,
  UserScreen,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { COMMON_STRINGS, SEARCH_INPUT_PROPS } from '../../../shared/constants';
import { useListFilter, useToggle } from '../../../shared/hooks';
import {
  JobCardCard,
  JobCardStatusBadge,
  currentOperation,
  jobCardSearchText,
  jobHeading,
  type JobCard,
} from '../../jobCards';
import { JOBS_STRINGS, ROLE_JOBS } from '../constants';
import { useMyJobs } from '../hooks/useMyJobs';
import type { JobsScreenProps } from '../types';

const S = JOBS_STRINGS.myJobs;

type Navigation = JobsScreenProps<'ScanJob'>['navigation'];

const makeStyles = createN1Styles(() => ({
  // Line the cards up with the page header; dividers separate them.
  card: { paddingHorizontal: 0 },
}));

/** "Turning (Lathe) · CNC-02" */
const whereNow = (c: JobCard) => {
  const op = currentOperation(c);
  return [op?.name, op?.machine].filter(Boolean).join(' · ');
};

/** Jobs tab: the user's imported jobs, with Import Job to add another. */
export function MyJobsScreen() {
  const styles = useN1Styles(makeStyles);
  const navigation = useNavigation<Navigation>();
  const { role, items, stats, status, error, reload } = useMyJobs();
  const rows = ROLE_JOBS[role].list === 'rows';
  const [searching, openSearch, closeSearch] = useToggle(false);
  const { query, setQuery, filtered } = useListFilter(items, {
    getSearchText: jobCardSearchText,
  });

  const stopSearching = useCallback(() => {
    setQuery('');
    closeSearch();
  }, [setQuery, closeSearch]);
  const openDetails = useCallback(
    (c: JobCard) => navigation.navigate('JobCardDetails', { jobCardId: c.id }),
    [navigation],
  );
  const openJob = useCallback(
    (c: JobCard) => navigation.navigate('OperatorJob', { jobCardId: c.id }),
    [navigation],
  );
  const openFlow = useCallback(
    (c: JobCard) =>
      navigation.navigate('JobCardDetails', {
        jobCardId: c.id,
        editFlow: true,
      }),
    [navigation],
  );

  const searchButton = (
    <N1IconButton
      icon={searching ? 'close' : 'search'}
      size="sm"
      accessibilityLabel={searching ? S.closeSearch : S.openSearch}
      onPress={searching ? stopSearching : openSearch}
    />
  );

  return (
    <UserScreen header={<N1Header variant="brand" />} testID="my-jobs-screen">
      <N1PageHeader
        title={S.title}
        subtitle={
          rows
            ? S.inProgressSubtitle(stats.inProgress, stats.total)
            : S.subtitle(stats.active, stats.total)
        }
        right={searchButton}
      />
      {searching && (
        <N1TextInput
          leftIcon="search"
          {...SEARCH_INPUT_PROPS}
          value={query}
          onChangeText={setQuery}
          placeholder={S.search}
          autoFocus
          testID="my-jobs-search"
        />
      )}
      <N1Button
        title={S.importJob}
        leftIcon="scan"
        size="lg"
        fullWidth
        onPress={() => navigation.navigate('ScanJob')}
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
            {items.length ? COMMON_STRINGS.noResults : S.empty}
          </N1Text>
        ) : (
          filtered.map((c, i) =>
            rows ? (
              <N1ListItem
                key={c.id}
                title={jobHeading(c)}
                subtitle={whereNow(c) || COMMON_STRINGS.dash}
                right={<JobCardStatusBadge jobCard={c} />}
                onPress={() => openJob(c)}
                divider={i < filtered.length - 1}
                testID={`job-row-${c.id}`}
              />
            ) : (
              <Fragment key={c.id}>
                {i > 0 && <N1Divider />}
                <JobCardCard
                  jobCard={c}
                  onView={openDetails}
                  onFlow={openFlow}
                  style={styles.card}
                />
              </Fragment>
            ),
          )
        )}
      </AsyncContent>
    </UserScreen>
  );
}
