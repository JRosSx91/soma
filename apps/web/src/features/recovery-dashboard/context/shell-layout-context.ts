import { createContext } from "react";

export interface ShellLayoutValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export const ShellLayoutContext = createContext<ShellLayoutValue | null>(null);
