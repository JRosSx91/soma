/**
 * Shared Soma 2.0 shell base paths.
 * `/app` is the authenticated product; `/preview` is the public DEMO.
 * Navigation must stay inside the active base — never cross-link accidentally.
 */
export type ShellBase = "/app" | "/preview";

export const shellSectionDefs = [
  { id: "inicio", label: "Inicio", mobileLabel: "Inicio", path: "" },
  {
    id: "recuperacion",
    label: "Mi recuperación",
    mobileLabel: "Recuperación",
    path: "/recovery",
  },
  { id: "explorar", label: "Explorar", mobileLabel: "Explorar", path: "/explore" },
  {
    id: "anatomia",
    label: "Explorador anatómico",
    mobileLabel: "Anatomía",
    path: "/anatomy",
  },
  { id: "logros", label: "Logros", mobileLabel: "Logros", path: "/achievements" },
] as const;

export type ShellSectionId = (typeof shellSectionDefs)[number]["id"];

export interface ShellSection {
  id: ShellSectionId;
  label: string;
  mobileLabel: string;
  to: string;
}

/** Build section links for the active shell base. */
export function shellSections(base: ShellBase): readonly ShellSection[] {
  return shellSectionDefs.map((item) => ({
    id: item.id,
    label: item.label,
    mobileLabel: item.mobileLabel,
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
