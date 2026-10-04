import { pickDocument } from './pickDocument';
import type { Attachment } from '../../shared/types';

/**
 * Stand-in image picker for iOS / Android: no picker library is installed
 * yet, so this returns a sample file with nothing to show (the initials stay).
 * Swap the body for react-native-image-picker when one is chosen. The web
 * build uses pickImage.web.ts.
 */
export function pickImage(
  kind: string,
  sampleName: string,
): Promise<Attachment | null> {
  return pickDocument(kind, sampleName);
}
