import { N1DatePicker } from '..';
import { WIDE, press, render } from '../../testing/render';
import { allText, byLabel, byTestId, byText } from '../../testing/testUtils';

const pad2 = (n: number) => String(n).padStart(2, '0');

test('opens on the chosen month, picks a day and moves between months', async () => {
  const onChange = jest.fn();
  const root = await render(
    <N1DatePicker
      label="DC date"
      value="15/10/2026"
      onChange={onChange}
      testID="dc"
    />,
    WIDE,
  );
  expect(allText(byTestId(root, 'dc'))).toBe('15/10/2026');
  await press(byTestId(root, 'dc'));
  expect(allText(byTestId(root, 'dc-month'))).toBe('October 2026');
  expect(
    byLabel(root, '15 October 2026').props.accessibilityState.selected,
  ).toBe(true);
  await press(byLabel(root, 'Next month'));
  expect(allText(byTestId(root, 'dc-month'))).toBe('November 2026');
  await press(byLabel(root, '3 November 2026'));
  expect(onChange).toHaveBeenCalledWith('03/11/2026');
});

test('Today and Clear; an empty field shows the placeholder', async () => {
  const onChange = jest.fn();
  const root = await render(
    <N1DatePicker value="" onChange={onChange} testID="due" />,
    WIDE,
  );
  expect(allText(byTestId(root, 'due'))).toBe('DD/MM/YYYY');
  await press(byTestId(root, 'due'));
  await press(byText(byTestId(root, 'due-calendar'), 'Today'));
  const now = new Date();
  expect(onChange).toHaveBeenLastCalledWith(
    `${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}/${now.getFullYear()}`,
  );
  await press(byTestId(root, 'due'));
  await press(byText(byTestId(root, 'due-calendar'), 'Clear'));
  expect(onChange).toHaveBeenLastCalledWith('');
});
