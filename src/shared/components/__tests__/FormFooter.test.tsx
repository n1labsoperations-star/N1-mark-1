import { StyleSheet } from 'react-native';
import { FormFooter, N1BottomBar } from '..';
import { WIDE, render } from '../../testing/render';
import { byTestId } from '../../testing/testUtils';

const flexOf = (root: Awaited<ReturnType<typeof render>>) =>
  StyleSheet.flatten(byTestId(root, 'save').props.style).flex;

test('buttons share a modal footer row by flexing', async () => {
  const root = await render(
    <FormFooter
      submitLabel="Save"
      onSubmit={jest.fn()}
      onCancel={jest.fn()}
      submitTestID="save"
    />,
    WIDE,
  );
  expect(flexOf(root)).toBe(1);
});

test('in a bottom bar the buttons keep their height (no flex)', async () => {
  // The bar's slots share the width; flex: 1 in a slot collapses the
  // button's height on Android and iOS.
  const root = await render(
    <N1BottomBar>
      <FormFooter
        submitLabel="Save"
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
        submitTestID="save"
      />
    </N1BottomBar>,
    WIDE,
  );
  expect(flexOf(root)).toBeUndefined();
});
