import { COMMON_STRINGS } from '../../shared/constants';
import { notify, notifyUnavailable } from '../../shared/utils';
import { printHtml } from './printHtml';

/**
 * Opens the system print dialog (the browser's, AirPrint, or Android's print
 * services) with the page, where any printer the device reaches is picked.
 * Says so when this build can't print (`action` names what was asked for),
 * or when the dialog didn't open.
 */
export function printOrNotify(html: string, jobName: string, action: string) {
  return printHtml(html, jobName).then(
    shown => {
      if (!shown) {
        notifyUnavailable(action);
      }
    },
    () => notify(COMMON_STRINGS.printFailedTitle, COMMON_STRINGS.printFailed),
  );
}
