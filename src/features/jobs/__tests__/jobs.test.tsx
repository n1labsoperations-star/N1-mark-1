import { Linking } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  allText,
  byLabel,
  byTestId,
  byText,
  flush,
  hasTestId,
  press,
  renderAppAs,
  typeInto,
} from '../../../shared/testing/testUtils';
import { SCAN_SUCCESS_DELAY_MS } from '../../../shared/constants';
import { jobCardsApi } from '../../jobCards/api/mockJobCardsApi';
import { MOCK_ORDERS } from '../../orders/api/mockData';
import { ordersApi } from '../../orders/api/mockOrdersApi';
import { normaliseJobCode, reopenOperation } from '../../jobCards/utils';
import { isRawMaterialMissing } from '../utils';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, scale: 1, fontScale: 1 }),
}));

let app: ReactTestRenderer.ReactTestRenderer | undefined;

// Only one linked NavigationContainer may be mounted at a time.
afterEach(async () => {
  await ReactTestRenderer.act(() => app?.unmount());
  app = undefined;
});

async function secondAdmin() {
  app = await renderAppAs('supervisor@n1.com', 'Supervisor@123');
  return app.root;
}

/** Import Order → Enter code manually → type the order ID → Import Order. */
async function importCode(
  root: ReactTestRenderer.ReactTestInstance,
  code: string,
) {
  await press(byTestId(root, 'import-job'));
  expect(allText(root)).toContain('Align the QR code within the frame');
  await press(byText(root, 'Enter code manually'));
  await typeInto(byTestId(root, 'job-code-input'), code);
  await press(byTestId(root, 'job-code-submit'));
}

describe('utils', () => {
  test('normaliseJobCode writes any WO number the way the server reads it', () => {
    expect(normaliseJobCode('WO-01042')).toBe('WO-1042');
    expect(normaliseJobCode('wo #1042')).toBe('WO-1042');
    expect(normaliseJobCode(' 1042 ')).toBe('WO-1042');
    // Card codes and QR values pass through.
    expect(normaliseJobCode('job12')).toBe('JOB12');
    expect(normaliseJobCode('JC-00012')).toBe('JC-00012');
    // The card code as shown on screen ("#JOB12") or typed with a "#".
    expect(normaliseJobCode('#JOB12')).toBe('JOB12');
    expect(normaliseJobCode('job#12')).toBe('JOB12');
    // An order QR code: only the first line counts, not the details under it.
    expect(normaliseJobCode('WO #1042\nPart no: PN-33021\nQty: 200')).toBe(
      'WO-1042',
    );
  });

  test('isRawMaterialMissing flags any blank raw material detail', () => {
    const [order] = MOCK_ORDERS;
    expect(isRawMaterialMissing(order)).toBe(false);
    expect(isRawMaterialMissing({ ...order, materialSource: '' })).toBe(true);
    expect(isRawMaterialMissing({ ...order, heatNumber: ' ' })).toBe(true);
  });
});

test("My Jobs lists the user's jobs with counts and search", async () => {
  const root = await secondAdmin();

  const text = allText(root);
  expect(text).toContain('My Jobs');
  expect(text).toContain('5 active · 5 total');
  expect(hasTestId(root, 'job-card-1042')).toBe(true);
  // A dispatched (Done) job leaves the list.
  expect(hasTestId(root, 'job-card-1035')).toBe(false);
  // Job cards that were never imported stay off the list.
  expect(hasTestId(root, 'job-card-1036')).toBe(false);

  // The black header: the N1 logo, "My Jobs" in the middle and the initials,
  // then the search, filter and QR scanner (Import Order).
  const header = byTestId(root, 'employee-home-header');
  expect(allText(header)).toMatch(/^My Jobs\|[A-Z]{1,2}$/);
  expect(hasTestId(header, 'employee-home-logo')).toBe(true);
  expect(hasTestId(header, 'my-jobs-search')).toBe(true);
  expect(hasTestId(header, 'my-jobs-filter')).toBe(true);
  expect(hasTestId(header, 'import-job')).toBe(true);

  const settle = () =>
    ReactTestRenderer.act(
      () => new Promise(resolve => setTimeout(resolve, 400)),
    );
  await typeInto(byTestId(root, 'my-jobs-search'), 'Housing');
  await settle();
  expect(hasTestId(root, 'job-card-1034')).toBe(true);
  expect(hasTestId(root, 'job-card-1042')).toBe(false);

  await typeInto(byTestId(root, 'my-jobs-search'), '');
  await settle();
  expect(hasTestId(root, 'job-card-1042')).toBe(true);
});

test("My Jobs' filter shows only the jobs at the picked stage", async () => {
  const root = await secondAdmin();
  const stages = () =>
    root
      .findAll(
        n =>
          typeof n.type === 'string' &&
          String(n.props.testID ?? '').startsWith('job-card-stage-'),
      )
      .map(n => allText(n));
  const all = stages();
  const picked = allText(byTestId(root, 'job-card-stage-1042'));
  expect(new Set(all).size).toBeGreaterThan(1);

  await press(byTestId(root, 'my-jobs-filter'));
  const panel = byTestId(root, 'my-jobs-filter-panel');
  await press(byLabel(panel, picked));
  await press(byTestId(root, 'my-jobs-filter-apply'));

  expect(hasTestId(root, 'job-card-1042')).toBe(true);
  expect(stages().every(stage => stage === picked)).toBe(true);
  expect(stages().length).toBeLessThan(all.length);
});

test('job codes that are blank or unknown show an error', async () => {
  const root = await secondAdmin();
  await importCode(root, '');
  expect(allText(root)).toContain('This field is required');

  await typeInto(byTestId(root, 'job-code-input'), 'WO-9999');
  await press(byTestId(root, 'job-code-submit'));
  expect(allText(root)).toContain('No order found for WO-9999');
});

/** Fires the mocked camera's barcode callback with one QR value. */
async function scan(root: ReactTestRenderer.ReactTestInstance, value: string) {
  const camera = byTestId(root, 'qr-camera');
  await ReactTestRenderer.act(async () =>
    camera.props.outputs[0].onBarcodeScanned([{ rawValue: value }]),
  );
  // The lookup (jobCardByQr) and the order it opens load.
  await flush();
}

describe('Scan QR code', () => {
  const permission = jest.requireMock('react-native-vision-camera')
    .__permission as { status: string };
  afterEach(() => {
    permission.status = 'authorized';
  });

  test('a scanned job code shows a tick, then imports the order', async () => {
    const root = await secondAdmin();
    await press(byTestId(root, 'import-job'));
    expect(byTestId(root, 'qr-camera').props.isActive).toBe(true);

    await scan(root, 'WO-01036');
    expect(hasTestId(root, 'scan-success')).toBe(true);
    expect(allText(root)).toContain('Opening WO #1036…');
    expect(byTestId(root, 'qr-camera').props.isActive).toBe(false);

    await ReactTestRenderer.act(
      () => new Promise(resolve => setTimeout(resolve, SCAN_SUCCESS_DELAY_MS)),
    );
    await flush();
    expect(allText(root)).toContain('WO #1036 · Coupling — Job G');
  });

  test('a bad code shows a cross until Scan again, and the flash toggles', async () => {
    const root = await secondAdmin();
    await press(byTestId(root, 'import-job'));

    await scan(root, 'WO-9999');
    let text = allText(root);
    expect(text).toContain("Couldn't open this code");
    expect(text).toContain('No order found for WO-9999');
    expect(hasTestId(root, 'scan-error')).toBe(true);
    // The camera waits for Scan again.
    expect(byTestId(root, 'qr-camera').props.isActive).toBe(false);

    await press(byText(root, 'Scan again'));
    expect(hasTestId(root, 'scan-error')).toBe(false);
    expect(byTestId(root, 'qr-camera').props.isActive).toBe(true);
    await scan(root, 'https://example.com');
    text = allText(root);
    expect(text).toContain('No order found for https://example.com');

    await press(byText(root, 'Scan again'));
    expect(byTestId(root, 'qr-camera').props.torchMode).toBe('off');
    await press(byLabel(root, 'Turn on flash'));
    expect(byTestId(root, 'qr-camera').props.torchMode).toBe('on');
    expect(hasTestId(root, 'scan-flash')).toBe(true);
    byLabel(root, 'Turn off flash');
  });

  test('a camera that fails to start offers Try again', async () => {
    const root = await secondAdmin();
    await press(byTestId(root, 'import-job'));

    await ReactTestRenderer.act(async () =>
      byTestId(root, 'qr-camera').props.onError(new Error('busy')),
    );
    expect(allText(root)).toContain('Camera unavailable');
    expect(byTestId(root, 'qr-camera').props.isActive).toBe(false);

    await press(byText(root, 'Try again'));
    expect(allText(root)).not.toContain('Camera unavailable');
    expect(byTestId(root, 'qr-camera').props.isActive).toBe(true);
  });

  test('without camera access it offers Settings and manual entry', async () => {
    permission.status = 'denied';
    const openSettings = jest
      .spyOn(Linking, 'openSettings')
      .mockResolvedValue(undefined);
    const root = await secondAdmin();
    await press(byTestId(root, 'import-job'));

    expect(hasTestId(root, 'qr-camera')).toBe(false);
    expect(hasTestId(root, 'scan-flash')).toBe(false);
    expect(allText(root)).toContain('Camera access needed');
    await press(byText(root, 'Open settings'));
    expect(openSettings).toHaveBeenCalled();

    await press(byText(root, 'Enter code manually'));
    expect(hasTestId(root, 'job-code-input')).toBe(true);
  });
});

test('order → raw material modal → job added to My Jobs → job card', async () => {
  const root = await secondAdmin();
  await importCode(root, 'WO-01036');

  // Order screen.
  let text = allText(root);
  expect(text).toContain('WO #1036 · Coupling — Job G');
  expect(text).toContain('Bright Steel Co.');
  expect(text).toContain('Shop order number');
  await press(byTestId(root, 'create-job-card'));

  // Raw Material Details: known values kept, every field required.
  expect(allText(root)).toContain('A few details are missing');
  expect(byTestId(root, 'raw-material-heatNumber').props.value).toBe(
    'HT-99207',
  );
  await typeInto(byTestId(root, 'raw-material-heatNumber'), ' ');
  await press(byTestId(root, 'raw-material-submit'));
  expect(allText(root).split('This field is required').length - 1).toBe(2);
  await typeInto(byTestId(root, 'raw-material-heatNumber'), 'HT-55555');
  await press(byLabel(root, 'In-house'));
  await press(byTestId(root, 'raw-material-submit'));
  await flush();

  // Straight to the new job's job card.
  text = allText(root);
  expect(text).toContain('Job card');
  expect(text).toMatch(/#JOB\d+ · Bright Steel Co\./);
  expect(allText(byTestId(root, 'job-card-wo'))).toBe('WO #1036');
  expect(hasTestId(root, 'job-card-tab-machining')).toBe(true);
  expect(text).not.toContain('Raw Material Details');
  const order = (await ordersApi.list()).find(o => o.id === '1036');
  expect(order).toMatchObject({
    materialSource: 'in_house',
    heatNumber: 'HT-55555',
  });

  // Back lands on My Jobs, with the job added at the top.
  await press(byLabel(root, 'Back'));
  text = allText(root);
  expect(text).toContain('6 active · 6 total');
  expect(text.indexOf('WO #1036')).toBeLessThan(text.indexOf('WO #1041'));
});

test('the order keeps its heading and drawing pinned; the thumbnail opens the Drawing screen', async () => {
  const root = await secondAdmin();
  await importCode(root, '1039');

  const tile = byTestId(root, 'order-summary-tile');
  expect(allText(tile)).toContain('Drawing');
  // Pinned above the scrolling details, not inside them.
  const screen = byTestId(root, 'import-order-screen');
  const [scroll] = screen.findAll(n => n.props.contentContainerStyle);
  expect(() => byTestId(scroll, 'order-summary-tile')).toThrow();
  expect(allText(scroll)).toContain('Shop order number');
  // Overview, Dispatch and Raw material, the same fields as the admin order.
  expect(allText(byTestId(scroll, 'order-info-overview'))).toMatch(
    /^Overview\|Quantity\|80 pcs\|Due date\|.*\|Part name\|Flange\|.*PO amount\|₹95,000/,
  );
  expect(allText(byTestId(scroll, 'order-info-dispatch'))).toContain('DC-5558');
  expect(allText(byTestId(scroll, 'order-info-material'))).toContain(
    'Material source',
  );

  // The thumbnail opens the Drawing screen; close returns to the order.
  await press(byTestId(tile, 'order-drawing-thumb'));
  const drawing = byTestId(root, 'drawing-screen');
  expect(allText(drawing)).toContain('DRW-1184');
  // Phones: just the drawing, no Print or Open in new tab.
  expect(hasTestId(drawing, 'drawing-print')).toBe(false);
  expect(hasTestId(drawing, 'drawing-open')).toBe(false);
  await press(byLabel(drawing, 'Close'));
  expect(hasTestId(root, 'drawing-screen')).toBe(false);
  expect(hasTestId(root, 'import-order-screen')).toBe(true);
});

test('closing the raw material modal keeps the order open', async () => {
  const root = await secondAdmin();
  await importCode(root, '1039');
  await press(byTestId(root, 'create-job-card'));

  expect(allText(root)).toContain('Raw Material Details');
  await press(byLabel(root, 'Close'));

  expect(allText(root)).not.toContain('Raw Material Details');
  expect(allText(root)).toContain('Import Job');
});

test('a job already on My Jobs opens its job card from the order', async () => {
  const root = await secondAdmin();
  await importCode(root, '1042');

  expect(allText(root)).toContain('View Job Card');
  await press(byTestId(root, 'create-job-card'));

  await press(byTestId(root, 'job-card-tab-machining'));
  expect(allText(root)).toContain('Route card & progress');
  await press(byText(root, 'Edit'));
  expect(allText(root)).toContain('Edit flow');
});

test('the list’s pencil edits the flow in a sheet; closing it stays on the list', async () => {
  const root = await secondAdmin();
  await press(byTestId(root, 'flow-action-1042'));

  expect(hasTestId(root, 'flow-sheet')).toBe(true);
  expect(hasTestId(root, 'job-card-details-screen')).toBe(false);
  await press(byText(byTestId(root, 'flow-sheet'), 'Cancel'));

  expect(hasTestId(root, 'flow-sheet')).toBe(false);
  expect(hasTestId(root, 'my-jobs-screen')).toBe(true);
  expect(hasTestId(root, 'job-card-details-screen')).toBe(false);
});

test('an order without a job card gets one created', async () => {
  // A new work order; it gets the next number, 1045.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, status, statusHistory, createdAt, ...input } = MOCK_ORDERS[0];
  app = await renderAppAs('supervisor@n1.com', 'Supervisor@123', () =>
    ordersApi.create(input),
  );
  const root = app.root;

  await importCode(root, 'WO-1045');
  await press(byTestId(root, 'create-job-card'));
  // Every detail is already there, so the modal asks to confirm them.
  expect(allText(root)).toContain('Check the raw material details');
  await press(byTestId(root, 'raw-material-submit'));

  expect(hasTestId(root, 'job-card-details-screen')).toBe(true);
  const created = (await jobCardsApi.list()).find(c => c.id === '1045');
  expect(created).toMatchObject({ status: 'not_started', operations: [] });
});

test('an order without a job card still opens its drawing', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, status, statusHistory, createdAt, ...input } = MOCK_ORDERS[0];
  app = await renderAppAs('supervisor@n1.com', 'Supervisor@123', () =>
    ordersApi.create(input),
  );
  const root = app.root;
  await importCode(root, 'WO-1045');

  await press(byTestId(root, 'order-drawing-thumb'));
  const drawing = byTestId(root, 'drawing-screen');
  expect(allText(drawing)).not.toContain('This order no longer exists.');
  expect(allText(drawing)).toContain(MOCK_ORDERS[0].drawingNumber);
  // Phones: just the drawing, no Print or Open in new tab.
  expect(hasTestId(drawing, 'drawing-print')).toBe(false);
  expect(hasTestId(drawing, 'drawing-open')).toBe(false);
});

test('supervisor restarts a step whose QC failed with Redo, not Start', async () => {
  // 1042's Turning step failed its QC and reopened as a redo.
  app = await renderAppAs('supervisor@n1.com', 'Supervisor@123', async () => {
    const card = await jobCardsApi.get('1042');
    const operations = card.operations.map((op, i) =>
      i < 3
        ? {
            ...op,
            status: 'completed' as const,
            completedAt: '2026-09-25T10:00:00',
          }
        : op,
    );
    const done = { ...card, operations };
    await jobCardsApi.update('1042', {
      ...reopenOperation(done, '1042-op3'),
      qcHistory: [
        ...card.qcHistory,
        {
          id: 'qc-redo',
          kind: 'machine',
          stage: 'Turning - QC',
          result: 'failed',
          remark: 'Oversize',
          at: '2026-09-25T11:00:00',
          operationId: '1042-op3',
        },
      ],
    });
  });
  const root = app.root;
  await press(byLabel(root, 'View job card WO #1042'));
  const bar = byTestId(root, 'job-card-operation-bar');
  expect(hasTestId(bar, 'redo-operation')).toBe(true);
  expect(hasTestId(bar, 'start-operation')).toBe(false);
  await press(byTestId(bar, 'redo-operation'));
  expect(allText(byTestId(root, 'start-step-dialog'))).toContain(
    'Start Turning (Lathe)',
  );
});

test('supervisor re-initiates RM QC with new material after a rejection', async () => {
  const root = await secondAdmin();
  // My Jobs flags the job whose material RM QC rejected.
  expect(allText(byTestId(root, 'rm-qc-failed-1041'))).toContain(
    'RM QC failed',
  );
  expect(hasTestId(root, 'rm-qc-failed-1042')).toBe(false);
  await press(byLabel(root, 'View job card WO #1041'));

  // The job card's QC tab shows what RM QC rejected, and offers Re-initiate.
  await press(byTestId(root, 'job-card-tab-qc'));
  const rejected = allText(byTestId(root, 'rejected-material'));
  expect(rejected).toContain('AL6061');
  expect(rejected).toContain('HT-99212');
  expect(rejected).toContain('24.6mm dia x 200mm');
  expect(rejected).toContain('Billet diameter under tolerance');
  await press(byTestId(root, 'reinitiate-rm-qc'));

  // Same raw material form, for the replacement: a new heat number is needed.
  expect(allText(root)).toContain('Replacement material');
  expect(byTestId(root, 'raw-material-heatNumber').props.value).toBe('');
  await press(byLabel(root, 'Bought out'));
  await press(byTestId(root, 'raw-material-submit'));
  expect(allText(root)).toContain('This field is required');
  await typeInto(byTestId(root, 'raw-material-heatNumber'), 'HT-70001');
  await press(byTestId(root, 'raw-material-submit'));

  // Back on the job card: RM QC is pending again, nothing left to re-initiate.
  expect(hasTestId(root, 'job-card-details-screen')).toBe(true);
  expect(hasTestId(root, 'reinitiate-rm-qc')).toBe(false);
  expect(hasTestId(root, 'rejected-material')).toBe(false);
  expect((await jobCardsApi.get('1041')).materialQc).toBe('pending');
  expect((await ordersApi.get('1041')).heatNumber).toBe('HT-70001');

  // And the My Jobs flag is gone.
  await press(byLabel(root, 'Back'));
  expect(hasTestId(root, 'rm-qc-failed-1041')).toBe(false);
});
