import { useWindowDimensions } from 'react-native';
import { breakpoints } from '../theme/tokens';

export type N1Breakpoint = {
  width: number;
  /** Phones and narrow windows: stacked cards, full-screen forms. */
  isCompact: boolean;
  /** Wide windows: sidebar, tables, centred modals. */
  isDesktop: boolean;
};

export function useN1Breakpoint(): N1Breakpoint {
  const { width } = useWindowDimensions();
  return {
    width,
    isCompact: width < breakpoints.tablet,
    isDesktop: width >= breakpoints.desktop,
  };
}
