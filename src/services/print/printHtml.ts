import { N1Print } from 'n1-print';

/**
 * iOS / Android: opens the system print dialog (AirPrint on iOS, the print
 * services on Android) with the page, where the user picks a printer. False
 * when the app was built without the print module. The web build uses
 * printHtml.web.ts.
 */
export async function printHtml(html: string, jobName: string) {
  if (!N1Print) {
    return false;
  }
  await N1Print.printHtml(html, jobName);
  return true;
}
