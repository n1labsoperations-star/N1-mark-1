import { pickDocument } from './pickDocument';
import type { Attachment } from '../../shared/types';

/**
 * Stand-in multi-file picker for iOS / Android: no picker library is
 * installed yet, so this returns one sample file. Swap the body for
 * react-native-document-picker when one is chosen. The web build uses
 * pickFiles.web.ts.
 */
export async function pickFiles(
  kind: string,
  sampleName: string,
): Promise<Attachment[]> {
  const file = await pickDocument(kind, sampleName);
  return file ? [file] : [];
}
