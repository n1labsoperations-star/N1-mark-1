import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

// Maps every screen to a URL path. On web this drives the browser address bar
// (and refresh / back / forward); on native it handles n1mark1:// deep links.
// Main, Home and Feed only group screens, so they add no path segment.
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['n1mark1://'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: {
            screens: {
              Feed: {
                screens: {
                  Latest: 'feed/latest',
                  Popular: 'feed/popular',
                },
              },
              Search: 'search',
              Profile: 'profile',
            },
          },
          Settings: 'settings',
        },
      },
      Details: 'details/:id',
      Components: 'components',
    },
  },
};
