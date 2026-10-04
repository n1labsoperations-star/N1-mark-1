// Layout sizes used by the admin shell and shared components. Spacing, colours
// and type sizes come from the N1 theme; these are the few fixed widths.

/** Expanded desktop sidebar. */
export const SIDEBAR_WIDTH = 264;

/** Icon-only desktop sidebar. */
export const SIDEBAR_COLLAPSED_WIDTH = 76;

/** Right-hand column on detail screens (Account, Recent activity…). */
export const ASIDE_WIDTH = 312;

/** Left profile column on record pages (Customer details). */
export const PROFILE_PANEL_WIDTH = 288;

/** Section menu on settings-style pages (Organization details). */
export const SECTION_NAV_WIDTH = 240;

/** Search box in list toolbars on wide screens. */
export const TOOLBAR_SEARCH_WIDTH = 360;

/** Minimum width of a filter drop-down in a toolbar. */
export const TOOLBAR_FILTER_MIN_WIDTH = 150;

/** Donut rings: profile completion (xs), customer order distribution. */
export const DONUT_SIZE = { xs: 64, sm: 96, md: 150 } as const;
export const DONUT_THICKNESS = { xs: 8, sm: 14, md: 22 } as const;

/** Drawing preview box on the order screen. */
export const DRAWING_PREVIEW_HEIGHT = 150;
