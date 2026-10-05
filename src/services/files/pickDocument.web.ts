import type { Attachment } from '../../shared/types';
import { chooseFiles } from './pickFiles.web';

/**
 * Opens the browser's file chooser for one file. `accept` limits the types,
 * e.g. ".pdf,.dwg"; by default images, PDFs and office documents. Resolves
 * null when the chooser is closed without a choice.
 */
export async function pickDocument(
  kind: string,
  _sampleName?: string,
  accept?: string,
): Promise<Attachment | null> {
  const [file] = await chooseFiles(kind, { accept });
  return file ?? null;
}
