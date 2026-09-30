import { Platform } from 'react-native';
import { delay } from '../mock/mockServer';
import type { Attachment } from '../../shared/types';

/**
 * Stand-in file picker. No picker library is installed yet, so this returns a
 * sample file after a short delay. Swap the body for react-native-document-picker
 * (native) / an <input type="file"> (web) when one is chosen.
 */
export async function pickDocument(
  kind: string,
  sampleName: string,
): Promise<Attachment | null> {
  await delay();
  return {
    id: `${kind}-${Date.now()}`,
    name: sampleName,
    kind,
    sizeBytes: Platform.OS === 'web' ? 640 * 1024 : 512 * 1024,
  };
}
