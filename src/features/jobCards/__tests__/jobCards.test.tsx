import { Alert } from 'react-native';
import {
  allText,
  byLabel,
  byText,
  byTestId,
  choose,
  hasTestId,
  press,
  renderAdmin,
  typeInto,
} from '../../../shared/testing/testUtils';
import { MOCK_JOB_CARDS } from '../api/mockData';
import type { JobCard, JobOperation } from '../types';
import {
  canPauseOrComplete,
  canStart,
  completeOperation,
  currentOperation,
  flowInput,
  initialFlowSteps,
  jobProgress,
  optionsFrom,
  pauseOperation,
  progressTone,
  startOperation,
  statusFor,
  stepStatus,
} from '../utils';

let mockWidth = 1280;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 900, scale: 1, fontScale: 1 }),
}));

beforeEach(() => {
  mockWidth = 1280;
});
afterEach(() => jest.restoreAllMocks());

const cardById = (id: string) =>
  MOCK_JOB_CARDS.find(c => c.id === id) as JobCard;

const op = (
  status: JobOperation['status'],
  name = 'Drilling',
): JobOperation => ({
  id: `${name}-${status}`,
  name,
  machine: 'M-1',
  operator: 'Ravi Kumar',
  status,
  startedAt: status === 'pending' ? null : '2026-09-25T09:00:00',
  completedAt: status === 'completed' ? '2026-09-25T10:00:00' : null,
});

describe('job card rules', () => {
  test('progress counts completed steps fully and a started step half', () => {
    expect(jobProgress(cardById('1040'))).toBe(90);
    expect(jobProgress(cardById('1035'))).toBe(100);
    expect(jobProgress(cardById('1036'))).toBe(0);
    expect(progressTone(30)).toBe('warning');
    expect(progressTone(65)).toBe('info');
    expect(progressTone(100)).toBe('success');
  });

  test('status follows the operations', () => {
    expect(statusFor([])).toBe('not_started');
    expect(statusFor([op('pending')])).toBe('not_started');
    expect(statusFor([op('completed'), op('pending')])).toBe('in_progress');
    expect(statusFor([op('completed'), op('paused')])).toBe('paused');
    expect(statusFor([op('running')])).toBe('in_progress');
    expect(statusFor([op('completed')])).toBe('completed');
  });

  test('current operation is the started step, else the next, else the last', () => {
    expect(currentOperation(cardById('1042'))?.name).toBe('Turning (Lathe)');
    expect(currentOperation(cardById('1035'))?.name).toBe('Packing');
    expect(currentOperation(cardById('1036'))).toBeUndefined();
  });

  test('start, pause, resume and complete move through the route', () => {
    const now = '2026-10-01T11:00:00';
    let card: JobCard = { ...cardById('1042') };
    expect(canStart(card)).toBe(false);
    expect(canPauseOrComplete(card)).toBe(true);

    card = { ...card, ...pauseOperation(card) };
    expect(card.status).toBe('paused');
    expect(canStart(card)).toBe(true);

    card = { ...card, ...startOperation(card, now) };
    const turning = card.operations[2];
    expect(turning.status).toBe('running');
    // Resuming keeps the original start time.
    expect(turning.startedAt).toBe('2026-09-25T10:25:00');

    card = { ...card, ...completeOperation(card, now) };
    expect(card.operations[2]).toMatchObject({
      status: 'completed',
      completedAt: now,
    });
    expect(card.status).toBe('in_progress');

    card = { ...card, ...startOperation(card, now) };
    expect(card.operations[3]).toMatchObject({
      name: 'Deburring',
      status: 'running',
      startedAt: now,
    });
  });

  test('completing the last step completes the card', () => {
    const card: JobCard = {
      ...cardById('1042'),
      operations: [op('completed'), op('running', 'Packing')],
    };
    expect(completeOperation(card, 'now').status).toBe('completed');
  });

  test('saving a flow keeps progress on unchanged and started steps', () => {
    const card = cardById('1042');
    const steps = initialFlowSteps(card, 3);
    expect(steps).toHaveLength(6);
    expect(stepStatus(steps[0], true)).toBe('completed');
    expect(stepStatus(steps[2], true)).toBe('current');
    expect(stepStatus(steps[3], true)).toBe('upcoming');
    expect(stepStatus(steps[3], false)).toBe('draft');

    const edited = [
      ...steps.slice(0, 2),
      { ...steps[2], name: 'CNC Turning' },
      { ...steps[3], name: 'Drilling' },
      { key: 'x', name: 'Packing' },
    ];
    const { operations, status } = flowInput(edited);
    expect(operations[0]).toBe(card.operations[0]);
    expect(operations[2]).toMatchObject({
      name: 'CNC Turning',
      status: 'running',
      machine: 'CNC-02',
    });
    expect(operations[3]).toMatchObject({
      id: '1042-op4',
      name: 'Drilling',
      status: 'pending',
    });
    expect(operations[4]).toMatchObject({ name: 'Packing', status: 'pending' });
    expect(status).toBe('in_progress');
  });

  test('a card without a flow starts with blank steps', () => {
    const steps = initialFlowSteps(cardById('1036'), 3);
    expect(steps.map(s => s.name)).toEqual(['', '', '']);
  });

  test('filter options are distinct and sorted after "All"', () => {
    expect(optionsFrom(['b', 'a', 'b', ''], 'All').map(o => o.label)).toEqual([
      'All',
      'a',
      'b',
    ]);
  });
});

describe('Job Cards list', () => {
  test('table shows each card with its current operation and progress', async () => {
    const { root } = await renderAdmin('JobCards');
    const text = allText(byTestId(root, 'job-cards-table'));
    expect(text).toContain('WO #1042');
    expect(text).toContain('Bracket — Job A');
    expect(text).toContain('Turning (Lathe)');
    expect(text).toContain('CNC-02');
    expect(text).toContain('Arun Prakash');
    expect(allText(byTestId(root, 'progress-1040'))).toContain('90%');
    expect(allText(root)).toContain('Showing 10 of 10 job cards');
    // Completed work sorts last.
    expect(text.indexOf('WO #1035')).toBeGreaterThan(text.indexOf('WO #1034'));
  });

  test('filters by operation and operator, and searches', async () => {
    const { root } = await renderAdmin('JobCards');
    await choose(root, 'filter-operation', 'QC Inspection');
    expect(allText(root)).toContain('Showing 2 of 2 job cards');
    await choose(root, 'filter-operation', 'All operations');
    await choose(root, 'filter-operator', 'Karthik Iyer');
    expect(allText(root)).toContain('Showing 1 of 1 job cards');
    await choose(root, 'filter-operator', 'All operators');
    await typeInto(byLabel(root, 'Search job cards'), 'coupling');
    expect(allText(byTestId(root, 'job-cards-table'))).toContain('WO #1036');
    expect(allText(root)).toContain('Showing 1 of 1 job cards');
  });

  test('the diagram button explains drawings are not available yet', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { root } = await renderAdmin('JobCards');
    await press(byLabel(root, 'Open drawing for WO #1042'));
    expect(alert).toHaveBeenCalledWith(
      'Not available yet',
      expect.stringContaining('Opening drawings'),
    );
  });

  test('plus opens Create flow', async () => {
    const h = await renderAdmin('JobCards');
    await press(byLabel(h.root, 'Create flow for WO #1036'));
    expect(h.currentRoute()).toBe('JobCardFlow');
    expect(allText(byTestId(h.root, 'job-card-flow-screen'))).toContain(
      'Create flow',
    );
  });

  test('pencil opens Edit flow', async () => {
    const h = await renderAdmin('JobCards');
    await press(byLabel(h.root, 'Edit flow for WO #1042'));
    expect(allText(byTestId(h.root, 'job-card-flow-screen'))).toContain(
      'Edit flow',
    );
  });

  test('phone shows stats and cards with View and flow buttons', async () => {
    mockWidth = 390;
    const h = await renderAdmin('JobCards');
    expect(allText(byTestId(h.root, 'stat-active'))).toContain('9');
    expect(allText(byTestId(h.root, 'stat-completed'))).toContain('1');
    const card = byTestId(h.root, 'job-card-1042');
    expect(allText(card)).toContain('Turning (Lathe) · CNC-02');
    expect(allText(card)).toContain('Operator: Arun Prakash');
    await press(byLabel(card, 'View job card WO #1042'));
    expect(h.currentRoute()).toBe('JobCardDetails');
  });
});

describe('Job Cards list actions', () => {
  test('rows have flow and delete buttons, not view', async () => {
    const h = await renderAdmin('JobCards');
    expect(() => byLabel(h.root, 'View job card WO #1042')).toThrow();
    expect(byLabel(h.root, 'Edit flow for WO #1042')).toBeTruthy();
    expect(byLabel(h.root, 'Create flow for WO #1036')).toBeTruthy();
    expect(byLabel(h.root, 'Delete job card WO #1042')).toBeTruthy();
  });

  test('delete asks first, then removes the job card', async () => {
    const h = await renderAdmin('JobCards');
    await press(byLabel(h.root, 'Delete job card WO #1042'));
    expect(allText(h.root)).toContain('Delete job card?');

    // Cancel keeps it.
    const cancel = h.root.findAll(
      n =>
        typeof n.type === 'string' && n.props.accessibilityLabel === 'Cancel',
    );
    await press(cancel[cancel.length - 1]);
    expect(allText(h.root)).toContain('WO #1042');

    await press(byLabel(h.root, 'Delete job card WO #1042'));
    const confirm = h.root.findAll(
      n =>
        typeof n.type === 'string' &&
        n.props.accessibilityLabel === 'Delete job card',
    );
    await press(confirm[confirm.length - 1]);
    expect(allText(h.root)).not.toContain('WO #1042');
    // Confirming doesn't count as a row click.
    expect(h.currentRoute()).not.toBe('JobCardDetails');
  });
});

describe('Job card details', () => {
  test('shows the order, drawing, material, route card and QC history', async () => {
    const h = await renderAdmin('JobCards');
    // Clicking anywhere on the row opens the job card.
    await press(byText(h.root, 'Bracket — Job A'));
    const screen = byTestId(h.root, 'job-card-details-screen');
    const text = allText(screen);
    expect(text).toContain('WO #1042 · Acme Metalworks');
    expect(text).toContain('In progress');
    expect(text).toContain('High');
    expect(text).toContain('02 Oct 2026');
    expect(text).toContain('200 pcs');
    expect(text).toContain('drawing.pdf');
    expect(text).toContain('Design approval: Approved');
    expect(text).toContain('Company purchased');
    expect(allText(byTestId(screen, 'overall-progress'))).toContain('42%');

    // Every step is listed; only the current one starts open (and highlighted).
    const step = (id: string) => byTestId(screen, `operation-1042-${id}`);
    expect(allText(step('op1'))).toContain('Material QC');
    expect(allText(step('op1'))).not.toContain('QC Bay 1');
    expect(step('op1').props.accessibilityState).toMatchObject({
      selected: false,
      expanded: false,
    });
    expect(step('op3').props.accessibilityState).toMatchObject({
      selected: true,
      expanded: true,
    });

    // Each step opens and closes on its own.
    for (const id of ['op1', 'op4', 'op5']) {
      await press(step(id));
    }
    expect(step('op1').props.accessibilityState).toMatchObject({
      expanded: true,
    });
    await press(step('op3'));
    expect(step('op3').props.accessibilityState).toMatchObject({
      selected: true,
      expanded: false,
    });
    await press(step('op3'));
    expect(allText(byTestId(screen, 'operation-1042-op1'))).toContain(
      'QC Bay 1 · Suresh Babu',
    );
    expect(allText(byTestId(screen, 'operation-1042-op1'))).toContain(
      'Completed at: 09:45 AM',
    );
    expect(allText(byTestId(screen, 'operation-1042-op3'))).toContain(
      'Started at: 10:25 AM',
    );
    expect(allText(byTestId(screen, 'operation-1042-op4'))).toContain(
      'Next operation',
    );
    expect(allText(byTestId(screen, 'operation-1042-op5'))).toContain(
      'Upcoming',
    );
    const qc = allText(byTestId(screen, 'qc-history'));
    expect(qc).toContain('Facing - QC');
    expect(qc).toContain('Passed');
    expect(qc).toContain('Voice + text note');
    expect(text).toContain('Not invoiced');
  });

  test('quick actions pause, resume and complete the running step', async () => {
    const h = await renderAdmin('JobCards');
    await h.navigate('JobCardDetails', { jobCardId: '1042' });
    const screen = () => byTestId(h.root, 'job-card-details-screen');
    const disabled = (id: string) =>
      byTestId(screen(), id).props.accessibilityState.disabled;
    // A step is already running, so only Pause and Complete apply.
    expect(disabled('start-operation')).toBe(true);
    expect(disabled('pause-operation')).toBe(false);

    await press(byTestId(screen(), 'pause-operation'));
    expect(h.store.getState().jobCards.entities['1042'].status).toBe('paused');
    expect(allText(byTestId(screen(), 'operation-1042-op3'))).toContain(
      'Paused',
    );

    expect(disabled('start-operation')).toBe(false);
    expect(disabled('complete-operation')).toBe(true);

    await press(byTestId(screen(), 'start-operation'));
    await press(byTestId(screen(), 'complete-operation'));
    const ops = h.store.getState().jobCards.entities['1042'].operations;
    expect(ops[2].status).toBe('completed');
    expect(allText(byTestId(screen(), 'overall-progress'))).toContain('50%');
    expect(allText(byTestId(screen(), 'operation-1042-op4'))).toContain(
      'Next operation',
    );
  });

  test('print explains it is not available yet', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const h = await renderAdmin('JobCards');
    await h.navigate('JobCardDetails', { jobCardId: '1042' });
    const screen = byTestId(h.root, 'job-card-details-screen');
    await press(byLabel(screen, 'Print Job Card'));
    expect(alert).toHaveBeenCalledTimes(1);
  });

  test('dispatch against the customer’s quote adds an invoice', async () => {
    const h = await renderAdmin('JobCards');
    await h.navigate('JobCardDetails', { jobCardId: '1042' });
    await press(byTestId(h.root, 'generate-dispatch'));

    // Acme Metalworks' quote, plus "No quote".
    const modal = allText(byTestId(h.root, 'dispatch-modal'));
    expect(modal).toContain('QT-2026-0040');
    expect(modal).toContain('No quote');
    expect(modal).not.toContain('QT-2026-0042');

    // Nothing picked yet.
    await press(byTestId(h.root, 'dispatch-submit'));
    expect(allText(h.root)).toContain('Pick a quote, or No quote.');

    await press(byTestId(h.root, 'dispatch-quote-QT-2026-0040'));
    await press(byTestId(h.root, 'dispatch-submit'));

    expect(h.currentRoute()).toBe('InvoiceDetails');
    const invoice = Object.values(
      h.store.getState().billing.invoices.entities,
    ).find(i => i?.jobId === 'WO-01042');
    expect(invoice).toMatchObject({
      customerName: 'Acme Metalworks',
      quoteId: 'QT-2026-0040',
      status: 'draft',
      quantity: 200,
    });
    expect(invoice?.lineItems.length).toBeGreaterThan(0);
    // The quote is now mapped to this order.
    expect(
      h.store.getState().billing.quotes.entities['QT-2026-0040']?.orderId,
    ).toBe('1042');
  });

  test('dispatch with no quote lists the job’s operations to price', async () => {
    const h = await renderAdmin('JobCards');
    await h.navigate('JobCardDetails', { jobCardId: '1039' });
    await press(byTestId(h.root, 'generate-dispatch'));
    await press(byTestId(h.root, 'dispatch-no-quote'));
    await press(byTestId(h.root, 'dispatch-submit'));

    // Rates still to fill in: straight to the invoice editor.
    expect(h.currentRoute()).toBe('InvoiceEdit');
    const invoice = Object.values(
      h.store.getState().billing.invoices.entities,
    ).find(i => i?.jobId === 'WO-01039');
    expect(invoice).toMatchObject({ quoteId: null, gstRate: 18 });
    expect(invoice?.lineItems.map(l => l.operation)).toEqual([
      'Material QC',
      'CNC Milling',
      'Drilling',
      'Deburring',
      'QC Inspection',
    ]);

    // Dispatching again opens the same invoice instead of a second one.
    await h.navigate('JobCardDetails', { jobCardId: '1039' });
    await press(byTestId(h.root, 'generate-dispatch'));
    expect(allText(byTestId(h.root, 'dispatch-modal'))).toContain(
      `already billed on ${invoice?.id}`,
    );
  });

  test('a card without a flow offers Create flow', async () => {
    const h = await renderAdmin('JobCards');
    await h.navigate('JobCardDetails', { jobCardId: '1036' });
    const screen = byTestId(h.root, 'job-card-details-screen');
    expect(allText(screen)).toContain('No process flow yet');
    expect(allText(screen)).toContain('Not started');
    await press(byTestId(screen, 'open-flow'));
    expect(h.currentRoute()).toBe('JobCardFlow');
  });

  test('a rejected material shows what RM QC rejected; only supervisors re-initiate', async () => {
    const h = await renderAdmin('JobCards');
    await h.navigate('JobCardDetails', { jobCardId: '1041' });
    const screen = byTestId(h.root, 'job-card-details-screen');
    const rejected = allText(byTestId(screen, 'rejected-material'));
    expect(rejected).toContain('Rejected material');
    expect(rejected).toContain('HT-99212');
    expect(hasTestId(screen, 'reinitiate-rm-qc')).toBe(false);
  });

  test('an unknown card says it no longer exists', async () => {
    const h = await renderAdmin('JobCards');
    await h.navigate('JobCardDetails', { jobCardId: 'nope' });
    expect(allText(h.root)).toContain('This job card no longer exists.');
  });

  test('order details open this work order’s job card', async () => {
    const h = await renderAdmin('Orders');
    await h.navigate('OrderDetails', { orderId: '1042' });
    await press(byTestId(h.root, 'view-route-card'));
    expect(h.currentRoute()).toBe('JobCardDetails');
    expect(allText(byTestId(h.root, 'job-card-details-screen'))).toContain(
      'WO #1042 · Acme Metalworks',
    );
  });
});

describe('Create / Edit flow', () => {
  test('create needs every step chosen, then saves the flow', async () => {
    const h = await renderAdmin('JobCards');
    await h.navigate('JobCardFlow', { jobCardId: '1036' });
    const screen = () => byTestId(h.root, 'job-card-flow-screen');
    expect(allText(screen())).toContain('WO #1036 · Bright Steel Co.');
    expect(allText(screen())).toContain('Medium priority');
    expect(hasTestId(screen(), 'flow-step-3')).toBe(true);

    await press(byTestId(screen(), 'flow-submit'));
    expect(allText(screen()).split('This field is required').length - 1).toBe(
      3,
    );

    await press(byLabel(screen(), 'Remove step 3'));
    await choose(h.root, 'flow-step-1-operation', 'Material QC');
    await choose(h.root, 'flow-step-2-operation', 'CNC Turning');
    await press(byTestId(screen(), 'add-process'));
    await choose(h.root, 'flow-step-3-operation', 'Packing');
    await press(byTestId(screen(), 'flow-submit'));

    const card = h.store.getState().jobCards.entities['1036'];
    expect(card.operations.map(o => o.name)).toEqual([
      'Material QC',
      'CNC Turning',
      'Packing',
    ]);
    expect(card.operations.every(o => o.status === 'pending')).toBe(true);
    expect(h.currentRoute()).not.toBe('JobCardFlow');
  });

  test('removing every step asks for at least one', async () => {
    const h = await renderAdmin('JobCards');
    await h.navigate('JobCardFlow', { jobCardId: '1036' });
    const screen = () => byTestId(h.root, 'job-card-flow-screen');
    for (let i = 3; i >= 1; i -= 1) {
      await press(byLabel(screen(), `Remove step ${i}`));
    }
    await press(byTestId(screen(), 'flow-submit'));
    expect(allText(screen())).toContain('Add at least one operation');
    expect(h.store.getState().jobCards.entities['1036'].operations).toEqual([]);
  });

  test('edit locks completed steps and saves changes to the rest', async () => {
    const h = await renderAdmin('JobCards');
    await h.navigate('JobCardFlow', { jobCardId: '1042' });
    const screen = () => byTestId(h.root, 'job-card-flow-screen');
    const text = allText(screen());
    expect(text).toContain('Completed steps are locked.');
    expect(text).toContain('In progress');
    expect(text).toContain('Upcoming');
    expect(byLabel(byTestId(screen(), 'flow-step-1'), 'Locked')).toBeTruthy();

    await press(byLabel(screen(), 'Remove step 6'));
    await choose(h.root, 'flow-step-5-operation', 'Packing');
    await press(byTestId(screen(), 'flow-submit'));

    const ops = h.store.getState().jobCards.entities['1042'].operations;
    expect(ops.map(o => o.name)).toEqual([
      'Material QC',
      'Facing (Lathe)',
      'Turning (Lathe)',
      'Deburring',
      'Packing',
    ]);
    expect(ops[0].status).toBe('completed');
    expect(ops[2].status).toBe('running');
  });

  test('cancel leaves the flow unchanged', async () => {
    const h = await renderAdmin('JobCards');
    await h.navigate('JobCardFlow', { jobCardId: '1042' });
    const screen = byTestId(h.root, 'job-card-flow-screen');
    await press(byLabel(screen, 'Remove step 6'));
    await press(byLabel(screen, 'Cancel'));
    expect(
      h.store.getState().jobCards.entities['1042'].operations,
    ).toHaveLength(6);
  });

  test('phone pins the save button and uses a close icon', async () => {
    mockWidth = 390;
    const h = await renderAdmin('JobCards');
    await h.navigate('JobCardFlow', { jobCardId: '1042' });
    const screen = byTestId(h.root, 'job-card-flow-screen');
    expect(allText(screen)).toContain('Save changes');
    expect(allText(screen)).toContain('High');
    expect(allText(screen)).not.toContain('High priority');
  });

  test('an unknown card says it no longer exists', async () => {
    const h = await renderAdmin('JobCards');
    await h.navigate('JobCardFlow', { jobCardId: 'nope' });
    expect(allText(h.root)).toContain('This job card no longer exists.');
  });
});
