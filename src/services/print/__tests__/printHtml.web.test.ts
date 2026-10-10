import { printHtml } from '../printHtml.web';

type FakeWindow = {
  printed: boolean;
  afterPrint?: () => void;
  focus: () => void;
  print: () => void;
  addEventListener: (event: string, cb: () => void) => void;
};
type FakeFrame = {
  srcdoc: string;
  style: Record<string, string>;
  contentWindow: FakeWindow | null;
  removed: boolean;
  onLoad?: () => void;
  addEventListener: (event: string, cb: () => void) => void;
  remove: () => void;
};

const g = globalThis as unknown as { document?: unknown };
const original = g.document;
let frame: FakeFrame;
let win: FakeWindow;
let appended: FakeFrame[];

beforeEach(() => {
  appended = [];
  win = {
    printed: false,
    focus: () => {},
    print: () => {
      win.printed = true;
    },
    addEventListener: (_event, cb) => {
      win.afterPrint = cb;
    },
  };
  frame = {
    srcdoc: '',
    style: {},
    contentWindow: win,
    removed: false,
    addEventListener: (_event, cb) => {
      frame.onLoad = cb;
    },
    remove: () => {
      frame.removed = true;
    },
  };
  g.document = {
    createElement: () => frame,
    body: { appendChild: (el: FakeFrame) => appended.push(el) },
  };
});

afterEach(() => {
  g.document = original;
});

test('prints the page from a hidden frame, then removes it', async () => {
  const done = printHtml('<p>Hi</p>', 'Job');
  expect(appended).toEqual([frame]);
  expect(frame.srcdoc).toBe('<p>Hi</p>');
  expect(frame.style.visibility).toBe('hidden');
  frame.onLoad!();
  await expect(done).resolves.toBe(true);
  expect(win.printed).toBe(true);
  expect(frame.removed).toBe(false);
  win.afterPrint!();
  expect(frame.removed).toBe(true);
});

test('is false when the frame has no window', async () => {
  frame.contentWindow = null;
  const done = printHtml('<p>Hi</p>', 'Job');
  frame.onLoad!();
  await expect(done).resolves.toBe(false);
  expect(frame.removed).toBe(true);
});

test('is false with no document', async () => {
  g.document = undefined;
  await expect(printHtml('<p>Hi</p>', 'Job')).resolves.toBe(false);
});
