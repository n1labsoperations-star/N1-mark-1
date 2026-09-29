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
  N1Badge,
  N1BottomBar,
  N1BottomTabBar,
  N1Button,
  N1DetailGrid,
  N1Header,
  N1IconButton,
  N1KeyValueList,
  N1ListItem,
  N1Logo,
  N1PageHeader,
  N1ProcessStep,
  N1ScanFrame,
  N1SelectCard,
  N1StepNumber,
  N1Tabs,
  N1Text,
  N1TimelineItem,
  N1Timer,
  formatElapsed,
  lightTheme,
} from '../src/N1Modules';

async function render(element: React.ReactElement): Promise<Renderer> {
  let renderer: Renderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(element);
  });
  return renderer as Renderer;
}

/** Presses the nearest Pressable wrapping `node`. */
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

const isHost = (n: ReactTestInstance) => typeof n.type === 'string';

function byLabel(root: ReactTestInstance, label: string) {
  const [node] = root.findAll(
    n => isHost(n) && n.props.accessibilityLabel === label,
  );
  if (!node) {
    throw new Error(`No element labelled "${label}"`);
  }
  return node;
}

function byRole(root: ReactTestInstance, role: string) {
  return root.findAll(n => isHost(n) && n.props.accessibilityRole === role);
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

describe('N1Logo', () => {
  test.each(['sm', 'md', 'lg'] as const)('renders at %s', async size => {
    const r = await render(<N1Logo size={size} color="inverse" />);
    expect(byLabel(r.root, 'N1')).toBeTruthy();
    expect(allText(r.root)).toBe('N1');
  });
});

test('N1Logo defaults to a dark medium wordmark', async () => {
  const r = await render(<N1Logo />);
  const text = r.root.findByType(RN.Text);
  expect(flatStyle(text).color).toBe(lightTheme.colors.textPrimary);
  expect(flatStyle(text).fontSize).toBe(lightTheme.typography.h2.fontSize);
});

describe('N1Header', () => {
  test('default: back button and title', async () => {
    const onBack = jest.fn();
    const r = await render(
      <N1Header
        title="Job card"
        leftIcon="chevron-left"
        onLeftPress={onBack}
        right={<N1IconButton icon="edit" accessibilityLabel="Edit" />}
      />,
    );
    expect(allText(r.root)).toBe('Job card');
    await press(byLabel(r.root, 'Back'));
    expect(onBack).toHaveBeenCalled();
    expect(byLabel(r.root, 'Edit')).toBeTruthy();
  });

  test('close icon gets a Close label; custom label wins', async () => {
    const r = await render(
      <>
        <N1Header
          title="Edit Profile"
          leftIcon="close"
          onLeftPress={jest.fn()}
        />
        <N1Header
          title="Order"
          leftIcon="chevron-left"
          leftAccessibilityLabel="Back to jobs"
          onLeftPress={jest.fn()}
          safeArea={false}
        />
      </>,
    );
    expect(byLabel(r.root, 'Close')).toBeTruthy();
    expect(byLabel(r.root, 'Back to jobs')).toBeTruthy();
  });

  test('brand shows the logo; dark centres the title', async () => {
    const r = await render(
      <>
        <N1Header variant="brand" right={<N1Text>R</N1Text>} />
        <N1Header
          variant="dark"
          title="Scan QR Code"
          leftIcon="close"
          onLeftPress={jest.fn()}
        />
      </>,
    );
    expect(allText(r.root)).toBe('N1|R|Scan QR Code');
    const title = r.root
      .findAllByType(RN.Text)
      .find(t => t.props.children === 'Scan QR Code') as ReactTestInstance;
    expect(flatStyle(title).color).toBe(lightTheme.colors.scannerForeground);
  });

  test('no left button without a handler', async () => {
    const r = await render(
      <N1Header title="Profile" leftIcon="chevron-left" />,
    );
    expect(byRole(r.root, 'button')).toHaveLength(0);
  });
});

describe('N1PageHeader', () => {
  test('title, subtitle and action', async () => {
    const r = await render(
      <N1PageHeader
        title="My Jobs"
        subtitle="3 active · 5 total"
        right={<N1IconButton icon="search" accessibilityLabel="Search" />}
      />,
    );
    expect(allText(r.root)).toBe('My Jobs|3 active · 5 total');
    expect(byLabel(r.root, 'Search')).toBeTruthy();
  });

  test('without subtitle', async () => {
    const r = await render(<N1PageHeader title="QC" />);
    expect(allText(r.root)).toBe('QC');
  });
});

describe('N1BottomTabBar', () => {
  test('marks the active tab and switches', async () => {
    const onChange = jest.fn();
    const r = await render(
      <N1BottomTabBar
        value="jobs"
        onChange={onChange}
        tabs={[
          { key: 'jobs', label: 'Jobs', icon: 'clipboard' },
          { key: 'profile', label: 'Profile', icon: 'user' },
        ]}
      />,
    );
    const tabs = byRole(r.root, 'tab');
    expect(tabs[0].props.accessibilityState).toMatchObject({ selected: true });
    await press(byLabel(r.root, 'Profile'));
    expect(onChange).toHaveBeenCalledWith('profile');
  });
});

describe('N1BottomBar', () => {
  test('gives each child an equal slot', async () => {
    const r = await render(
      <N1BottomBar testID="bar">
        <N1Button title="Pass" variant="success" fullWidth />
        <N1Button title="Fail" variant="danger" fullWidth />
      </N1BottomBar>,
    );
    expect(byLabel(r.root, 'Pass')).toBeTruthy();
    const slots = r.root.findAll(
      n => isHost(n) && flatStyle(n).flex === 1 && n.children.length === 1,
    );
    expect(slots.length).toBeGreaterThanOrEqual(2);
  });
});

describe('N1Button additions', () => {
  test('success and link variants', async () => {
    const onPress = jest.fn();
    const r = await render(
      <>
        <N1Button title="Pass" variant="success" />
        <N1Button
          title="Enter code manually"
          variant="link"
          onPress={onPress}
        />
      </>,
    );
    const pass = byLabel(r.root, 'Pass');
    expect(flatStyle(pass).backgroundColor).toBe(
      lightTheme.colors.tone.success.solid,
    );
    const linkText = r.root
      .findAllByType(RN.Text)
      .find(
        t => t.props.children === 'Enter code manually',
      ) as ReactTestInstance;
    expect(flatStyle(linkText).textDecorationLine).toBe('underline');
    await press(byLabel(r.root, 'Enter code manually'));
    expect(onPress).toHaveBeenCalled();
  });

  test('overlay icon button uses the scanner colours', async () => {
    const r = await render(
      <N1IconButton
        icon="flash"
        variant="overlay"
        accessibilityLabel="Flash"
      />,
    );
    expect(flatStyle(byLabel(r.root, 'Flash')).backgroundColor).toBe(
      lightTheme.colors.scannerControl,
    );
  });

  test('full-width tabs stretch', async () => {
    const r = await render(
      <N1Tabs
        fullWidth
        value="raw"
        onChange={jest.fn()}
        tabs={[
          { key: 'raw', label: 'Raw Material QC' },
          { key: 'machine', label: 'Machine QC' },
        ]}
      />,
    );
    const [track] = byRole(r.root, 'tablist');
    expect(flatStyle(track).alignSelf).toBe('stretch');
    expect(flatStyle(byRole(r.root, 'tab')[0]).flex).toBe(1);
  });
});

describe('N1KeyValueList', () => {
  test('text and node values, title and dividers', async () => {
    const r = await render(
      <N1KeyValueList
        title="Material"
        dividers
        items={[
          { label: 'Source', value: 'Company purchased' },
          {
            label: 'Material QC',
            value: <N1Badge label="Accepted" tone="success" />,
          },
        ]}
      />,
    );
    expect(allText(r.root)).toBe(
      'Material|Source|Company purchased|Material QC|Accepted',
    );
  });

  test('plain variant has no panel background', async () => {
    const r = await render(
      <N1KeyValueList
        variant="plain"
        testID="kv"
        items={[{ label: 'Phone', value: '+91 98765 43210' }]}
      />,
    );
    const [box] = r.root.findAll(n => isHost(n) && n.props.testID === 'kv');
    expect(flatStyle(box).backgroundColor).toBeUndefined();
  });
});

describe('N1DetailGrid', () => {
  test('splits into columns and handles every value type', async () => {
    const r = await render(
      <N1DetailGrid
        title="Additional details"
        columns={3}
        items={[
          { label: 'PO number', value: 'PO-8842' },
          { label: 'Qty', value: 200 },
          { label: 'Grade', value: <N1Badge label="EN8" /> },
          { label: 'Heat number', value: null },
        ]}
      />,
    );
    expect(allText(r.root)).toBe(
      'Additional details|PO number|PO-8842|Qty|200|Grade|EN8|Heat number|—',
    );
    const cells = r.root.findAll(
      n => isHost(n) && flatStyle(n).width === `${100 / 3}%`,
    );
    expect(cells).toHaveLength(4);
  });

  test('defaults to two columns without a title', async () => {
    const r = await render(
      <N1DetailGrid items={[{ label: 'DC no', value: 'DC-5561' }]} />,
    );
    expect(
      r.root.findAll(n => isHost(n) && flatStyle(n).width === '50%'),
    ).toHaveLength(1);
  });
});

describe('N1ListItem', () => {
  test('static row with badge and extra content', async () => {
    const r = await render(
      <N1ListItem
        title="WO-00125 · Machined Shaft"
        subtitle="CNC Turning · Lathe 02"
        right={<N1Badge label="In progress" tone="info" />}
      >
        <N1Text>65%</N1Text>
      </N1ListItem>,
    );
    expect(allText(r.root)).toBe(
      'WO-00125 · Machined Shaft|In progress|CNC Turning · Lathe 02|65%',
    );
    expect(byRole(r.root, 'button')).toHaveLength(0);
  });

  test('pressable row without divider', async () => {
    const onPress = jest.fn();
    const r = await render(
      <N1ListItem title="WO-00121" divider={false} onPress={onPress} />,
    );
    const row = byLabel(r.root, 'WO-00121');
    expect(flatStyle(row).borderBottomWidth).toBeUndefined();
    await press(row);
    expect(onPress).toHaveBeenCalled();
  });
});

describe('N1SelectCard', () => {
  test('selected, pressable and disabled states', async () => {
    const onPick = jest.fn();
    const r = await render(
      <>
        <N1SelectCard
          title="Lathe 02"
          subtitle="Bay 2 · Turning line"
          selected
          onPress={onPick}
          right={<N1Badge label="Available" tone="success" />}
        />
        <N1SelectCard
          title="Lathe 03"
          selected={false}
          disabled
          onPress={onPick}
        />
      </>,
    );
    const lathe2 = byLabel(r.root, 'Lathe 02');
    expect(lathe2.props.accessibilityState).toMatchObject({ checked: true });
    expect(flatStyle(lathe2).borderWidth).toBe(lightTheme.borderWidth.thick);
    await press(lathe2);
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(byLabel(r.root, 'Lathe 03').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });
});

describe('N1ProcessStep / N1StepNumber', () => {
  test.each([
    ['completed', lightTheme.colors.tone.success.solid],
    ['upcoming', lightTheme.colors.surfaceMuted],
    ['draft', lightTheme.colors.primary],
  ] as const)('%s number colour', async (status, colour) => {
    const r = await render(<N1StepNumber number={1} status={status} />);
    expect(flatStyle(byLabel(r.root, 'Step 1')).backgroundColor).toBe(colour);
  });

  test('current step has a ring', async () => {
    const r = await render(<N1StepNumber number={3} status="current" />);
    expect(flatStyle(byLabel(r.root, 'Step 3')).borderColor).toBe(
      lightTheme.colors.tone.info.solid,
    );
  });

  test('completed steps are locked and show their status', async () => {
    const onRemove = jest.fn();
    const r = await render(
      <N1ProcessStep number={1} status="completed" onRemove={onRemove}>
        <N1Text>Material QC</N1Text>
      </N1ProcessStep>,
    );
    expect(byLabel(r.root, 'Locked')).toBeTruthy();
    expect(allText(r.root)).toContain('Completed');
    expect(() => byLabel(r.root, 'Remove step 1')).toThrow();
  });

  test('editable steps can be removed', async () => {
    const onRemove = jest.fn();
    const r = await render(
      <>
        <N1ProcessStep number={2} status="current" onRemove={onRemove}>
          <N1Text>Turning</N1Text>
        </N1ProcessStep>
        <N1ProcessStep number={3} status="upcoming" showStatus={false}>
          <N1Text>Deburring</N1Text>
        </N1ProcessStep>
        <N1ProcessStep number={4} onRemove={onRemove}>
          <N1Text>New</N1Text>
        </N1ProcessStep>
      </>,
    );
    expect(allText(r.root)).toBe('2|Turning|In progress|3|Deburring|4|New');
    await press(byLabel(r.root, 'Remove step 2'));
    expect(onRemove).toHaveBeenCalled();
  });
});

describe('N1TimelineItem', () => {
  test('done, active and pending', async () => {
    const r = await render(
      <>
        <N1TimelineItem
          status="done"
          title="Material QC"
          subtitle="QC Bay 1"
          meta="Completed at: 09:45 AM"
        />
        <N1TimelineItem status="active" title="Turning" statusLabel="Live" />
        <N1TimelineItem status="pending" title="Deburring" subtitle="Next" />
      </>,
    );
    expect(allText(r.root)).toBe(
      'Material QC|QC Bay 1|Completed at: 09:45 AM|Completed|Turning|Live|Deburring|Next|Pending',
    );
    const pendingTitle = r.root
      .findAllByType(RN.Text)
      .find(t => t.props.children === 'Deburring') as ReactTestInstance;
    expect(flatStyle(pendingTitle).color).toBe(lightTheme.colors.textTertiary);
  });
});

describe('N1ScanFrame', () => {
  test('instructions, camera slot and manual-entry link', async () => {
    const onManual = jest.fn();
    const r = await render(
      <N1ScanFrame
        message="Details import automatically"
        actionLabel="Enter code manually"
        onActionPress={onManual}
      >
        <N1Text>camera</N1Text>
      </N1ScanFrame>,
    );
    expect(allText(r.root)).toBe(
      'camera|Align the QR code within the frame|Details import automatically|Enter code manually',
    );
    await press(byRole(r.root, 'link')[0]);
    expect(onManual).toHaveBeenCalled();
  });

  test('without a link or message', async () => {
    const r = await render(<N1ScanFrame title="Scan" />);
    expect(allText(r.root)).toBe('Scan');
    expect(byRole(r.root, 'link')).toHaveLength(0);
  });
});

describe('N1Timer', () => {
  test('formatElapsed pads and clamps', () => {
    expect(formatElapsed(1112)).toBe('00:18:32');
    expect(formatElapsed(3 * 3600 + 5)).toBe('03:00:05');
    expect(formatElapsed(-4)).toBe('00:00:00');
  });

  test('ticks every second while running', async () => {
    jest.useFakeTimers();
    const start = new Date('2026-09-29T09:42:00Z');
    jest.setSystemTime(start.getTime() + 1112 * 1000);
    const r = await render(<N1Timer startedAt={start} />);
    expect(allText(r.root)).toBe('00:18:32');
    await ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(allText(r.root)).toBe('00:18:34');
    r.unmount();
    jest.useRealTimers();
  });

  test('stays still when paused, with an offset', async () => {
    jest.useFakeTimers();
    const now = Date.now();
    jest.setSystemTime(now);
    const r = await render(
      <N1Timer startedAt={now} running={false} offsetSeconds={65} />,
    );
    await ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(allText(r.root)).toBe('00:01:05');
    jest.useRealTimers();
  });
});
