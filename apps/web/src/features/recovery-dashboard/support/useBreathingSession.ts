import { useEffect, useState, useSyncExternalStore } from "react";
import {
  createBreathingSession,
  type BreathingClock,
  type BreathingSession,
  type BreathingSnapshot,
  type BreathingVisibility,
} from "./breathing-session.js";

const browserClock: BreathingClock = {
  now: () => performance.now(),
  setTimeout: (callback, ms) => window.setTimeout(callback, ms),
  clearTimeout: (handle) => window.clearTimeout(handle as number),
};

const browserVisibility: BreathingVisibility = {
  isHidden: () => document.visibilityState === "hidden",
  subscribe(onChange) {
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  },
};

function createBrowserSession(): BreathingSession {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return createBreathingSession({ now: () => 0, setTimeout: () => null, clearTimeout: () => {} });
  }
  return createBreathingSession(browserClock, browserVisibility);
}

export function useBreathingSession(): { session: BreathingSession; snapshot: BreathingSnapshot } {
  const [session] = useState(createBrowserSession);
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  useEffect(() => () => session.dispose(), [session]);
  return { session, snapshot };
}
