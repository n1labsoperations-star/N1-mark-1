import { detailList, escapeHtml, printPage } from '../printPage';

test('escapes markup characters', () => {
  expect(escapeHtml('<a href="x">&</a>')).toBe(
    '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;',
  );
});

test('wraps the body in a titled, styled page', () => {
  const html = printPage('A & B', '<p>Body</p>');
  expect(html).toMatch(/^<!doctype html>/);
  expect(html).toContain('<title>A &amp; B</title>');
  expect(html).toContain('@page');
  expect(html).toContain('<body><p>Body</p></body>');
});

test('lists details, leaving blanks out', () => {
  expect(
    detailList([
      ['Part', 'Bracket <A>'],
      ['PO', ' '],
    ]),
  ).toBe('<dl><dt>Part</dt><dd>Bracket &lt;A&gt;</dd></dl>');
});
