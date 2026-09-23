/**
 * Registers the Lato and IcoMoon TTFs (shared with iOS/Android in assets/fonts) as
 * @font-face rules, using the same family names as src/theme/fonts.ts.
 *
 * @format
 */

import latoRegular from '../assets/fonts/Lato-Regular.ttf';
import latoSemibold from '../assets/fonts/Lato-Semibold.ttf';
import latoBold from '../assets/fonts/Lato-Bold.ttf';
import icomoon from '../assets/fonts/icomoon.ttf';

const faces = [
  ['Lato-Regular', latoRegular],
  ['Lato-Semibold', latoSemibold],
  ['Lato-Bold', latoBold],
  ['icomoon', icomoon],
];

const style = document.createElement('style');
style.textContent = faces
  .map(
    ([family, url]) =>
      `@font-face { font-family: '${family}'; src: url(${url}) format('truetype'); font-display: swap; }`,
  )
  .join('\n');
document.head.appendChild(style);
