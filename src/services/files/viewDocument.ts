import type { Attachment } from '../../shared/types';

/**
 * iOS / Android: no file viewer is installed yet, so nothing opens; callers
 * explain that instead. The web build uses viewDocument.web.ts.
 */
export function openDocument(_doc: Attachment): boolean {
  return false;
}

/** As openDocument: printing isn't available on phones yet. */
export function printDocument(_doc: Attachment): boolean {
  return false;
}
