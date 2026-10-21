import { createContext, useContext, type ReactNode } from "react";
import type { ShellBase } from "../shell-base.js";

const ShellBaseContext = createContext<ShellBase | null>(null);

export function ShellBaseProvider({
  base,
  children,
}: {
  base: ShellBase;
  children: ReactNode;
}) {
  return (
    <ShellBaseContext.Provider value={base}>{children}</ShellBaseContext.Provider>
  );
}

/** Active Soma 2.0 shell base (`/app` or `/preview`). */
export function useShellBase(): ShellBase {
  const base = useContext(ShellBaseContext);
  if (!base) {
    throw new Error("useShellBase must be used within a ShellBaseProvider");
  }
  return base;
}
