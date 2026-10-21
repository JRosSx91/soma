/**
 * Shared Soma 2.0 shell base paths.
 * `/app` is the authenticated product; `/preview` is the public DEMO.
 * Navigation must stay inside the active base — never cross-link accidentally.
 *
 * Visible labels live in `common.shell` (ES/EN). This module only
 * stores ids, i18n keys, and routes.
 */
export type ShellBase = "/app" | "/preview";

export const shellSectionDefs = [
  { id: "inicio", labelKey: "home", mobileLabelKey: "home", path: "" },
  {
    id: "recuperacion",
    labelKey: "recovery",
    mobileLabelKey: "recoveryShort",
    path: "/recovery",
  },
  { id: "explorar", labelKey: "explore", mobileLabelKey: "explore", path: "/explore" },
  {
    id: "anatomia",
    labelKey: "anatomy",
    mobileLabelKey: "anatomyShort",
    path: "/anatomy",
  },
  {
    id: "logros",
    labelKey: "achievements",
    mobileLabelKey: "achievements",
    path: "/achievements",
  },
] as const;

export type ShellSectionId = (typeof shellSectionDefs)[number]["id"];
export type ShellLabelKey = (typeof shellSectionDefs)[number]["labelKey"];
export type ShellMobileLabelKey =
  (typeof shellSectionDefs)[number]["mobileLabelKey"];

export interface ShellSection {
  id: ShellSectionId;
  labelKey: ShellLabelKey;
  mobileLabelKey: ShellMobileLabelKey;
  to: string;
}

/** Build section links for the active shell base. */
export function shellSections(base: ShellBase): readonly ShellSection[] {
  return shellSectionDefs.map((item) => ({
    id: item.id,
    labelKey: item.labelKey,
    mobileLabelKey: item.mobileLabelKey,
    to: item.path === "" ? base : `${base}${item.path}`,
  }));
}

/** True when the pathname belongs to the authenticated Soma 2.0 tree. */
export function isAppShellPath(pathname: string): boolean {
  return pathname === "/app" || pathname.startsWith("/app/");
}

export function shellBaseFromPath(pathname: string): ShellBase {
  return isAppShellPath(pathname) ? "/app" : "/preview";
}
