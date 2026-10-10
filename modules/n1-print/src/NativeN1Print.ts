import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Lays out `html` off screen and opens the system print dialog with it,
   * where any printer the phone can reach (Wi-Fi, network, Bluetooth via a
   * print service) can be chosen. Resolves once the dialog is shown (Android)
   * or closed (iOS); rejects when the page can't be printed.
   */
  printHtml(html: string, jobName: string): Promise<void>;
}

// `get`, not `getEnforcing`: a build without the module (or Jest) gets null.
export default TurboModuleRegistry.get<Spec>('N1Print');
