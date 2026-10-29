export const SHELL_SIDEBAR_STORAGE_KEY = "soma.shell.sidebarCollapsed";
export const SHELL_SIDEBAR_EXPANDED_CLASS = "lg:pl-60";
export const SHELL_SIDEBAR_COLLAPSED_CLASS = "lg:pl-[4.5rem]";
/** Gap from the collapsed rail to the reading column (~56px). */
export const SHELL_CONTENT_COLLAPSED_PAD_CLASS = "lg:pl-14 lg:pr-6";
export const SHELL_CONTENT_EXPANDED_PAD_CLASS = "lg:px-6";
export const SHELL_CONTENT_COLLAPSED_ALIGN_CLASS = "lg:ml-0";
/** Photo heroes cancel `main` `px-4 pt-2` / `lg:px-6 lg:pt-3` without page-local hacks. */
export const SHELL_HERO_BLEED_EXPANDED_CLASS = "-mx-4 -mt-2 lg:-mx-6 lg:-mt-3";
export const SHELL_HERO_BLEED_COLLAPSED_CLASS = "-mx-4 -mt-2 lg:-ml-14 lg:-mr-6 lg:-mt-3";

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
