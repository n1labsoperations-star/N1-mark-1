import { useCallback, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import {
  AdminScreen,
  AsyncContent,
  ComingSoon,
  DetailHeader,
  FormFooter,
  N1Badge,
  N1Button,
  N1Card,
  N1Chip,
  N1Divider,
  N1DropDown,
  N1ProcessStep,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useOnSettled } from '../../../shared/hooks';
import { formatLongDate } from '../../../shared/utils';
import { PRIORITY_META } from '../../orders/constants';
import { DashedTile } from '../components/DashedTile';
import {
  JOB_CARD_STRINGS,
  NEW_FLOW_STEPS,
  OPERATION_OPTIONS,
} from '../constants';
import { useJobCard } from '../hooks/useJobCards';
import type { JobCard, JobCardsScreenProps } from '../types';
import {
  flowInput,
  initialFlowSteps,
  jobCustomerHeading,
  jobTitle,
  stepStatus,
  type FlowStep,
} from '../utils';

const S = JOB_CARD_STRINGS;
const F = S.flow;

const makeStyles = createN1Styles(t => ({
  section: { gap: t.spacing.lg },
  steps: { gap: t.spacing.md },
  summary: { gap: t.spacing.sm },
  summaryMuted: {
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.background,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
  title: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
  heading: { gap: t.spacing.xs },
}));

let nextKey = 0;
const blankStep = (): FlowStep => {
  nextKey += 1;
  return { key: `added-${nextKey}`, name: '' };
};

/** Work order, part and material at the top of the flow editor. */
function FlowSummary({ jobCard }: { jobCard: JobCard }) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const priority = PRIORITY_META[jobCard.priority];
  return (
    <View style={[styles.summary, isCompact && styles.summaryMuted]}>
      <View style={styles.titleRow}>
        <N1Text variant={isCompact ? 'title' : 'h2'} style={styles.title}>
          {jobCustomerHeading(jobCard)}
        </N1Text>
        <N1Badge
          label={isCompact ? priority.label : F.priority(priority.label)}
          tone={priority.tone}
        />
      </View>
      <N1Text color="secondary">
        {jobTitle(jobCard) || COMMON_STRINGS.dash}
      </N1Text>
      <View style={styles.chips}>
        <N1Chip
          label={isCompact ? undefined : F.material}
          value={jobCard.material || COMMON_STRINGS.dash}
        />
        <N1Chip label={F.qty} value={S.quantity(jobCard.quantity)} />
        <N1Chip label={F.due} value={formatLongDate(jobCard.dueDate)} />
      </View>
    </View>
  );
}

type EditorProps = {
  jobCard: JobCard;
  editing: boolean;
  header: ReactNode;
  onDone: () => void;
};

/** The step list and save button; mounted once the card has loaded. */
function FlowEditor({ jobCard, editing, header, onDone }: EditorProps) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const { update, saving, saveError } = useJobCard(jobCard.id);
  const [steps, setSteps] = useState(() =>
    initialFlowSteps(jobCard, NEW_FLOW_STEPS),
  );
  const [submitted, setSubmitted] = useState(false);
  useOnSettled(saving, saveError, onDone);

  const rename = useCallback(
    (key: string, name: string) =>
      setSteps(prev => prev.map(s => (s.key === key ? { ...s, name } : s))),
    [],
  );
  const remove = useCallback(
    (key: string) => setSteps(prev => prev.filter(s => s.key !== key)),
    [],
  );
  const add = useCallback(() => setSteps(prev => [...prev, blankStep()]), []);

  const submit = () => {
    setSubmitted(true);
    if (steps.length && steps.every(s => s.name)) {
      update(jobCard.id, flowInput(steps));
    }
  };
  const submitLabel = editing ? F.save : F.create;
  const noSteps = submitted && !steps.length;
  const flow = (
    <View style={styles.section}>
      <View style={styles.heading}>
        {isCompact ? (
          <N1Text variant="title" weight="bold">
            {F.section}
          </N1Text>
        ) : (
          <N1Text variant="overline" color="secondary">
            {F.section}
          </N1Text>
        )}
        <N1Text variant="small" color="secondary">
          {editing ? F.editHelp : F.createHelp}
        </N1Text>
      </View>
      <View style={styles.steps}>
        {steps.map((step, i) => {
          const stepState = stepStatus(step, editing);
          return (
            <N1ProcessStep
              key={step.key}
              number={i + 1}
              status={stepState}
              onRemove={() => remove(step.key)}
              testID={`flow-step-${i + 1}`}
            >
              <N1DropDown
                options={OPERATION_OPTIONS}
                value={step.name || null}
                onChange={name => rename(step.key, name)}
                placeholder={F.stepPlaceholder}
                sheetTitle={F.stepLabel(i + 1)}
                disabled={stepState === 'completed'}
                errorText={
                  submitted && !step.name ? COMMON_STRINGS.required : undefined
                }
                testID={`flow-step-${i + 1}-operation`}
              />
            </N1ProcessStep>
          );
        })}
      </View>
      {noSteps && (
        <N1Text variant="small" color="danger">
          {F.noSteps}
        </N1Text>
      )}
      <DashedTile
        icon="plus"
        label={F.addProcess}
        layout="row"
        onPress={add}
        testID="add-process"
      />
    </View>
  );

  const compactFooter = (
    <N1Button
      title={submitLabel}
      leftIcon="check"
      fullWidth
      loading={saving}
      onPress={submit}
      testID="flow-submit"
    />
  );

  return (
    <AdminScreen
      header={header}
      compactFooter={compactFooter}
      testID="job-card-flow-screen"
    >
      {isCompact ? (
        <>
          <FlowSummary jobCard={jobCard} />
          {flow}
        </>
      ) : (
        <N1Card padding="xxl">
          <View style={styles.section}>
            <FlowSummary jobCard={jobCard} />
            <N1Divider spacing="sm" />
            {flow}
            <N1Divider spacing="sm" />
            <FormFooter
              compact
              submitLabel={submitLabel}
              submitIcon="check"
              onSubmit={submit}
              onCancel={onDone}
              loading={saving}
              submitTestID="flow-submit"
            />
          </View>
        </N1Card>
      )}
    </AdminScreen>
  );
}

/** Create flow (no route card yet) and Edit flow (completed steps locked). */
export function JobCardFlowScreen({
  route,
  navigation,
}: JobCardsScreenProps<'JobCardFlow'>) {
  const { isCompact } = useN1Breakpoint();
  const { jobCard, status, error, reload } = useJobCard(route.params.jobCardId);
  const isEdit = Boolean(jobCard?.operations.length);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const title = isEdit ? F.editTitle : F.createTitle;
  const header = (
    <DetailHeader
      title={title}
      onBack={goBack}
      backIcon={isCompact ? 'close' : 'arrow-left'}
    />
  );

  if (!jobCard) {
    return (
      <AdminScreen header={header}>
        <AsyncContent status={status} error={error} onRetry={reload}>
          <ComingSoon
            icon="clipboard"
            title={title}
            message={S.details.notFound}
          />
        </AsyncContent>
      </AdminScreen>
    );
  }
  return (
    <FlowEditor
      jobCard={jobCard}
      editing={isEdit}
      header={header}
      onDone={goBack}
    />
  );
}
