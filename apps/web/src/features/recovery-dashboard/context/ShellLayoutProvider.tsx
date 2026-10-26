import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  readSidebarCollapsed,
  writeSidebarCollapsed,
} from "../shell-sidebar.js";
import { ShellLayoutContext } from "./shell-layout-context.js";

export function ShellLayoutProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(readSidebarCollapsed);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      writeSidebarCollapsed(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ collapsed, toggleCollapsed }),
    [collapsed, toggleCollapsed],
  );

  return (
    <ShellLayoutContext.Provider value={value}>
      {children}
    </ShellLayoutContext.Provider>
  );
}
