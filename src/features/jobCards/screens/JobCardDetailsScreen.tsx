import { useCallback, type ReactNode } from 'react';
import { View } from 'react-native';
import { StackActions } from '@react-navigation/native';
import {
  AdminScreen,
  AsyncContent,
  ComingSoon,
  DetailHeader,
  N1Button,
  N1Card,
  N1Chip,
  N1Divider,
  N1KeyValueList,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import { useToggle } from '../../../shared/hooks';
import {
  formatLongDate,
  notify,
  notifyUnavailable,
} from '../../../shared/utils';
import { BILLING_STRINGS, GenerateDispatchModal } from '../../billing';
import { PRIORITY_META } from '../../orders/constants';
import { useOptionalEmployeeRole } from '../../profile/context/EmployeeRoleContext';
import { DashedTile } from '../components/DashedTile';
import { JobCardStatusBadge, MetaBadge } from '../components/JobCardBadges';
import { QcHistory } from '../components/QcHistory';
import { RouteCard } from '../components/RouteCard';
import {
  BILLING_META,
  DESIGN_APPROVAL_META,
  DRAWING_TILE_WIDTH,
  JOB_CARD_STRINGS,
  MATERIAL_QC_META,
  MATERIAL_SOURCE_LABELS,
  QUOTATION_META,
} from '../constants';
import { useJobCard } from '../hooks/useJobCards';
import type { JobCardsScreenProps } from '../types';
import {
  canPauseOrComplete,
  canStart,
  completeOperation,
  jobCustomerHeading,
  jobProgress,
  materialRejection,
  pauseOperation,
  rejectedMaterialItems,
  startOperation,
} from '../utils';

const S = JOB_CARD_STRINGS;
const D = S.details;

const makeStyles = createN1Styles(t => ({
  section: { gap: t.spacing.md },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
  drawingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing.lg,
  },
  drawingTile: { width: DRAWING_TILE_WIDTH },
  inline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  keyValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
  routePanel: {
    gap: t.spacing.md,
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.background,
  },
  statusPair: { flexDirection: 'row', gap: t.spacing.xxxl },
  statusItem: { gap: t.spacing.sm },
}));

export function JobCardDetailsScreen({
  route,
  navigation,
}: JobCardsScreenProps<'JobCardDetails'>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const { jobCardId } = route.params;
  const { jobCard, status, error, reload, update, saving } =
    useJobCard(jobCardId);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const openFlow = useCallback(
    () => navigation.navigate('JobCardFlow', { jobCardId }),
    [navigation, jobCardId],
  );
  const print = useCallback(() => notifyUnavailable(D.print), []);
  const [dispatchOpen, openDispatch, closeDispatch] = useToggle(false);
  // Admin: open the invoice in Billing. Shop-floor roles have no Billing
  // screen, so they're told it was created.
  const showInvoice = useCallback(
    (invoiceId: string, fillRates: boolean) => {
      closeDispatch();
      const drawer = navigation.getParent();
      if (drawer?.getState()?.routeNames.includes('Billing')) {
        navigation.navigate('Billing', {
          screen: fillRates ? 'InvoiceEdit' : 'InvoiceDetails',
          params: { invoiceId },
          initial: false,
        });
      } else {
        notify(
          BILLING_STRINGS.dispatch.created,
          BILLING_STRINGS.dispatch.createdMessage(invoiceId),
        );
      }
    },
    [closeDispatch, navigation],
  );
  const openDrawing = useCallback(() => notifyUnavailable(S.openDrawing), []);
  // Supervisor only: enter the replacement material so RM QC checks it again.
  // RawMaterial lives in the role's stack, not the admin Job Cards stack.
  const canReinitiate = useOptionalEmployeeRole() === 'supervisor';
  const reinitiate = useCallback(
    () =>
      navigation.dispatch(
        StackActions.push('RawMaterial', { orderId: jobCardId, retest: true }),
      ),
    [navigation, jobCardId],
  );

  const header = (
    <DetailHeader
      title={D.title}
      onBack={goBack}
      backIcon={isCompact ? 'chevron-left' : 'arrow-left'}
    />
  );

  if (!jobCard) {
    return (
      <AdminScreen header={header}>
        <AsyncContent status={status} error={error} onRetry={reload}>
          <ComingSoon icon="clipboard" title={D.title} message={D.notFound} />
        </AsyncContent>
      </AdminScreen>
    );
  }

  const now = () => new Date().toISOString();
  const start = () => update(jobCard.id, startOperation(jobCard, now()));
  const pause = () => update(jobCard.id, pauseOperation(jobCard));
  const complete = () => update(jobCard.id, completeOperation(jobCard, now()));
  const running = canPauseOrComplete(jobCard);
  const hasFlow = jobCard.operations.length > 0;

  // Desktop uses small caps section labels; phones use bold titles.
  const heading = (text: string) =>
    isCompact ? (
      <N1Text variant="title" weight="bold">
        {text}
      </N1Text>
    ) : (
      <N1Text variant="overline" color="secondary">
        {text}
      </N1Text>
    );
  const divider = !isCompact && <N1Divider spacing="sm" />;
  const section = (children: ReactNode) => (
    <View style={styles.section}>{children}</View>
  );

  const quickActions = (
    <N1Card>
      <View style={isCompact ? styles.section : styles.actionsRow}>
        {isCompact ? (
          <N1Text variant="title" weight="bold">
            {D.quickActions}
          </N1Text>
        ) : (
          <N1Text variant="overline" color="secondary">
            {D.quickActions}
          </N1Text>
        )}
        <View style={styles.actionsRow}>
          <N1Button
            title={D.start}
            leftIcon="play"
            onPress={start}
            disabled={saving || !canStart(jobCard)}
            testID="start-operation"
          />
          <N1Button
            title={D.pause}
            leftIcon="pause"
            variant="secondary"
            onPress={pause}
            disabled={saving || !running}
            testID="pause-operation"
          />
          <N1Button
            title={D.complete}
            leftIcon="check-circle"
            variant="secondary"
            onPress={complete}
            disabled={saving || !running}
            testID="complete-operation"
          />
          <N1Button
            title={D.print}
            leftIcon="printer"
            variant="secondary"
            onPress={print}
          />
          <N1Button
            title={D.dispatch}
            leftIcon="package"
            variant="secondary"
            onPress={openDispatch}
            testID="generate-dispatch"
          />
        </View>
      </View>
    </N1Card>
  );

  const summary = section(
    <>
      <View style={isCompact ? styles.section : styles.titleRow}>
        <N1Text variant={isCompact ? 'h2' : 'h1'}>
          {jobCustomerHeading(jobCard)}
        </N1Text>
        <JobCardStatusBadge status={jobCard.status} />
      </View>
      <View style={styles.chips}>
        <N1Chip
          label={D.priority}
          value={PRIORITY_META[jobCard.priority].label}
        />
        <N1Chip label={D.due} value={formatLongDate(jobCard.dueDate)} />
        <N1Chip label={D.qty} value={S.quantity(jobCard.quantity)} />
      </View>
    </>,
  );

  const approval = DESIGN_APPROVAL_META[jobCard.designApproval];
  const drawing = section(
    <>
      {heading(D.drawing)}
      <View style={isCompact ? styles.section : styles.drawingRow}>
        <View style={!isCompact && styles.drawingTile}>
          <DashedTile
            icon="file"
            label={jobCard.designFile?.name ?? D.noDrawing}
            onPress={openDrawing}
            testID="drawing-file"
          />
        </View>
        <MetaBadge meta={approval} label={D.designApproval(approval.label)} />
      </View>
    </>,
  );

  const materialQc = <MetaBadge meta={MATERIAL_QC_META[jobCard.materialQc]} />;
  const rejection = materialRejection(jobCard);
  const rejected = jobCard.materialQc === 'rejected' && (
    <>
      {rejection?.rejectedMaterial && (
        <N1KeyValueList
          title={D.rejectedMaterial}
          items={[
            ...rejectedMaterialItems(rejection.rejectedMaterial),
            { label: D.reason, value: rejection.remark },
          ]}
          testID="rejected-material"
        />
      )}
      {canReinitiate && (
        <View style={styles.actionsRow}>
          <N1Button
            title={D.reinitiate}
            leftIcon="refresh"
            onPress={reinitiate}
            testID="reinitiate-rm-qc"
          />
        </View>
      )}
    </>
  );
  const material = section(
    <>
      {heading(D.material)}
      {isCompact ? (
        <>
          <View style={styles.keyValue}>
            <N1Text color="secondary">{D.source}</N1Text>
            <N1Text weight="semiBold">
              {MATERIAL_SOURCE_LABELS[jobCard.materialSource]}
            </N1Text>
          </View>
          <View style={styles.keyValue}>
            <N1Text color="secondary">{D.materialQc}</N1Text>
            {materialQc}
          </View>
        </>
      ) : (
        <View style={styles.inline}>
          <N1Text color="secondary">{`${D.source}: `}</N1Text>
          <N1Text weight="semiBold">
            {MATERIAL_SOURCE_LABELS[jobCard.materialSource]}
          </N1Text>
          <N1Text color="tertiary">|</N1Text>
          <N1Text color="secondary">{`${D.materialQc}:`}</N1Text>
          {materialQc}
        </View>
      )}
      {rejected}
    </>,
  );

  const flowButton = (
    <N1Button
      title={
        hasFlow ? (isCompact ? D.editFlowShort : D.editFlow) : D.createFlow
      }
      leftIcon={hasFlow ? 'edit' : 'plus'}
      variant="secondary"
      size="sm"
      onPress={openFlow}
      testID="open-flow"
    />
  );
  const routeCard = (
    <View style={isCompact ? styles.routePanel : styles.section}>
      <View style={styles.titleRow}>
        {heading(D.routeCard)}
        {flowButton}
      </View>
      <RouteCard
        operations={jobCard.operations}
        progress={jobProgress(jobCard)}
      />
    </View>
  );

  const qc = section(
    <>
      {heading(D.qcHistory)}
      <QcHistory entries={jobCard.qcHistory} />
    </>,
  );

  const commercial = (
    <View style={styles.statusPair}>
      <View style={styles.statusItem}>
        {heading(D.quotation)}
        <MetaBadge meta={QUOTATION_META[jobCard.quotation]} />
      </View>
      <View style={styles.statusItem}>
        {heading(D.billing)}
        <MetaBadge meta={BILLING_META[jobCard.billing]} />
      </View>
    </View>
  );

  const body = (
    <>
      {summary}
      {divider}
      {drawing}
      {divider}
      {material}
      {divider}
      {routeCard}
      {divider}
      {qc}
      {divider}
      {commercial}
    </>
  );

  return (
    <AdminScreen header={header} testID="job-card-details-screen">
      {quickActions}
      {isCompact ? (
        <View style={styles.section}>{body}</View>
      ) : (
        <N1Card padding="xxl">
          <View style={styles.section}>{body}</View>
        </N1Card>
      )}
      <GenerateDispatchModal
        visible={dispatchOpen}
        jobCard={jobCard}
        onClose={closeDispatch}
        onInvoice={showInvoice}
      />
    </AdminScreen>
  );
}
