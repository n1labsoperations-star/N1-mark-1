import { useState } from 'react';
import { ScrollView } from 'react-native';
import {
  N1Avatar,
  N1Badge,
  N1BottomBar,
  N1BottomTabBar,
  N1Button,
  N1Card,
  N1Checkbox,
  N1Checklist,
  N1Chip,
  N1ConfirmDialog,
  N1DetailGrid,
  N1Divider,
  N1DropDown,
  N1Header,
  N1Icon,
  N1IconButton,
  N1KeyValueList,
  N1ListItem,
  N1Logo,
  N1Modal,
  N1PageHeader,
  N1Pagination,
  N1ProcessStep,
  N1ProgressBar,
  N1RadioGroup,
  N1ScanFrame,
  N1SelectCard,
  N1StatCard,
  N1Switch,
  N1Table,
  N1Tabs,
  N1Text,
  N1TextInput,
  N1TimelineItem,
  N1Timer,
  N1UploadBox,
  N1View,
  createN1Styles,
  n1IconNames,
  useN1Styles,
  type N1TableColumn,
  type N1Tone,
} from '../../../shared/components';

// Every N1Modules component with sample data from the AdminFlow design.

type Invoice = {
  id: string;
  customer: string;
  amount: string;
  status: string;
  tone: N1Tone;
};

const invoices: Invoice[] = [
  {
    id: 'INV-2026-0125',
    customer: 'ABC Engineering',
    amount: '₹42,000',
    status: 'Pending',
    tone: 'warning',
  },
  {
    id: 'INV-2026-0124',
    customer: 'Sri Metal Works',
    amount: '₹18,500',
    status: 'Paid',
    tone: 'success',
  },
  {
    id: 'INV-2026-0122',
    customer: 'Bright Steel Co.',
    amount: '₹27,800',
    status: 'Overdue',
    tone: 'danger',
  },
];

const operationOptions = [
  { label: 'Material QC', value: 'material-qc' },
  { label: 'Facing (Lathe)', value: 'facing' },
  { label: 'Turning (Lathe)', value: 'turning' },
  { label: 'Deburring', value: 'deburring' },
];

const machines = [
  {
    id: 'lathe-02',
    name: 'Lathe 02',
    bay: 'Bay 2 · Turning line',
    available: true,
  },
  {
    id: 'lathe-01',
    name: 'Lathe 01',
    bay: 'Bay 1 · Turning line',
    available: true,
  },
  {
    id: 'lathe-03',
    name: 'Lathe 03',
    bay: 'Bay 2 · Turning line',
    available: false,
  },
];

// 18 min 32 s, as on the Job Detail screen.
const ELAPSED_DEMO_MS = 1112 * 1000;

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
];

const makeStyles = createN1Styles(t => ({
  scroll: { backgroundColor: t.colors.background },
  content: { padding: t.spacing.xl, gap: t.spacing.xl },
  half: { flex: 1 },
  scanDemo: { height: 560, borderRadius: t.radius.lg, overflow: 'hidden' },
  phoneFrame: {
    borderRadius: t.radius.lg,
    overflow: 'hidden',
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
  },
  listPad: { paddingHorizontal: t.spacing.lg },
  iconTile: {
    width: t.controlHeight.lg * 2,
    alignItems: 'center',
    gap: t.spacing.xs,
  },
}));

function N1GalleryScreen() {
  const styles = useN1Styles(makeStyles);
  const [tab, setTab] = useState<'invoices' | 'quotes'>('invoices');
  const [role, setRole] = useState<string>('user');
  const [customerType, setCustomerType] = useState('business');
  const [remember, setRemember] = useState(true);
  const [viewOrders, setViewOrders] = useState(true);
  const [password, setPassword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [qcTab, setQcTab] = useState<'raw' | 'machine'>('raw');
  const [bottomTab, setBottomTab] = useState<'jobs' | 'profile'>('jobs');
  const [machine, setMachine] = useState('lathe-02');
  const [step3, setStep3] = useState('turning');
  const [startedAt] = useState(() => Date.now() - ELAPSED_DEMO_MS);

  const columns: N1TableColumn<Invoice>[] = [
    {
      key: 'id',
      title: 'Invoice',
      render: row => <N1Text weight="bold">{row.id}</N1Text>,
    },
    { key: 'customer', title: 'Customer', flex: 1.5 },
    { key: 'amount', title: 'Amount' },
    {
      key: 'status',
      title: 'Status',
      render: row => <N1Badge label={row.status} tone={row.tone} />,
    },
    {
      key: 'actions',
      title: 'Actions',
      hideOnCompact: true,
      render: () => (
        <N1View row gap="sm">
          <N1Button title="View" variant="secondary" size="sm" leftIcon="eye" />
          <N1Button title="Edit" size="sm" leftIcon="edit" />
        </N1View>
      ),
    },
  ];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <N1View gap="xs">
        <N1Text variant="h1">N1 Components</N1Text>
        <N1Text color="secondary">
          Shared building blocks from the AdminFlow design.
        </N1Text>
      </N1View>

      <N1Card title="Buttons">
        <N1View row wrap gap="md" align="center">
          <N1Button title="Log in" />
          <N1Button title="Cancel" variant="secondary" />
          <N1Button title="Delete customer" variant="danger" />
          <N1Button title="Forgot password?" variant="ghost" size="sm" />
          <N1Button title="Add Machine" leftIcon="plus" />
          <N1Button title="Next" rightIcon="arrow-right" />
          <N1Button title="Saving" loading />
          <N1Button title="Disabled" disabled />
          <N1IconButton icon="arrow-left" accessibilityLabel="Back" />
          <N1IconButton
            icon="close"
            variant="soft"
            accessibilityLabel="Close"
          />
          <N1IconButton
            icon="trash"
            variant="danger"
            accessibilityLabel="Delete"
          />
        </N1View>
      </N1Card>

      <N1Card title="Form fields">
        <N1View gap="lg">
          <N1TextInput
            label="Organization name"
            required
            placeholder="ABC Engineering Pvt Ltd"
          />
          <N1TextInput
            label="Organization code"
            readOnly
            placeholder="Generated from name"
            rightElement={<N1Badge label="Auto" tone="info" />}
          />
          <N1TextInput
            label="Password"
            required
            secure
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
          />
          <N1Checklist
            items={[
              { label: 'Minimum 8 characters', done: password.length >= 8 },
              {
                label: 'Letters and numbers',
                done: /[a-z]/i.test(password) && /\d/.test(password),
              },
            ]}
          />
          <N1TextInput
            label="Business email"
            placeholder="owner@company.com"
            errorText="Enter a valid email"
          />
          <N1TextInput placeholder="Search invoice" leftIcon="search" />
          <N1TextInput
            label="Notes"
            multiline
            placeholder="Anything worth knowing about this account"
          />
          <N1DropDown
            label="Role"
            options={roleOptions}
            value={role}
            onChange={setRole}
          />
          <N1RadioGroup
            label="Customer Type"
            value={customerType}
            onChange={setCustomerType}
            options={[
              { label: 'Business', value: 'business' },
              { label: 'Individual', value: 'individual' },
            ]}
          />
          <N1Checkbox
            label="Remember me"
            checked={remember}
            onChange={setRemember}
          />
          <N1Switch
            label="View orders"
            value={viewOrders}
            onValueChange={setViewOrders}
          />
          <N1UploadBox
            label="Design file"
            hint="Click or drop design file (PDF, DWG, STEP)"
            onPress={() => undefined}
          />
        </N1View>
      </N1Card>

      <N1Card title="Icons" subtitle={`${n1IconNames.length} outline icons`}>
        <N1View row wrap gap="lg">
          {n1IconNames.map(name => (
            <N1View key={name} style={styles.iconTile}>
              <N1Icon name={name} size="xl" />
              <N1Text variant="caption" color="secondary" numberOfLines={1}>
                {name}
              </N1Text>
            </N1View>
          ))}
        </N1View>
      </N1Card>

      <N1Card title="Dividers">
        <N1Text color="secondary">Above the line</N1Text>
        <N1Divider spacing="md" />
        <N1View row align="center">
          <N1Text>Left</N1Text>
          <N1Divider vertical spacing="md" />
          <N1Text>Right</N1Text>
        </N1View>
      </N1Card>

      <N1Card title="Status & data">
        <N1View gap="lg">
          <N1View row wrap gap="sm">
            <N1Badge label="Active" tone="success" dot />
            <N1Badge label="In progress" tone="info" />
            <N1Badge label="QC pending" tone="warning" />
            <N1Badge label="Overdue" tone="danger" />
            <N1Badge label="Idle" />
          </N1View>
          <N1View row wrap gap="sm">
            <N1Chip label="Priority:" value="High" />
            <N1Chip label="Due:" value="02 Oct 2026" />
            <N1Chip label="Qty:" value="200 pcs" />
          </N1View>
          <N1View row gap="sm" align="center">
            <N1Avatar name="Koushik Dasarathan" />
            <N1Avatar name="Priya Sharma" size="lg" />
            <N1Avatar label="HI" tone="danger" shape="rounded" />
            <N1Avatar label="MD" tone="warning" shape="rounded" />
            <N1Avatar label="LO" tone="success" shape="rounded" />
          </N1View>
          <N1ProgressBar label="Overall completion" value={65} />
        </N1View>
      </N1Card>

      <N1View row wrap gap="md">
        <N1StatCard label="Total Invoices" value={284} />
        <N1StatCard label="Paid" value={196} tone="success" />
        <N1StatCard label="Pending" value={64} tone="warning" />
        <N1StatCard label="Running" value={5} tone="info" icon="wrench" />
      </N1View>

      <N1Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { key: 'invoices', label: 'Invoices' },
          { key: 'quotes', label: 'Quotes' },
        ]}
      />
      <N1Table
        columns={columns}
        data={invoices}
        keyExtractor={row => row.id}
        footer={
          <N1Pagination
            summary="Showing 3 of 284 invoices"
            hasPrevious={false}
            hasNext
            onPrevious={() => undefined}
            onNext={() => undefined}
          />
        }
      />

      <N1View gap="xs">
        <N1Text variant="h2">Operator app (userFlow)</N1Text>
        <N1Text color="secondary">
          New components from the userFlow design.
        </N1Text>
      </N1View>

      <N1Card title="Headers & logo">
        <N1View gap="md">
          <N1Logo />
          <N1View style={styles.phoneFrame}>
            <N1Header variant="brand" safeArea={false} />
          </N1View>
          <N1View style={styles.phoneFrame}>
            <N1Header
              title="Profile"
              safeArea={false}
              right={
                <N1IconButton
                  icon="edit"
                  size="sm"
                  accessibilityLabel="Edit profile"
                />
              }
            />
          </N1View>
          <N1View style={styles.phoneFrame}>
            <N1Header
              title="Job card"
              leftIcon="chevron-left"
              onLeftPress={() => undefined}
              safeArea={false}
            />
          </N1View>
          <N1PageHeader
            title="My Jobs"
            subtitle="3 active · 5 total"
            right={
              <N1IconButton
                icon="search"
                size="sm"
                accessibilityLabel="Search jobs"
              />
            }
          />
        </N1View>
      </N1Card>

      <N1Card title="Lists">
        <N1View gap="sm">
          <N1Tabs
            fullWidth
            value={qcTab}
            onChange={setQcTab}
            tabs={[
              { key: 'raw', label: 'Raw Material QC' },
              { key: 'machine', label: 'Machine QC' },
            ]}
          />
          <N1Button title="Import Job" leftIcon="scan" fullWidth />
          <N1ListItem
            title="WO-00125 · Machined Shaft"
            subtitle="CNC Turning · Lathe 02"
            right={<N1Badge label="In progress" tone="info" dot />}
          >
            <N1ProgressBar value={65} showValue />
            <N1View row gap="sm">
              <N1Button
                title="View"
                variant="secondary"
                leftIcon="eye"
                size="sm"
                style={styles.half}
              />
              <N1IconButton
                icon="plus"
                variant="primary"
                size="sm"
                accessibilityLabel="Add"
              />
            </N1View>
          </N1ListItem>
          <N1ListItem
            title="WO-00124 · Bracket Assembly"
            subtitle="Incoming inspection · MS Flat Bar"
            right={<N1Badge label="Pending" dot />}
            onPress={() => undefined}
          />
          <N1ListItem
            title="WO-00121 · Housing Cover"
            subtitle="In-process QC · Drilling (Drill 03)"
            right={<N1Badge label="Failed" tone="danger" dot />}
            divider={false}
          />
        </N1View>
      </N1Card>

      <N1Card title="Details">
        <N1View gap="lg">
          <N1KeyValueList
            title="Details"
            items={[
              { label: 'Material', value: 'MS Round Bar' },
              { label: 'Quantity', value: '200 pcs' },
              { label: 'Due date', value: '02 Oct 2026' },
            ]}
          />
          <N1KeyValueList
            dividers
            items={[
              { label: 'Employee ID', value: 'EMP-1042' },
              { label: 'Department', value: 'Machining' },
              { label: 'Shift', value: 'Morning (6 AM – 2 PM)' },
            ]}
          />
          <N1KeyValueList
            title="Machine assigned"
            items={[
              { label: 'Machine', value: 'Lathe 02' },
              { label: 'Started at', value: '09:42 AM' },
              {
                label: 'Elapsed time',
                value: (
                  <N1Timer
                    startedAt={startedAt}
                    variant="small"
                    weight="bold"
                  />
                ),
              },
            ]}
          />
          <N1DetailGrid
            title="Additional details"
            items={[
              { label: 'PO number', value: 'PO-8842' },
              { label: 'Route card no', value: 'RC-2210' },
              { label: 'DC no', value: 'DC-5561' },
              { label: 'DC date', value: '24 Sep 2026' },
              { label: 'Part number', value: 'PN-33021' },
              { label: 'Drawing number', value: 'DRW-1187' },
            ]}
          />
        </N1View>
      </N1Card>

      <N1Card title="Assign machine">
        <N1View gap="sm">
          {machines.map(m => (
            <N1SelectCard
              key={m.id}
              title={m.name}
              subtitle={m.bay}
              selected={machine === m.id}
              disabled={!m.available}
              onPress={() => setMachine(m.id)}
              right={
                <N1Badge
                  label={m.available ? 'Available' : 'In use'}
                  tone={m.available ? 'success' : 'neutral'}
                />
              }
            />
          ))}
        </N1View>
      </N1Card>

      <N1Card title="Process flow">
        <N1View gap="md">
          <N1ProcessStep number={1} status="completed">
            <N1DropDown
              options={operationOptions}
              value="material-qc"
              onChange={() => undefined}
            />
          </N1ProcessStep>
          <N1ProcessStep number={2} status="current" onRemove={() => undefined}>
            <N1DropDown
              options={operationOptions}
              value={step3}
              onChange={setStep3}
            />
          </N1ProcessStep>
          <N1ProcessStep
            number={3}
            status="upcoming"
            onRemove={() => undefined}
          >
            <N1DropDown
              options={operationOptions}
              value="deburring"
              onChange={() => undefined}
            />
          </N1ProcessStep>
          <N1ProcessStep number={4} onRemove={() => undefined}>
            <N1DropDown
              options={operationOptions}
              placeholder="Select operation"
              onChange={() => undefined}
            />
          </N1ProcessStep>
        </N1View>
      </N1Card>

      <N1Card title="Route card">
        <N1View gap="sm">
          <N1TimelineItem
            status="done"
            title="Material QC"
            subtitle="QC Bay 1 · Suresh Babu"
            meta="Completed at: 09:45 AM"
          />
          <N1TimelineItem
            status="active"
            title="Turning (Lathe)"
            subtitle="CNC-02 · Arun Prakash"
            meta="Started at: 10:25 AM"
          />
          <N1TimelineItem
            status="pending"
            title="Deburring"
            subtitle="Next operation"
          />
        </N1View>
      </N1Card>

      <N1Card title="QR scanner">
        <N1View style={styles.scanDemo}>
          <N1Header
            variant="dark"
            title="Scan QR Code"
            leftIcon="close"
            onLeftPress={() => undefined}
            safeArea={false}
            right={
              <N1IconButton
                icon="flash"
                variant="overlay"
                size="sm"
                accessibilityLabel="Toggle flash"
              />
            }
          />
          <N1ScanFrame
            message="The job details will import automatically once scanned"
            actionLabel="Enter code manually"
            onActionPress={() => undefined}
          />
        </N1View>
      </N1Card>

      <N1Card title="Bottom bars">
        <N1View gap="md">
          <N1View style={styles.phoneFrame}>
            <N1BottomBar>
              <N1Button
                title="Pass"
                variant="success"
                leftIcon="check-circle"
                fullWidth
              />
              <N1Button
                title="Fail"
                variant="danger"
                leftIcon="x-circle"
                fullWidth
              />
            </N1BottomBar>
          </N1View>
          <N1View style={styles.phoneFrame}>
            <N1BottomBar>
              <N1Button title="Start" leftIcon="play" fullWidth />
              <N1Button
                title="Stop"
                variant="secondary"
                leftIcon="pause"
                fullWidth
              />
            </N1BottomBar>
          </N1View>
          <N1View style={styles.phoneFrame}>
            <N1BottomTabBar
              value={bottomTab}
              onChange={setBottomTab}
              tabs={[
                { key: 'jobs', label: 'Jobs', icon: 'clipboard' },
                { key: 'profile', label: 'Profile', icon: 'user' },
              ]}
            />
          </N1View>
          <N1View row wrap gap="md" align="center">
            <N1Button
              title="Voice note"
              variant="secondary"
              size="sm"
              leftIcon="mic"
            />
            <N1Button
              title="Change photo"
              variant="secondary"
              size="sm"
              leftIcon="camera"
            />
            <N1Button title="Enter code manually" variant="link" size="sm" />
          </N1View>
        </N1View>
      </N1Card>

      <N1Card title="Overlays">
        <N1View row wrap gap="md">
          <N1Button
            title="Open modal"
            variant="secondary"
            onPress={() => setModalOpen(true)}
          />
          <N1Button
            title="Open delete dialog"
            variant="danger"
            onPress={() => setConfirmOpen(true)}
          />
        </N1View>
      </N1Card>

      <N1Modal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create user"
        subtitle="Add a new person to ABC Engineering Pvt Ltd."
        footer={
          <>
            <N1Button
              title="Cancel"
              variant="secondary"
              style={styles.half}
              onPress={() => setModalOpen(false)}
            />
            <N1Button
              title="Create user"
              style={styles.half}
              onPress={() => setModalOpen(false)}
            />
          </>
        }
      >
        <N1TextInput label="Full name" placeholder="e.g. Priya Sharma" />
        <N1TextInput
          label="Email"
          placeholder="e.g. priya.sharma@abcengineering.com"
        />
        <N1DropDown
          label="Role"
          options={roleOptions}
          value={role}
          onChange={setRole}
        />
      </N1Modal>

      <N1ConfirmDialog
        visible={confirmOpen}
        title="Delete customer?"
        message={
          <>
            This will permanently remove{' '}
            <N1Text weight="bold">Acme Metalworks</N1Text> and their order
            history. This can't be undone.
          </>
        }
        confirmLabel="Delete customer"
        onConfirm={() => setConfirmOpen(false)}
        onCancel={() => setConfirmOpen(false)}
      />
    </ScrollView>
  );
}

export default N1GalleryScreen;
