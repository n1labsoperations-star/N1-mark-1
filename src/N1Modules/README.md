# N1Modules

Shared UI components for N1 apps, built from the **AdminFlow** design. They
work on iOS, Android and web, follow light / dark mode, and take token names
(`gap="md"`, `tone="success"`) instead of hard-coded numbers and colours.

```tsx
import { N1ThemeProvider, N1Button, N1TextInput } from './src/N1Modules';

<N1ThemeProvider mode="light">
  {/* 'light' | 'dark' | 'system' */}
  <App />
</N1ThemeProvider>;
```

Open **N1 Components** from the app drawer to see every component live
(`src/screens/N1GalleryScreen.tsx`).

## Components

| Component                        | Use it for                 | Key props                                                                                                       |
| -------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `N1Text`                         | All text                   | `variant` (display, h1, h2, h3, stat, title, body, label, small, caption, overline), `weight`, `color`, `align` |
| `N1View`                         | Layout boxes               | `row`, `gap`, `padding`, `background`, `radius`, `bordered`, `align`, `justify`, `wrap`                         |
| `N1Card`                         | White panels               | `title`, `subtitle`, `icon`, `headerRight`                                                                      |
| `N1Divider`                      | Separator lines            | `vertical`, `spacing`                                                                                           |
| `N1Button`                       | Actions                    | `title`, `variant` (primary, secondary, danger, ghost), `size`, `leftIcon`, `rightIcon`, `loading`, `fullWidth` |
| `N1IconButton`                   | Back, close, delete        | `icon`, `accessibilityLabel`, `variant` (secondary, soft, primary, danger)                                      |
| `N1TextInput`                    | Text fields                | `label`, `required`, `errorText`, `helperText`, `secure`, `leftIcon`, `rightElement`, `readOnly`, `multiline`   |
| `N1DropDown`                     | Select fields              | `options`, `value`, `onChange`, `label`, `placeholder`                                                          |
| `N1RadioGroup` / `N1RadioButton` | One of a few choices       | `options`, `value`, `onChange`, `direction`                                                                     |
| `N1Checkbox`                     | Yes / no                   | `label`, `checked`, `onChange`                                                                                  |
| `N1Switch`                       | On / off settings          | `label`, `value`, `onValueChange`                                                                               |
| `N1UploadBox`                    | File drop zone             | `hint`, `onPress`, `fileName`, `onRemove`                                                                       |
| `N1Checklist`                    | Password rules             | `items: { label, done }[]`                                                                                      |
| `N1Badge`                        | Status tags                | `label`, `tone` (success, info, warning, danger, neutral), `dot`                                                |
| `N1Chip`                         | Facts and filters          | `label`, `value`, `onPress`, `selected`                                                                         |
| `N1Avatar`                       | Initials, priority markers | `name` or `label`, `size`, `shape`, `tone`                                                                      |
| `N1StatCard`                     | Summary numbers            | `label`, `value`, `tone`, `icon`                                                                                |
| `N1ProgressBar`                  | Completion                 | `value` (0–100), `label`, `tone`                                                                                |
| `N1Tabs`                         | Invoices / Quotes          | `tabs`, `value`, `onChange`                                                                                     |
| `N1Table`                        | Lists of records           | `columns`, `data`, `keyExtractor`, `onRowPress`, `footer`, `renderCompactItem`                                  |
| `N1Pagination`                   | Table footer               | `summary`, `hasPrevious`, `hasNext`, `onPrevious`, `onNext`                                                     |
| `N1Modal`                        | Forms in a dialog          | `visible`, `onClose`, `title`, `subtitle`, `footer`, `size`                                                     |
| `N1ConfirmDialog`                | "Are you sure?"            | `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`, `tone`, `loading`                                  |
| `N1Icon`                         | Outline icons              | `name` (see `n1IconNames`), `size`, `color`                                                                     |

### Added from the userFlow design

| Component                        | Use it for                       | Key props                                                                      |
| -------------------------------- | -------------------------------- | ------------------------------------------------------------------------------ |
| `N1Logo`                         | The N1✱ wordmark                 | `size`, `color`                                                                |
| `N1Header`                       | Screen top bar                   | `title`, `variant` (default, brand, dark), `leftIcon`, `onLeftPress`, `right`  |
| `N1PageHeader`                   | Big title + count line           | `title`, `subtitle`, `right`                                                   |
| `N1BottomTabBar`                 | Phone tab bar                    | `tabs: { key, label, icon }[]`, `value`, `onChange`                            |
| `N1BottomBar`                    | Buttons pinned to the bottom     | `children` (buttons with `fullWidth`)                                          |
| `N1KeyValueList`                 | Label / value rows               | `items`, `title`, `dividers`, `variant`                                        |
| `N1DetailGrid`                   | Two-column detail block          | `items`, `title`, `columns`                                                    |
| `N1ListItem`                     | Job / QC rows                    | `title`, `subtitle`, `right`, `children`, `onPress`                            |
| `N1SelectCard`                   | Pick one option (Assign Machine) | `title`, `subtitle`, `right`, `selected`, `disabled`                           |
| `N1ProcessStep` / `N1StepNumber` | Numbered process-flow steps      | `number`, `status` (completed, current, upcoming, draft), `onRemove`, `locked` |
| `N1TimelineItem`                 | Route card steps                 | `title`, `subtitle`, `meta`, `status` (done, active, pending)                  |
| `N1ScanFrame`                    | QR viewfinder                    | `children` (camera), `title`, `message`, `actionLabel`, `onActionPress`        |
| `N1Timer`                        | Live elapsed time                | `startedAt`, `running`, `offsetSeconds`                                        |

Also added: `N1Button` variants `success` (Pass) and `link`, `N1IconButton`
variant `overlay` (camera screen), `N1Tabs` `fullWidth`, and icons `scan`,
`flash`, `mic`, `camera`, `x-circle`, `user`, `circle-dot`.

`N1ScanFrame` draws the viewfinder only — put your camera / QR library's
preview inside it as `children`.

On phones (under 768px wide) `N1Table` becomes stacked cards, `N1Modal`
becomes a full-screen page and `N1DropDown` opens as a bottom sheet.
`useN1Breakpoint()` gives screens the same `isCompact` / `isDesktop` flags.

## Example

```tsx
<N1Modal
  visible={open}
  onClose={close}
  title="Create user"
  subtitle="Add a new person to ABC Engineering Pvt Ltd."
  footer={
    <>
      <N1Button title="Cancel" variant="secondary" onPress={close} />
      <N1Button title="Create user" loading={saving} onPress={save} />
    </>
  }
>
  <N1TextInput label="Full name" required value={name} onChangeText={setName} />
  <N1DropDown
    label="Role"
    value={role}
    onChange={setRole}
    options={[
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ]}
  />
</N1Modal>
```

## Theming

- Raw values live in `theme/tokens.ts`; light and dark colours in `theme/themes.ts`.
- Change a colour or size there and every component follows.
- For your own styles, use the same helpers the components use:

```tsx
const makeStyles = createN1Styles(t => ({
  box: { padding: t.spacing.lg, backgroundColor: t.colors.surface },
}));

function MyScreen() {
  const styles = useN1Styles(makeStyles); // cached per theme
  // ...
}
```

## Adding an icon

Add an entry to `icons` in `icons/N1Icon.tsx` using 24×24 outline paths
(the set follows Lucide's style). The name becomes available in `N1IconName`.

## Notes

- Fonts are Lato (already bundled). The design mock-ups use a similar grotesque
  typeface; swap `fontFamily` in `tokens.ts` if the real font is added.
- `N1UploadBox` only draws the drop zone — wire `onPress` to a file picker.
- There is no date picker yet; use `N1TextInput` with a `DD/MM/YYYY` placeholder
  until a picker library is chosen.
