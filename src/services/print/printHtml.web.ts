// The project builds without the DOM typings; just what this file touches.
type FrameWindow = {
  focus: () => void;
  print: () => void;
  addEventListener: (event: 'afterprint', cb: () => void) => void;
};
type Frame = {
  srcdoc: string;
  style: Record<string, string>;
  contentWindow: FrameWindow | null;
  addEventListener: (event: 'load', cb: () => void) => void;
  remove: () => void;
};
type Browser = {
  document?: {
    createElement: (tag: 'iframe') => Frame;
    body: { appendChild: (el: Frame) => void };
  };
};
const browser = globalThis as unknown as Browser;

/** Keeps the frame out of sight and out of the layout. */
const HIDDEN = {
  position: 'fixed',
  width: '0',
  height: '0',
  border: '0',
  visibility: 'hidden',
};

/**
 * Web: prints the page from a hidden frame, so the browser's print dialog
 * (which lists the computer's printers) opens without leaving the app.
 */
export function printHtml(html: string, _jobName: string): Promise<boolean> {
  const doc = browser.document;
  if (!doc) {
    return Promise.resolve(false);
  }
  return new Promise(resolve => {
    const frame = doc.createElement('iframe');
    Object.assign(frame.style, HIDDEN);
    frame.addEventListener('load', () => {
      const win = frame.contentWindow;
      if (!win) {
        frame.remove();
        resolve(false);
        return;
      }
      win.addEventListener('afterprint', () => frame.remove());
      win.focus();
      win.print();
      resolve(true);
    });
    frame.srcdoc = html;
    doc.body.appendChild(frame);
  });
}
