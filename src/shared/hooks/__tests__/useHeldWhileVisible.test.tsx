/**
 * @format
 */

import ReactTestRenderer from 'react-test-renderer';
import { useHeldWhileVisible } from '..';

test('keeps the last value shown while the dialog closes', () => {
  const seen: (string | null)[] = [];
  function Probe({
    visible,
    value,
  }: {
    visible: boolean;
    value: string | null;
  }) {
    seen.push(useHeldWhileVisible(visible, value));
    return null;
  }
  let renderer: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<Probe visible value="Priya" />);
  });
  // Closing clears the value, but the dialog keeps showing Priya.
  ReactTestRenderer.act(() => {
    renderer.update(<Probe visible={false} value={null} />);
  });
  // Opened again for someone else.
  ReactTestRenderer.act(() => {
    renderer.update(<Probe visible value="Arjun" />);
  });
  expect(seen).toEqual(['Priya', 'Priya', 'Arjun']);
});
