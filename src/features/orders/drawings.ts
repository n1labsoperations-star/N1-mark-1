import {
  fileDownloadUrl,
  openStoredFile,
} from '../../services/files/fileStorage';
import { reserveTab } from '../../services/files/viewDocument';
import type { Attachment } from '../../shared/types';
import { maskedDrawing } from './drawingStamp';
import { DRAWING_KIND } from './constants';
import type { WorkOrder } from './types';

// An order holds one design file; its other drawings are stored among its
// documents, marked with DRAWING_KIND.

const isDrawing = (doc: Attachment) => doc.kind === DRAWING_KIND;

/** Every drawing on the order: the design file first, then the rest. */
export const orderDrawings = (
  o: Pick<WorkOrder, 'designFile' | 'documents'>,
): Attachment[] => [
  ...(o.designFile ? [o.designFile] : []),
  ...o.documents.filter(isDrawing),
];

/** The order's documents that aren't drawings (purchase order first). */
export const orderOtherDocuments = (o: Pick<WorkOrder, 'documents'>) =>
  o.documents.filter(doc => !isDrawing(doc));

/**
 * Drawings → the order's design file and documents: the first is the design
 * file, the rest join `otherDocuments` marked as drawings.
 */
export const drawingsToOrderFiles = (
  drawings: readonly Attachment[],
  otherDocuments: readonly Attachment[],
): Pick<WorkOrder, 'designFile' | 'documents'> => ({
  designFile: drawings[0] ?? null,
  documents: [
    ...otherDocuments,
    ...drawings.slice(1).map(doc => ({ ...doc, kind: DRAWING_KIND })),
  ],
});

/**
 * Opens (downloads) a drawing with the customer's (`company`) name, address
 * and logo blanked, as when printing. Files that can't be masked here (DWG,
 * STEP, or a native build) open as stored. False when nothing opened.
 */
export async function openMaskedDrawing(
  doc: Attachment,
  company: string,
): Promise<boolean> {
  // Web: the tab opens on the tap; the masked copy takes a moment.
  const tab = reserveTab();
  if (!tab) {
    return openStoredFile(doc);
  }
  try {
    const masked = await maskedDrawing(doc, company).catch(() => null);
    return tab.open(masked ?? doc.uri ?? (await fileDownloadUrl(doc.id)));
  } catch (error) {
    tab.close();
    throw error;
  }
}
