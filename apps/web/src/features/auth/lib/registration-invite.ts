/**
 * Early HTML bootstrap writes here; React consumes and clears it.
 */
export const REGISTRATION_INVITE_BOOTSTRAP_KEY =
  "__SOMA_REGISTRATION_INVITE_TOKEN__";

/**
 * Module-scoped hold so React StrictMode remounts after the URL is stripped
 * do not lose the invite for this page load.
 * Never written to localStorage / sessionStorage / cookies.
 */
let heldInviteToken: string | null | undefined;

/**
 * Captures ?invite= and strips it from the address bar, keeping other params.
 * Returns null when absent. Never persists the value.
 */
export function captureAndStripInviteToken(
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
  const invite = params.get("invite");
  if (!invite) return null;

  params.delete("invite");
  const nextQuery = params.toString();
  const next = `${pathname}${nextQuery ? `?${nextQuery}` : ""}${hash}`;
  replaceState(next);
  return invite;
}

type BootstrapWindow = Window & {
  [REGISTRATION_INVITE_BOOTSTRAP_KEY]?: string;
};

function takeBootstrapInvite(): string | null {
  if (typeof window === "undefined") return null;
  const w = window as BootstrapWindow;
  const boot = w[REGISTRATION_INVITE_BOOTSTRAP_KEY];
  if (typeof boot !== "string" || !boot) return null;
  try {
    delete w[REGISTRATION_INVITE_BOOTSTRAP_KEY];
  } catch {
    w[REGISTRATION_INVITE_BOOTSTRAP_KEY] = undefined;
  }
  return boot;
}

/**
 * Obtain the invite token once per page load.
 * Prefer early HTML bootstrap; fall back to stripping location.search.
 * Subsequent calls (StrictMode remount) return the same in-memory value.
 */
export function takeRegistrationInviteToken(search: string): string | null {
  if (heldInviteToken !== undefined) {
    return heldInviteToken;
  }

  const fromBootstrap = takeBootstrapInvite();
  if (fromBootstrap) {
    heldInviteToken = fromBootstrap;
    return heldInviteToken;
  }

  heldInviteToken = captureAndStripInviteToken(search);
  return heldInviteToken;
}

/** Test helper — resets module state between cases. */
export function resetHeldRegistrationInviteTokenForTests(): void {
  heldInviteToken = undefined;
}
