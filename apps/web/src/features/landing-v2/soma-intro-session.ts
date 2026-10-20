export const SOMA_INTRO_SESSION_KEY = "soma.landing-v2.intro.seen";

export function prefersReducedMotionSync(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function hasSeenLandingV2Intro(): boolean {
  try {
    return sessionStorage.getItem(SOMA_INTRO_SESSION_KEY) === "1";
  } catch {
    return true;
  }
}

export function markLandingV2IntroSeen(): void {
  try {
    sessionStorage.setItem(SOMA_INTRO_SESSION_KEY, "1");
  } catch {
    // Landing must remain usable when storage is blocked.
  }
}

/** First-paint decision: skip overlay if already seen, reduced motion, or storage is unusable. */
export function shouldPlayLandingV2Intro(): boolean {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotionSync()) return false;
  return !hasSeenLandingV2Intro();
}
