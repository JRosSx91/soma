/** Client-side checks aligned with RegisterDto / ResetPasswordDto (min 8). */
export const PASSWORD_MIN_LENGTH = 8;

/** Early HTML bootstrap writes here; React consumes and clears it. */
export const PASSWORD_RESET_BOOTSTRAP_KEY = "__SOMA_PASSWORD_RESET_TOKEN__";

/**
 * Module-scoped hold so React StrictMode remounts (and soft navigations after
 * the URL was stripped) do not lose the one-time token for this page load.
 * Never written to localStorage / sessionStorage.
 */
let heldResetToken: string | null | undefined;

export function isValidEmailFormat(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return false;
  // Practical HTML-like check; server still validates with class-validator.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function passwordsMatch(a: string, b: string): boolean {
  return a.length > 0 && a === b;
}

export function isPasswordLongEnough(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH;
}

/**
 * Captures ?token= from the current URL and strips it from the address bar.
 * Returns null when absent. Never persists the value.
 */
export function captureAndStripResetToken(
  search: string,
  replaceState: (url: string) => void = (url) => {
    window.history.replaceState({}, "", url);
  },
  pathname: string = typeof window !== "undefined"
    ? window.location.pathname
    : "/",
  hash: string = typeof window !== "undefined" ? window.location.hash : "",
): string | null {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const token = params.get("token");
  if (!token) return null;

  params.delete("token");
  const nextQuery = params.toString();
  const next = `${pathname}${nextQuery ? `?${nextQuery}` : ""}${hash}`;
  replaceState(next);
  return token;
}

type BootstrapWindow = Window & {
  [PASSWORD_RESET_BOOTSTRAP_KEY]?: string;
};

function takeBootstrapToken(): string | null {
  if (typeof window === "undefined") return null;
  const w = window as BootstrapWindow;
  const boot = w[PASSWORD_RESET_BOOTSTRAP_KEY];
  if (typeof boot !== "string" || !boot) return null;
  try {
    delete w[PASSWORD_RESET_BOOTSTRAP_KEY];
  } catch {
    w[PASSWORD_RESET_BOOTSTRAP_KEY] = undefined;
  }
  return boot;
}

/**
 * Obtain the reset token once per page load.
 * Prefer early HTML bootstrap; fall back to stripping location.search.
 * Subsequent calls (StrictMode remount) return the same in-memory value.
 */
export function takePasswordResetToken(search: string): string | null {
  if (heldResetToken !== undefined) {
    return heldResetToken;
  }

  const fromBootstrap = takeBootstrapToken();
  if (fromBootstrap) {
    heldResetToken = fromBootstrap;
    return heldResetToken;
  }

  heldResetToken = captureAndStripResetToken(search);
  return heldResetToken;
}

/** Drop the in-memory token after a successful consume (or explicit abort). */
export function clearHeldPasswordResetToken(): void {
  heldResetToken = null;
}

/** Test helper — resets module state between cases. */
export function resetHeldPasswordResetTokenForTests(): void {
  heldResetToken = undefined;
}
