import { pickDocument } from '../pickDocument.web';

type Listener = () => void;
type FakeInput = {
  type: string;
  accept: string;
  multiple: boolean;
  files: { name: string; size: number; type: string }[] | null;
  listeners: Record<string, Listener>;
  addEventListener: (event: string, cb: Listener) => void;
  click: jest.Mock;
};

const g = globalThis as unknown as { document?: unknown };
const original = g.document;
let input: FakeInput;

beforeEach(() => {
  input = {
    type: '',
    accept: '',
    multiple: true,
    files: null,
    listeners: {},
    addEventListener(event, cb) {
      this.listeners[event] = cb;
    },
    click: jest.fn(),
  };
  g.document = { createElement: () => input };
});

afterEach(() => {
  g.document = original;
});

test('opens the chooser for one file of the given types', async () => {
  const picked = pickDocument('Design file', undefined, '.pdf,.dwg');
  expect(input.click).toHaveBeenCalled();
  expect(input).toMatchObject({ type: 'file', accept: '.pdf,.dwg' });
  expect(input.multiple).toBe(false);

  input.files = [{ name: 'bracket.dwg', size: 2048, type: '' }];
  input.listeners.change();
  expect(await picked).toMatchObject({
    name: 'bracket.dwg',
    kind: 'Design file',
    sizeBytes: 2048,
    uri: undefined,
  });
});

test('resolves null when the chooser is closed', async () => {
  const picked = pickDocument('Purchase order');
  input.listeners.cancel();
  expect(await picked).toBeNull();
});

test('a picked PDF keeps a link it can be viewed and printed from', async () => {
  const urls = globalThis as unknown as { URL: { createObjectURL?: unknown } };
  const create = urls.URL.createObjectURL;
  urls.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/po');
  const picked = pickDocument('Purchase order', undefined, '.pdf');
  input.files = [{ name: 'po.pdf', size: 100, type: 'application/pdf' }];
  input.listeners.change();
  expect(await picked).toMatchObject({
    name: 'po.pdf',
    uri: 'blob:http://localhost/po',
  });
  urls.URL.createObjectURL = create;
});
