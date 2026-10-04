import type { Attachment } from '../../shared/types';

// The project builds without the DOM typings; just what this file touches.
type PickedFile = { name: string; size: number; type: string };
type FileInput = {
  type: string;
  accept: string;
  multiple: boolean;
  files: ArrayLike<PickedFile> | null;
  addEventListener: (event: 'change' | 'cancel', cb: () => void) => void;
  click: () => void;
};
type Reader = {
  result: unknown;
  error: unknown;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  readAsDataURL: (file: PickedFile) => void;
};
type Browser = {
  document: { createElement: (tag: 'input') => FileInput };
  FileReader: new () => Reader;
};
const browser = globalThis as unknown as Browser;

/** Images, PDFs and office documents. */
const ACCEPT = 'image/*,.pdf,.doc,.docx,.xls,.xlsx';

const readAsDataUrl = (file: PickedFile) =>
  new Promise<string>((resolve, reject) => {
    const reader = new browser.FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/**
 * Opens the browser's file chooser for any number of documents. Images come
 * back with a data URL so they can be previewed. Resolves empty when the
 * chooser is closed without a choice.
 */
export function pickFiles(kind: string): Promise<Attachment[]> {
  return new Promise(resolve => {
    const input = browser.document.createElement('input');
    input.type = 'file';
    input.accept = ACCEPT;
    input.multiple = true;
    input.addEventListener('cancel', () => resolve([]));
    input.addEventListener('change', async () => {
      const files = Array.from(input.files ?? []);
      const stamp = Date.now();
      resolve(
        await Promise.all(
          files.map(async (file, i) => ({
            id: `${kind}-${stamp}-${i}`,
            name: file.name,
            kind,
            sizeBytes: file.size,
            uri: file.type.startsWith('image/')
              ? await readAsDataUrl(file)
              : undefined,
          })),
        ),
      );
    });
    input.click();
  });
}
