import { MOCK_ORDERS } from '../api/mockData';
import { documentPrintHtml, drawingPrintHtml } from '../printing';

const order = MOCK_ORDERS[0];

test('the drawing sheet has the drawing, its number, details and QR', () => {
  const html = drawingPrintHtml(order, 'DRW-1');
  expect(html).toContain(`<title>Drawing · WO #${order.id}`);
  expect(html).toContain('<rect x=');
  expect(html).toContain('80 mm');
  expect(html).toContain('DRW-1');
  expect(html).toContain(order.customerName);
  expect(html).toContain(`aria-label="QR code for WO #${order.id}"`);
  expect(html).toMatch(/<path d="M\d/);
});

test('a document without its file prints as a sheet naming it', () => {
  const html = documentPrintHtml(order, {
    id: 'po',
    name: 'PO <1>.pdf',
    kind: 'Purchase order',
    sizeBytes: 1024,
  });
  expect(html).toContain('<title>PO &lt;1&gt;.pdf</title>');
  expect(html).toContain('Purchase order · 1 KB');
  expect(html).not.toContain('<img');
});

test('a picked image prints as itself', () => {
  const html = documentPrintHtml(order, {
    id: 'photo',
    name: 'photo.png',
    sizeBytes: 10,
    uri: 'data:image/png;base64,AAAA',
  });
  expect(html).toContain('<img src="data:image/png;base64,AAAA"');
});
