/**
 * @format
 */

import React from 'react';
import * as RN from 'react-native';
import ReactTestRenderer, {
  type ReactTestInstance,
  type ReactTestRenderer as Renderer,
} from 'react-test-renderer';
import {
  N1Avatar,
  N1Badge,
  N1Button,
  N1Card,
  N1Checkbox,
  N1Checklist,
  N1Chip,
  N1ConfirmDialog,
  N1Divider,
  N1DropDown,
  N1Icon,
  N1IconButton,
  N1Modal,
  N1Pagination,
  N1ProgressBar,
  N1RadioGroup,
  N1StatCard,
  N1Switch,
  N1Table,
  N1Tabs,
  N1Text,
  N1TextInput,
  N1ThemeProvider,
  N1UploadBox,
  N1View,
  darkTheme,
  getInitials,
  lightTheme,
  n1IconNames,
  useN1Theme,
} from '..';

async function render(element: React.ReactElement): Promise<Renderer> {
  let renderer: Renderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(element);
  });
  return renderer as Renderer;
}

/** Presses the nearest Pressable wrapping `node` (host views carry no onPress). */
async function press(node: ReactTestInstance) {
  let target: ReactTestInstance | null = node;
  while (target && typeof target.props.onPress !== 'function') {
    target = target.parent;
  }
  if (!target) {
    throw new Error('Nothing pressable here');
  }
  const pressable = target;
  await ReactTestRenderer.act(() => {
    pressable.props.onPress();
  });
}

/** Host-level nodes with a given accessibility role (skips composite wrappers). */
function byRole(root: ReactTestInstance, role: string) {
  return root.findAll(
    n => typeof n.type === 'string' && n.props.accessibilityRole === role,
  );
}

function byLabel(root: ReactTestInstance, label: string) {
  const [node] = root.findAll(
    n => typeof n.type === 'string' && n.props.accessibilityLabel === label,
  );
  if (!node) {
    throw new Error(`No element labelled "${label}"`);
  }
  return node;
}

function allText(root: ReactTestInstance): string {
  return root
    .findAll(n => (n.type as unknown) === 'Text')
    .map(n => n.children.filter(c => typeof c === 'string').join(''))
    .join('|');
}

function flatStyle(node: ReactTestInstance) {
  return RN.StyleSheet.flatten(node.props.style) ?? {};
}

let mockWidth = 1280;
jest.mock('../../hooks/useN1Breakpoint', () => ({
  useN1Breakpoint: () => ({
    width: mockWidth,
    isCompact: mockWidth < 768,
    isDesktop: mockWidth >= 1024,
  }),
}));

function setWindowWidth(width: number) {
  mockWidth = width;
}

afterEach(() => {
  jest.restoreAllMocks();
  mockWidth = 1280;
});

describe('theme', () => {
  function ModeProbe() {
    return <N1Text>{useN1Theme().mode}</N1Text>;
  }

  test('defaults to the light theme without a provider', async () => {
    const r = await render(<ModeProbe />);
    expect(allText(r.root)).toBe('light');
  });

  test('provider switches to dark', async () => {
    const r = await render(
      <N1ThemeProvider mode="dark">
        <ModeProbe />
      </N1ThemeProvider>,
    );
    expect(allText(r.root)).toBe('dark');
  });

  test('system mode follows the device colour scheme', async () => {
    jest.spyOn(RN, 'useColorScheme').mockReturnValue('dark');
    const r = await render(
      <N1ThemeProvider mode="system">
        <ModeProbe />
      </N1ThemeProvider>,
    );
    expect(allText(r.root)).toBe('dark');
  });

  test('light and dark define the same colour keys', () => {
    expect(Object.keys(darkTheme.colors).sort()).toEqual(
      Object.keys(lightTheme.colors).sort(),
    );
  });
});

describe('N1Text / N1View / N1Card / N1Divider', () => {
  test('N1Text applies variant, colour and alignment from the theme', async () => {
    const r = await render(
      <N1Text variant="h1" color="danger" align="center">
        Title
      </N1Text>,
    );
    const style = flatStyle(r.root.findByType(RN.Text));
    expect(style.fontSize).toBe(lightTheme.typography.h1.fontSize);
    expect(style.color).toBe(lightTheme.colors.tone.danger.solid);
    expect(style.textAlign).toBe('center');
  });

  test('overline text is uppercase and secondary by default', async () => {
    const r = await render(<N1Text variant="overline">Status</N1Text>);
    const style = flatStyle(r.root.findByType(RN.Text));
    expect(style.textTransform).toBe('uppercase');
    expect(style.color).toBe(lightTheme.colors.textSecondary);
  });

  test('N1View maps token props to styles', async () => {
    const r = await render(
      <N1View
        row
        gap="md"
        padding="lg"
        background="surface"
        radius="lg"
        bordered
      />,
    );
    const style = flatStyle(r.root.findByType(RN.View));
    expect(style).toMatchObject({
      flexDirection: 'row',
      gap: lightTheme.spacing.md,
      padding: lightTheme.spacing.lg,
      backgroundColor: lightTheme.colors.surface,
      borderRadius: lightTheme.radius.lg,
      borderWidth: lightTheme.borderWidth.hairline,
    });
  });

  test('N1Card renders title, subtitle and header content', async () => {
    const r = await render(
      <N1Card
        title="Account"
        subtitle="Details"
        icon="info"
        headerRight={<N1Badge label="Active" tone="success" />}
      >
        <N1Text>Body</N1Text>
      </N1Card>,
    );
    expect(allText(r.root)).toBe('Account|Details|Active|Body');
  });

  test('N1Divider supports both orientations', async () => {
    const r = await render(
      <>
        <N1Divider />
        <N1Divider vertical spacing="md" />
      </>,
    );
    const [h, v] = r.root.findAllByType(RN.View).map(flatStyle);
    expect(h.height).toBe(lightTheme.borderWidth.hairline);
    expect(v.width).toBe(lightTheme.borderWidth.hairline);
    expect(v.marginHorizontal).toBe(lightTheme.spacing.md);
  });
});

describe('N1Icon', () => {
  test('renders every icon name', async () => {
    const r = await render(
      <>
        {n1IconNames.map(name => (
          <N1Icon key={name} name={name} testID={name} />
        ))}
      </>,
    );
    for (const name of n1IconNames) {
      expect(r.root.findAllByProps({ testID: name }).length).toBeGreaterThan(0);
    }
  });
});

describe('N1Button / N1IconButton', () => {
  test('calls onPress', async () => {
    const onPress = jest.fn();
    const r = await render(
      <N1Button
        title="Log in"
        leftIcon="lock"
        rightIcon="arrow-right"
        onPress={onPress}
      />,
    );
    await press(byLabel(r.root, 'Log in'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('loading disables the button and hides the icons', async () => {
    const r = await render(
      <N1Button title="Save" loading leftIcon="check" onPress={jest.fn()} />,
    );
    const button = byLabel(r.root, 'Save');
    expect(button.props.accessibilityState).toMatchObject({
      disabled: true,
      busy: true,
    });
    expect(r.root.findAllByType(RN.ActivityIndicator)).toHaveLength(1);
  });

  test.each([
    'primary',
    'secondary',
    'danger',
    'dangerOutline',
    'ghost',
  ] as const)('%s variant renders at every size', async variant => {
    const r = await render(
      <>
        <N1Button title="a" variant={variant} size="sm" fullWidth />
        <N1Button title="b" variant={variant} size="lg" disabled />
      </>,
    );
    expect(byRole(r.root, 'button')).toHaveLength(2);
  });

  test('N1IconButton needs a label and reports disabled', async () => {
    const onPress = jest.fn();
    const r = await render(
      <>
        <N1IconButton
          icon="close"
          accessibilityLabel="Close"
          onPress={onPress}
        />
        <N1IconButton
          icon="trash"
          variant="danger"
          size="sm"
          accessibilityLabel="Delete"
          disabled
        />
        <N1IconButton
          icon="plus"
          variant="primary"
          size="lg"
          accessibilityLabel="Add"
        />
      </>,
    );
    await press(byLabel(r.root, 'Close'));
    expect(onPress).toHaveBeenCalled();
    expect(byLabel(r.root, 'Delete').props.accessibilityState.disabled).toBe(
      true,
    );
  });
});

describe('N1TextInput', () => {
  test('shows label, required marker and error', async () => {
    const r = await render(
      <N1TextInput label="Email" required errorText="Enter a valid email" />,
    );
    expect(allText(r.root)).toContain('Email| *');
    expect(allText(r.root)).toContain('Enter a valid email');
  });

  test('secure field toggles password visibility', async () => {
    const r = await render(<N1TextInput label="Password" secure />);
    const input = () => r.root.findByType(RN.TextInput);
    expect(input().props.secureTextEntry).toBe(true);
    await press(byLabel(r.root, 'Show password'));
    expect(input().props.secureTextEntry).toBe(false);
    await press(byLabel(r.root, 'Hide password'));
    expect(input().props.secureTextEntry).toBe(true);
  });

  test('forwards focus / blur and changes the border while focused', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const r = await render(
      <N1TextInput
        placeholder="Search"
        leftIcon="search"
        onFocus={onFocus}
        onBlur={onBlur}
      />,
    );
    const input = r.root.findByType(RN.TextInput);
    await ReactTestRenderer.act(() => input.props.onFocus({}));
    expect(onFocus).toHaveBeenCalled();
    const field = input.parent as ReactTestInstance;
    expect(flatStyle(field).borderColor).toBe(
      lightTheme.colors.tone.neutral.solid,
    );
    expect(flatStyle(field).borderRadius).toBe(lightTheme.radius.sm);
    await ReactTestRenderer.act(() => input.props.onBlur({}));
    expect(onBlur).toHaveBeenCalled();
  });

  test('read-only and disabled fields are not editable', async () => {
    const r = await render(
      <>
        <N1TextInput
          label="Code"
          readOnly
          rightElement={<N1Badge label="Auto" />}
          helperText="Generated"
        />
        <N1TextInput label="Notes" multiline disabled />
      </>,
    );
    const [code, notes] = r.root.findAllByType(RN.TextInput);
    expect(code.props.editable).toBe(false);
    expect(notes.props.editable).toBe(false);
    expect(allText(r.root)).toContain('Generated');
  });
});

describe('N1DropDown', () => {
  /** Lets the bottom sheet finish sliding out. */
  const waitForSheet = () =>
    ReactTestRenderer.act(() => new Promise(done => setTimeout(done, 400)));

  const options = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
    { label: 'Guest', value: 'guest', disabled: true },
  ];

  test('shows the placeholder, opens, and picks an option', async () => {
    const onChange = jest.fn();
    const r = await render(
      <N1DropDown
        label="Role"
        placeholder="Select role"
        options={options}
        onChange={onChange}
      />,
    );
    const field = byLabel(r.root, 'Role');
    expect(field.props.accessibilityValue.text).toBe('Select role');
    await press(field);
    expect(byRole(r.root, 'menuitem')).toHaveLength(3);
    const items = byRole(r.root, 'menuitem');
    await press(items[1]);
    expect(onChange).toHaveBeenCalledWith('user');
    await waitForSheet();
    expect(byRole(r.root, 'menuitem')).toHaveLength(0);
  });

  test('re-selecting the current value does not fire onChange', async () => {
    const onChange = jest.fn();
    const r = await render(
      <N1DropDown
        label="Role"
        value="admin"
        options={options}
        onChange={onChange}
      />,
    );
    expect(byLabel(r.root, 'Role').props.accessibilityValue.text).toBe('Admin');
    await press(byLabel(r.root, 'Role'));
    await press(byRole(r.root, 'menuitem')[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  test('in the app the options open in a bottom sheet titled by the label', async () => {
    const onChange = jest.fn();
    const r = await render(
      <N1DropDown
        label="Role"
        options={options}
        onChange={onChange}
        testID="role"
      />,
    );
    const sheet = () =>
      r.root.findAll(
        n => typeof n.type === 'string' && n.props.testID === 'role-menu',
      );
    expect(sheet()).toHaveLength(0);

    await press(byLabel(r.root, 'Role'));
    expect(sheet()).toHaveLength(1);
    // Rises from the bottom rather than hanging off the field.
    expect(flatStyle(sheet()[0]).position).toBeUndefined();
    expect(allText(r.root)).toContain('Role');

    await press(byRole(r.root, 'menuitem')[1]);
    expect(onChange).toHaveBeenCalledWith(options[1].value);
    await waitForSheet();
    expect(sheet()).toHaveLength(0);
  });

  test('on web the list opens under the field (phones too); the backdrop closes it', async () => {
    const os = RN.Platform.OS;
    RN.Platform.OS = 'web';
    try {
      setWindowWidth(375);
      const r = await render(
        <N1DropDown
          label="Role"
          options={options}
          onChange={jest.fn()}
          errorText="Required"
          testID="role"
        />,
      );
      await press(byLabel(r.root, 'Role'));
      // A list anchored to the field, not a sheet.
      const [menu] = r.root.findAll(
        n => typeof n.type === 'string' && n.props.testID === 'role-menu',
      );
      expect(flatStyle(menu).position).toBe('absolute');
      await press(byLabel(r.root, 'Close options'));
      expect(r.root.findByType(RN.Modal).props.visible).toBe(false);
    } finally {
      RN.Platform.OS = os;
    }
  });
});

describe('selection controls', () => {
  test('N1RadioGroup reports the chosen value', async () => {
    const onChange = jest.fn();
    const r = await render(
      <N1RadioGroup
        label="Customer Type"
        value="business"
        onChange={onChange}
        options={[
          { label: 'Business', value: 'business' },
          { label: 'Individual', value: 'individual' },
        ]}
      />,
    );
    const radios = byRole(r.root, 'radio');
    expect(radios[0].props.accessibilityState.checked).toBe(true);
    expect(radios[1].props.accessibilityState.checked).toBe(false);
    await press(radios[1]);
    expect(onChange).toHaveBeenCalledWith('individual');
  });

  test('N1RadioGroup in a column can be disabled', async () => {
    const r = await render(
      <N1RadioGroup
        direction="column"
        disabled
        onChange={jest.fn()}
        options={[{ label: 'One', value: 1 }]}
      />,
    );
    expect(byRole(r.root, 'radio')[0].props.accessibilityState.disabled).toBe(
      true,
    );
  });

  test('N1Checkbox toggles', async () => {
    const onChange = jest.fn();
    const r = await render(
      <N1Checkbox label="Remember me" checked={false} onChange={onChange} />,
    );
    await press(byRole(r.root, 'checkbox')[0]);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  test('N1Switch toggles', async () => {
    const onChange = jest.fn();
    const r = await render(
      <N1Switch label="View orders" value onValueChange={onChange} />,
    );
    const toggle = byRole(r.root, 'switch')[0];
    expect(toggle.props.accessibilityState.checked).toBe(true);
    await press(toggle);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  test('N1Tabs switches tabs', async () => {
    const onChange = jest.fn();
    const r = await render(
      <N1Tabs
        value="invoices"
        onChange={onChange}
        tabs={[
          { key: 'invoices', label: 'Invoices' },
          { key: 'quotes', label: 'Quotes' },
        ]}
      />,
    );
    const tabs = byRole(r.root, 'tab');
    expect(tabs[0].props.accessibilityState.selected).toBe(true);
    await press(tabs[1]);
    expect(onChange).toHaveBeenCalledWith('quotes');
  });
});

describe('data display', () => {
  test('getInitials uses the first two words', () => {
    expect(getInitials('Priya Sharma')).toBe('PS');
    expect(getInitials('  koushik  dasarathan kumar ')).toBe('KD');
    expect(getInitials('Arun')).toBe('A');
  });

  test('N1Avatar shows initials or a label with a tone', async () => {
    const r = await render(
      <>
        <N1Avatar name="Priya Sharma" size="lg" />
        <N1Avatar label="HI" tone="danger" shape="rounded" size="sm" />
        <N1Avatar name="Divya Rao" />
      </>,
    );
    expect(allText(r.root)).toBe('PS|HI|DR');
  });

  test('N1Badge renders a tone background and optional dot', async () => {
    const r = await render(
      <N1Badge label="Active" tone="success" dot testID="b" />,
    );
    const [badge] = r.root.findAll(
      n => typeof n.type === 'string' && n.props.testID === 'b',
    );
    expect(flatStyle(badge).backgroundColor).toBe(
      lightTheme.colors.tone.success.background,
    );
    expect(r.root.findAllByType(RN.View)).toHaveLength(2);
  });

  test('N1Chip is static without onPress and pressable with it', async () => {
    const onPress = jest.fn();
    const r = await render(
      <>
        <N1Chip label="Priority:" value="High" />
        <N1Chip value="All" selected onPress={onPress} />
      </>,
    );
    expect(allText(r.root)).toBe('Priority:|High|All');
    await press(byRole(r.root, 'button')[0]);
    expect(onPress).toHaveBeenCalled();
  });

  test('N1StatCard colours the value by tone', async () => {
    const r = await render(
      <>
        <N1StatCard
          label="Paid"
          value={196}
          tone="success"
          icon="check-circle"
        />
        <N1StatCard label="Idle" value="3" tone="neutral" />
      </>,
    );
    const values = r.root
      .findAllByType(RN.Text)
      .filter(t => t.props.children === 196 || t.props.children === '3');
    expect(flatStyle(values[0]).color).toBe(
      lightTheme.colors.tone.success.solid,
    );
    expect(flatStyle(values[1]).color).toBe(lightTheme.colors.textSecondary);
  });

  test('N1ProgressBar clamps the value', async () => {
    const r = await render(
      <>
        <N1ProgressBar value={140} label="Overall completion" />
        <N1ProgressBar value={-5} />
      </>,
    );
    const bars = byRole(r.root, 'progressbar');
    expect(bars[0].props['aria-valuenow']).toBe(100);
    expect(bars[1].props['aria-valuenow']).toBe(0);
    expect(allText(r.root)).toContain('100%');
  });

  test('N1Checklist marks done items green', async () => {
    const r = await render(
      <N1Checklist
        items={[
          { label: 'Minimum 8 characters', done: true },
          { label: 'Passwords match', done: false },
        ]}
      />,
    );
    const [done, notDone] = r.root
      .findAllByType(RN.Text)
      .filter(t => typeof t.props.children === 'string');
    expect(flatStyle(done).color).toBe(lightTheme.colors.tone.success.solid);
    expect(flatStyle(notDone).color).toBe(lightTheme.colors.textSecondary);
  });
});

describe('N1Table', () => {
  type Row = { id: string; name: string; amount: number | null };
  const data: Row[] = [
    { id: '1', name: 'Acme Metalworks', amount: 42000 },
    { id: '2', name: 'Bright Steel Co.', amount: null },
  ];
  const columns = [
    { key: 'name', title: 'Customer', flex: 2 },
    { key: 'amount', title: 'Amount', align: 'right' as const },
    {
      key: 'status',
      title: 'Status',
      render: () => <N1Badge label="Paid" tone="success" />,
      hideOnCompact: true,
    },
  ];

  test('desktop: header, cells and row press', async () => {
    setWindowWidth(1280);
    const onRowPress = jest.fn();
    const r = await render(
      <N1Table
        columns={columns}
        data={data}
        keyExtractor={row => row.id}
        onRowPress={onRowPress}
        footer={<N1Text>Footer</N1Text>}
      />,
    );
    const text = allText(r.root);
    expect(text).toContain('Customer|Amount|Status');
    expect(text).toContain('Acme Metalworks|42000|Paid');
    expect(text).toContain('—');
    expect(text).toContain('Footer');
    await press(byRole(r.root, 'button')[0]);
    expect(onRowPress).toHaveBeenCalledWith(data[0]);
  });

  test('desktop: buttons inside rows stay enabled without onRowPress', async () => {
    const onEdit = jest.fn();
    const r = await render(
      <N1Table
        columns={[
          { key: 'name', title: 'Customer' },
          {
            key: 'actions',
            title: 'Actions',
            render: () => <N1Button title="Edit" onPress={onEdit} />,
          },
        ]}
        data={data}
        keyExtractor={row => row.id}
      />,
    );
    const [edit] = r.root.findAll(
      n => typeof n.type === 'string' && n.props.accessibilityLabel === 'Edit',
    );
    expect(edit.props.accessibilityState?.disabled).toBeFalsy();
    await press(edit);
    expect(onEdit).toHaveBeenCalled();
  });

  test('phone: stacked cards hide flagged columns', async () => {
    setWindowWidth(375);
    const onRowPress = jest.fn();
    const r = await render(
      <N1Table
        columns={columns}
        data={data}
        keyExtractor={row => row.id}
        onRowPress={onRowPress}
      />,
    );
    const text = allText(r.root);
    expect(text).toContain('Acme Metalworks|Amount|42000');
    expect(text).not.toContain('Status');
    await press(byRole(r.root, 'button')[1]);
    expect(onRowPress).toHaveBeenCalledWith(data[1]);
  });

  test('phone: custom card renderer without row press', async () => {
    setWindowWidth(375);
    const r = await render(
      <N1Table
        columns={columns}
        data={data}
        keyExtractor={row => row.id}
        renderCompactItem={row => <N1Text>{`Card ${row.name}`}</N1Text>}
      />,
    );
    expect(allText(r.root)).toBe('Card Acme Metalworks|Card Bright Steel Co.');
  });

  test('empty state', async () => {
    const r = await render(
      <N1Table
        columns={columns}
        data={[]}
        keyExtractor={(row: Row) => row.id}
        emptyText="No customers yet"
      />,
    );
    // Wide screens keep the column headings above the empty message.
    expect(allText(r.root)).toBe('Customer|Amount|Status|No customers yet');
  });
});

describe('N1Pagination / N1UploadBox', () => {
  test('pagination disables unavailable directions', async () => {
    const onNext = jest.fn();
    const r = await render(
      <N1Pagination
        summary="Showing 10 of 284 invoices"
        hasPrevious={false}
        hasNext
        onPrevious={jest.fn()}
        onNext={onNext}
      />,
    );
    expect(byLabel(r.root, 'Previous').props.accessibilityState.disabled).toBe(
      true,
    );
    await press(byLabel(r.root, 'Next'));
    expect(onNext).toHaveBeenCalled();
  });

  test('upload box shows the hint, then the chosen file with remove', async () => {
    const onPress = jest.fn();
    const onRemove = jest.fn();
    const hint = 'Click or drop design file (PDF, DWG, STEP)';
    const r = await render(
      <N1UploadBox label="Design file" hint={hint} onPress={onPress} />,
    );
    await press(byLabel(r.root, hint));
    expect(onPress).toHaveBeenCalled();

    await ReactTestRenderer.act(() =>
      r.update(
        <N1UploadBox
          hint={hint}
          onPress={onPress}
          fileName="drawing.pdf"
          fileSize="640 KB"
          onRemove={onRemove}
          errorText="Too large"
        />,
      ),
    );
    expect(allText(r.root)).toContain('drawing.pdf|640 KB');
    await press(byLabel(r.root, 'Remove drawing.pdf'));
    expect(onRemove).toHaveBeenCalled();
  });
});

describe('overlays', () => {
  test('N1Modal on desktop: close button, backdrop and footer', async () => {
    setWindowWidth(1280);
    const onClose = jest.fn();
    const r = await render(
      <N1Modal
        visible
        onClose={onClose}
        title="Create user"
        subtitle="Add a new person"
        footer={<N1Button title="Create user" />}
      >
        <N1Text>Form</N1Text>
      </N1Modal>,
    );
    expect(r.root.findByType(RN.Modal).props.transparent).toBe(true);
    await press(byLabel(r.root, 'Close'));
    await press(byLabel(r.root, 'Close dialog'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test('N1Modal ignores backdrop taps when asked, with no title', async () => {
    setWindowWidth(1280);
    const onClose = jest.fn();
    const r = await render(
      <N1Modal visible onClose={onClose} closeOnBackdrop={false} size="sm">
        <N1Text>Body</N1Text>
      </N1Modal>,
    );
    expect(byLabel(r.root, 'Close dialog').props.onPress).toBeUndefined();
  });

  test('N1Modal on phones opens full screen with a back button', async () => {
    setWindowWidth(375);
    const onClose = jest.fn();
    const r = await render(
      <N1Modal
        visible
        onClose={onClose}
        title="Create user"
        footer={<N1Button title="Save" />}
      >
        <N1Text>Form</N1Text>
      </N1Modal>,
    );
    expect(r.root.findByType(RN.Modal).props.transparent).toBeUndefined();
    await press(byLabel(r.root, 'Back'));
    expect(onClose).toHaveBeenCalled();
  });

  test('N1ConfirmDialog confirms and cancels', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const r = await render(
      <N1ConfirmDialog
        visible
        title="Delete customer?"
        message="This can't be undone."
        confirmLabel="Delete customer"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    await press(byLabel(r.root, 'Delete customer'));
    await press(byLabel(r.root, 'Cancel'));
    expect(onConfirm).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  test('N1ConfirmDialog primary tone while loading', async () => {
    const r = await render(
      <N1ConfirmDialog
        visible
        tone="primary"
        loading
        title="Send invoice?"
        confirmLabel="Send"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(byLabel(r.root, 'Send').props.accessibilityState.busy).toBe(true);
    expect(byLabel(r.root, 'Cancel').props.accessibilityState.disabled).toBe(
      true,
    );
  });
});

describe('edge cases', () => {
  test('system mode falls back to light when the device reports nothing', async () => {
    jest.spyOn(RN, 'useColorScheme').mockReturnValue(null);
    const r = await render(
      <N1ThemeProvider mode="system">
        <N1View />
      </N1ThemeProvider>,
    );
    expect(r.root.findAllByType(RN.View)).toHaveLength(1);
  });

  test('controls without visible labels still work', async () => {
    const onCheck = jest.fn();
    const onToggle = jest.fn();
    const r = await render(
      <>
        <N1Checkbox
          checked
          disabled
          accessibilityLabel="Select row"
          onChange={onCheck}
        />
        <N1Switch
          value={false}
          accessibilityLabel="Export reports"
          onValueChange={onToggle}
        />
        <N1Card>
          <N1Text>No header</N1Text>
        </N1Card>
      </>,
    );
    expect(byLabel(r.root, 'Select row').props.accessibilityState).toEqual({
      checked: true,
      disabled: true,
    });
    await press(byLabel(r.root, 'Export reports'));
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(allText(r.root)).toBe('No header');
  });

  test('disabled upload box and unselected pressable chip', async () => {
    const r = await render(
      <>
        <N1UploadBox hint="Upload PO" disabled onPress={jest.fn()} />
        <N1Chip value="Pending" onPress={jest.fn()} />
      </>,
    );
    expect(byLabel(r.root, 'Upload PO').props.accessibilityState.disabled).toBe(
      true,
    );
    expect(byRole(r.root, 'button')[1].props.accessibilityState.selected).toBe(
      false,
    );
  });
});
