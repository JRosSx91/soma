/**
 * Shared Soma 2.0 shell base paths.
 * `/app` is the authenticated product; `/preview` is the public DEMO.
 * Navigation must stay inside the active base — never cross-link accidentally.
 *
 * Visible labels live in `common.shell` (ES/EN). This module only
 * stores ids, i18n keys, routes, icons, and which chrome shows each item.
 *
 * Pending destinations (Expedition) are omitted until they have real
 * pages. Add a def with desktop/mobile/more flags; menus filter.
 * Mobile dock: Home, Recovery, Missions, Journal, then «Más».
 * Explore sits with Anatomy in mobile «Más» so the dock stays at five
 * slots. Feedback is more-only. Account stays in AccountMenu on desktop.
 */
export type ShellBase = "/app" | "/preview";

export type ShellIconId =
  | "home"
  | "activity"
  | "compass"
  | "personStanding"
  | "trophy"
  | "book"
  | "flag"
  | "messageCircle"
  | "user";

export const shellSectionDefs = [
  {
    id: "inicio",
    labelKey: "home",
    mobileLabelKey: "home",
    path: "",
    icon: "home",
    desktop: true,
    mobile: true,
    more: false,
  },
  {
    id: "recuperacion",
    labelKey: "recovery",
    mobileLabelKey: "recoveryShort",
    path: "/recovery",
    icon: "activity",
    desktop: true,
    mobile: true,
    more: false,
  },
  {
    id: "explorar",
    labelKey: "explore",
    mobileLabelKey: "explore",
    path: "/explore",
    icon: "compass",
    desktop: true,
    mobile: false,
    more: true,
  },
  {
    id: "misiones",
    labelKey: "missions",
    mobileLabelKey: "missions",
    path: "/missions",
    icon: "flag",
    desktop: true,
    mobile: true,
    more: false,
  },
  {
    id: "anatomia",
    labelKey: "anatomy",
    mobileLabelKey: "anatomyShort",
    path: "/anatomy",
    icon: "personStanding",
    desktop: true,
    mobile: false,
    more: true,
  },
  {
    id: "logros",
    labelKey: "achievements",
    mobileLabelKey: "achievements",
    path: "/achievements",
    icon: "trophy",
    desktop: true,
    mobile: false,
    more: true,
  },
  {
    id: "bitacora",
    labelKey: "journal",
    mobileLabelKey: "journal",
    path: "/journal",
    icon: "book",
    desktop: true,
    mobile: true,
    more: false,
  },
  {
    id: "ayuda",
    labelKey: "feedback",
    mobileLabelKey: "feedback",
    path: "/feedback",
    icon: "messageCircle",
    desktop: false,
    mobile: false,
    more: true,
  },
  {
    id: "cuenta",
    labelKey: "account",
    mobileLabelKey: "account",
    path: "/account",
    icon: "user",
    desktop: false,
    mobile: false,
    more: true,
  },
] as const;

export type ShellSectionId = (typeof shellSectionDefs)[number]["id"];
export type ShellLabelKey = (typeof shellSectionDefs)[number]["labelKey"];
export type ShellMobileLabelKey = (typeof shellSectionDefs)[number]["mobileLabelKey"];

export interface ShellSection {
  id: ShellSectionId;
  labelKey: ShellLabelKey;
  mobileLabelKey: ShellMobileLabelKey;
  icon: ShellIconId;
  path: string;
  desktop: boolean;
  mobile: boolean;
  more: boolean;
  to: string;
}

function toHref(base: ShellBase, path: string): string {
  return path === "" ? base : `${base}${path}`;
}

/** Every configured section for the active shell base. */
export function shellSections(base: ShellBase): readonly ShellSection[] {
  return shellSectionDefs.map((item) => ({
    id: item.id,
    labelKey: item.labelKey,
    mobileLabelKey: item.mobileLabelKey,
    icon: item.icon,
    path: item.path,
    desktop: item.desktop,
    mobile: item.mobile,
    more: item.more,
    to: toHref(base, item.path),
  }));
}

export function desktopShellSections(base: ShellBase): readonly ShellSection[] {
  return shellSections(base).filter((item) => item.desktop);
}

export function mobileShellSections(base: ShellBase): readonly ShellSection[] {
  return shellSections(base).filter((item) => item.mobile);
}

export function moreShellSections(base: ShellBase): readonly ShellSection[] {
  return shellSections(base).filter((item) => item.more);
}

/**
 * Desktop «Más» overflow: more-only destinations that are not already on
 * the rail or in AccountMenu.
 */
export function railMoreShellSections(base: ShellBase): readonly ShellSection[] {
  return moreShellSections(base).filter(
    (item) => !item.desktop && item.id !== "cuenta",
  );
}

export function isSectionPathActive(
  to: string,
  pathname: string,
  options: { end?: boolean } = {},
): boolean {
  if (options.end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function shellSectionForPathname(
  base: ShellBase,
  pathname: string,
): ShellSection | null {
  const matches = shellSections(base).filter((item) =>
    isSectionPathActive(item.to, pathname, { end: item.path === "" }),
  );
  matches.sort((a, b) => b.to.length - a.to.length);
  return matches[0] ?? null;
}

/** True when the pathname belongs to the authenticated Soma 2.0 tree. */
export function isAppShellPath(pathname: string): boolean {
  return pathname === "/app" || pathname.startsWith("/app/");
}

export function shellBaseFromPath(pathname: string): ShellBase {
  return isAppShellPath(pathname) ? "/app" : "/preview";
}
