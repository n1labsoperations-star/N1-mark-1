/**
 * N1Modules — shared UI components for N1 apps, built from the AdminFlow design.
 *
 *   import { N1ThemeProvider, N1Button, N1TextInput } from './N1Modules';
 *
 * Wrap the app in <N1ThemeProvider> once; every component then follows the
 * active light / dark theme. See src/N1Modules/README.md for the full list.
 */

// Theme
export {
  N1ThemeProvider,
  useN1Theme,
  useN1Styles,
  createN1Styles,
  type N1ThemeMode,
} from './theme/N1ThemeProvider';
export {
  lightTheme,
  darkTheme,
  type N1Theme,
  type N1Tone,
  type N1Colors,
  type N1ColorMode,
} from './theme/themes';
export type {
  N1Spacing,
  N1Radius,
  N1Size,
  N1TextVariant,
  N1FontWeight,
} from './theme/tokens';
export { useN1Breakpoint, type N1Breakpoint } from './hooks/useN1Breakpoint';

// Icons
export {
  N1Icon,
  n1IconNames,
  type N1IconName,
  type N1IconProps,
  type N1IconColor,
} from './icons/N1Icon';

// Layout & text
export {
  N1Text,
  type N1TextProps,
  type N1TextColor,
} from './components/N1Text';
export {
  N1View,
  type N1ViewProps,
  type N1ViewBackground,
} from './components/N1View';
export { N1Card, type N1CardProps } from './components/N1Card';
export { N1Divider, type N1DividerProps } from './components/N1Divider';

// Actions
export {
  N1Button,
  type N1ButtonProps,
  type N1ButtonVariant,
} from './components/N1Button';
export {
  N1IconButton,
  type N1IconButtonProps,
  type N1IconButtonVariant,
} from './components/N1IconButton';
export { N1Tabs, type N1TabsProps, type N1Tab } from './components/N1Tabs';
export {
  N1Pagination,
  type N1PaginationProps,
} from './components/N1Pagination';

// Form controls
export { N1TextInput, type N1TextInputProps } from './components/N1TextInput';
export {
  N1DropDown,
  type N1DropDownProps,
  type N1DropDownOption,
} from './components/N1DropDown';
export {
  N1RadioButton,
  N1RadioGroup,
  type N1RadioButtonProps,
  type N1RadioGroupProps,
  type N1RadioOption,
} from './components/N1RadioButton';
export { N1Checkbox, type N1CheckboxProps } from './components/N1Checkbox';
export { N1Switch, type N1SwitchProps } from './components/N1Switch';
export { N1UploadBox, type N1UploadBoxProps } from './components/N1UploadBox';
export {
  N1Checklist,
  type N1ChecklistProps,
  type N1ChecklistItem,
} from './components/N1Checklist';
export { N1FieldLabel, N1FieldHelper } from './components/N1FieldLabel';

// Data display
export { N1Badge, type N1BadgeProps } from './components/N1Badge';
export { N1Chip, type N1ChipProps } from './components/N1Chip';
export {
  N1Avatar,
  getInitials,
  type N1AvatarProps,
} from './components/N1Avatar';
export { N1StatCard, type N1StatCardProps } from './components/N1StatCard';
export {
  N1ProgressBar,
  type N1ProgressBarProps,
} from './components/N1ProgressBar';
export {
  N1Table,
  type N1TableProps,
  type N1TableColumn,
} from './components/N1Table';

// Screen structure (userFlow)
export { N1Logo, type N1LogoProps } from './components/N1Logo';
export { N1Header, type N1HeaderProps } from './components/N1Header';
export {
  N1PageHeader,
  type N1PageHeaderProps,
} from './components/N1PageHeader';
export {
  N1BottomTabBar,
  type N1BottomTabBarProps,
  type N1BottomTab,
} from './components/N1BottomTabBar';
export { N1BottomBar, type N1BottomBarProps } from './components/N1BottomBar';

// Job details & workflow (userFlow)
export {
  N1KeyValueList,
  type N1KeyValueListProps,
  type N1KeyValueItem,
} from './components/N1KeyValueList';
export {
  N1DetailGrid,
  type N1DetailGridProps,
  type N1DetailGridItem,
} from './components/N1DetailGrid';
export { N1ListItem, type N1ListItemProps } from './components/N1ListItem';
export {
  N1SelectCard,
  type N1SelectCardProps,
} from './components/N1SelectCard';
export {
  N1ProcessStep,
  N1StepNumber,
  type N1ProcessStepProps,
  type N1StepNumberProps,
  type N1StepStatus,
} from './components/N1ProcessStep';
export {
  N1TimelineItem,
  type N1TimelineItemProps,
  type N1TimelineStatus,
} from './components/N1TimelineItem';
export { N1ScanFrame, type N1ScanFrameProps } from './components/N1ScanFrame';
export {
  N1Timer,
  formatElapsed,
  type N1TimerProps,
} from './components/N1Timer';

// Overlays
export { N1Modal, type N1ModalProps } from './components/N1Modal';
export {
  N1ConfirmDialog,
  type N1ConfirmDialogProps,
} from './components/N1ConfirmDialog';
