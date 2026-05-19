import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT_PX = 768;

/**
 * Returns true when the viewport is narrower than the md breakpoint
 * (768px). Updates reactively when the viewport is resized.
 *
 * Used to conditionally mount mobile-only components (e.g. BottomSheet)
 * so that their side effects (body scroll lock, listeners) don't run
 * on desktop where they'd be inappropriate.
 *
 * SSR-safe: returns false during the first server render, then
 * corrects on mount.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`)
      .matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
