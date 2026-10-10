import type { Attachment } from '../../shared/types';

// The project builds without the DOM typings; just what this file touches.
type Popup = {
  document: { write: (html: string) => void; close: () => void };
  focus: () => void;
  print: () => void;
  addEventListener: (event: 'load', cb: () => void) => void;
};
type Browser = {
  open?: (url: string, target: string) => Popup | null;
};
const browser = globalThis as unknown as Browser;

const isImage = (doc: Attachment) => Boolean(doc.uri?.startsWith('data:image'));

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!),
  );

/**
 * Prints a generated page (e.g. an invoice): opened in a new tab, then the
 * browser's print dialog, where it can also be saved as a PDF.
 */
export function printHtml(html: string): boolean {
  const popup = browser.open?.('', '_blank');
  if (!popup) {
    return false;
  }
  popup.document.write(
    html.replace(
      '</body>',
      '<script>window.focus();window.print()</script></body>',
    ),
  );
  popup.document.close();
  return true;
}

/** Opens the file in a new tab. False when there's nothing to open. */
export function openDocument(doc: Attachment): boolean {
  if (!doc.uri || !browser.open) {
    return false;
  }
  return browser.open(doc.uri, '_blank') !== null;
}

/**
 * Opens the file in a new tab and prints it: images on a plain page, PDFs in
 * the browser's own viewer. False when there's nothing to print.
 */
export function printDocument(doc: Attachment): boolean {
  if (!doc.uri || !browser.open) {
    return false;
  }
  if (isImage(doc)) {
    const popup = browser.open('', '_blank');
    if (!popup) {
      return false;
    }
    popup.document.write(
      `<!doctype html><title>${escapeHtml(doc.name)}</title>` +
        '<style>body{margin:0;display:flex;justify-content:center}' +
        'img{max-width:100%}</style>' +
        `<img src="${doc.uri}" onload="window.focus();window.print()">`,
    );
    popup.document.close();
    return true;
  }
  const popup = browser.open(doc.uri, '_blank');
  if (!popup) {
    return false;
  }
  popup.addEventListener('load', () => {
    popup.focus();
    popup.print();
  });
  return true;
}
