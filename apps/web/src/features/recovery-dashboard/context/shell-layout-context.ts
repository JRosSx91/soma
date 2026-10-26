import { createContext } from "react";

export interface ShellLayoutValue {
  collapsed: boolean;
  mobileOpen: boolean;
  titleLabel: string;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const ShellLayoutContext = createContext<ShellLayoutValue | null>(null);
