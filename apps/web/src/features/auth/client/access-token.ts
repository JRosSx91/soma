/**
 * In-memory access JWT. Never written to localStorage, sessionStorage,
 * IndexedDB, or document.cookie.
 */

let accessToken: string | null = null;

/** Monotonic counter bumped on logout so late refresh results are discarded. */
let sessionEpoch = 0;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export function getSessionEpoch(): number {
  return sessionEpoch;
}

/** Invalidate in-flight refresh results after logout. */
export function bumpSessionEpoch(): number {
  sessionEpoch += 1;
  clearAccessToken();
  return sessionEpoch;
}

export const LEGACY_TOKEN_STORAGE_KEY = "soma.auth.token";

/**
 * Removes pre–delivery-3 JWT persistence. Does not mint a refresh session
 * from the discarded JWT (that would be an insecure migration).
 */
export function clearLegacyAuthStorage(): void {
  try {
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore quota / private-mode failures.
  }
  try {
    sessionStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
