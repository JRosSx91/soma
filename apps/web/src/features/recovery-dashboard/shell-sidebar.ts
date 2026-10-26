export const SHELL_SIDEBAR_STORAGE_KEY = "soma.shell.sidebarCollapsed";
export const SHELL_SIDEBAR_EXPANDED_CLASS = "lg:pl-60";
export const SHELL_SIDEBAR_COLLAPSED_CLASS = "lg:pl-[4.5rem]";

export function readSidebarCollapsed(): boolean {
  try {
    return globalThis.localStorage?.getItem(SHELL_SIDEBAR_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeSidebarCollapsed(collapsed: boolean): void {
  try {
    globalThis.localStorage?.setItem(
      SHELL_SIDEBAR_STORAGE_KEY,
      collapsed ? "1" : "0",
    );
  } catch {
    // Private mode or blocked storage must not break navigation.
  }
}
