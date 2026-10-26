import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  readSidebarCollapsed,
  writeSidebarCollapsed,
} from "../shell-sidebar.js";
import { ShellLayoutContext } from "./shell-layout-context.js";

export function ShellLayoutProvider({
  titleLabel,
  children,
}: {
  titleLabel: string;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(readSidebarCollapsed);
  const [mobileOpen, setMobileOpenState] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      writeSidebarCollapsed(next);
      return next;
    });
  }, []);

  const setMobileOpen = useCallback((open: boolean) => {
    setMobileOpenState(open);
  }, []);

  const value = useMemo(
    () => ({
      collapsed,
      mobileOpen,
      titleLabel,
      toggleCollapsed,
      setMobileOpen,
    }),
    [collapsed, mobileOpen, titleLabel, toggleCollapsed, setMobileOpen],
  );

  return (
    <ShellLayoutContext.Provider value={value}>
      {children}
    </ShellLayoutContext.Provider>
  );
}
