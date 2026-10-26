import { useContext } from "react";
import { ShellLayoutContext } from "../context/shell-layout-context.js";

export function useShellLayout() {
  const value = useContext(ShellLayoutContext);
  if (!value) {
    throw new Error("useShellLayout must be used within a ShellLayoutProvider");
  }
  return value;
}
