import { Alert, Platform } from 'react-native';

export const UNAVAILABLE_TITLE = 'Not available yet';
export const unavailableMessage = (action: string) =>
  `${action} will work once the backend is connected.`;

/**
 * Tells the user an action has no backend yet (Print, Download PDF, Export…),
 * instead of a button that silently does nothing.
 */
export function notifyUnavailable(action: string) {
  notify(UNAVAILABLE_TITLE, unavailableMessage(action));
}

/** A simple OK alert on every platform. */
export function notify(title: string, message: string) {
  if (Platform.OS === 'web') {
    // react-native-web's Alert is a no-op.
    (globalThis as { alert?: (text: string) => void }).alert?.(
      `${title}\n\n${message}`,
    );
    return;
  }
  Alert.alert(title, message);
}
