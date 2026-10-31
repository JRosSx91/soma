import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  fetchRegistrationMode,
  type RegistrationModeState,
} from "../client/registration-mode.js";

const defaultState: RegistrationModeState = { status: "loading", mode: null };

const RegistrationModeContext =
  createContext<RegistrationModeState>(defaultState);

export function RegistrationModeProvider({
  children,
  value,
}: {
  children: ReactNode;
  value?: RegistrationModeState;
}) {
  const [state, setState] = useState<RegistrationModeState>(
    value ?? defaultState,
  );

  useEffect(() => {
    if (value) {
      setState(value);
      return;
    }
    let cancelled = false;
    fetchRegistrationMode()
      .then((mode) => {
        if (!cancelled) setState({ status: "ready", mode });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", mode: null });
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <RegistrationModeContext.Provider value={state}>
      {children}
    </RegistrationModeContext.Provider>
  );
}

export function useRegistrationMode(): RegistrationModeState {
  return useContext(RegistrationModeContext);
}
