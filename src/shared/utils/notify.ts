import { Alert, Platform } from 'react-native';

export const UNAVAILABLE_TITLE = 'Not available yet';
export const unavailableMessage = (action: string) =>
  `${action} will work once the backend is connected.`;

/**
 * Tells the user an action has no backend yet (Print, Download PDF, Export…),
 * instead of a button that silently does nothing.
 */
export function notifyUnavailable(action: string) {
  const message = unavailableMessage(action);
  if (Platform.OS === 'web') {
    // react-native-web's Alert is a no-op.
    (globalThis as { alert?: (text: string) => void }).alert?.(
      `${UNAVAILABLE_TITLE}\n\n${message}`,
    );
    return;
  }
  Alert.alert(UNAVAILABLE_TITLE, message);
}
