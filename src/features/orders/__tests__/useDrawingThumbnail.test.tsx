import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { Attachment } from '../../../shared/types';
import { drawingThumbnail } from '../drawingStamp';
import { useDrawingThumbnail } from '../hooks/useDrawingThumbnail';

jest.mock('../drawingStamp', () => ({ drawingThumbnail: jest.fn() }));
const draw = drawingThumbnail as unknown as jest.MockedFunction<
  (doc: Attachment) => Promise<string | null>
>;

const doc = (id: string): Attachment => ({
  id,
  name: 'drawing.pdf',
  kind: 'Design file',
  sizeBytes: 1,
});

let shown: string | null = null;
function Probe({ file }: { file: Attachment }) {
  shown = useDrawingThumbnail(file);
  return null;
}

async function view(file: Attachment) {
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(<Probe file={file} />);
  });
  await act(async () => {});
  act(() => renderer?.unmount());
  return shown;
}

beforeEach(() => {
  draw.mockReset();
  shown = null;
});

describe('useDrawingThumbnail', () => {
  test('a stored drawing is drawn once and reused', async () => {
    draw.mockResolvedValue('data:image/png;base64,a');
    expect(await view(doc('once'))).toBe('data:image/png;base64,a');
    expect(await view(doc('once'))).toBe('data:image/png;base64,a');
    expect(draw).toHaveBeenCalledTimes(1);
  });

  test('a failed download is tried again once', async () => {
    draw
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce('data:image/png;base64,b');
    expect(await view(doc('blip'))).toBe('data:image/png;base64,b');
    expect(draw).toHaveBeenCalledTimes(2);
  });

  test('a drawing that keeps failing is retried on the next view', async () => {
    draw
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce('data:image/png;base64,c');
    // The placeholder shows this time…
    expect(await view(doc('down'))).toBeNull();
    // …and the drawing comes back once the network does.
    expect(await view(doc('down'))).toBe('data:image/png;base64,c');
    expect(draw).toHaveBeenCalledTimes(3);
  });
});
