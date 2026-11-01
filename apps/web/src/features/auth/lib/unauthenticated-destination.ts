/**
 * Where to send a visitor once the in-memory session is gone.
 *
 * `account_deleted` must land on the public home so the generic
 * confirmation can render. `signed_out` is an explicit logout: AccountMenu
 * aims at `/`, and ProtectedRoute must not steal that to `/login` while
 * `/app` unmounts. Expired sessions and anonymous deep-links to `/app`
 * still use `/login`.
 *
 * An explicit visit to `/login` is different: `signed_out` must not bounce
 * the sign-in form back to `/`. See `shouldRedirectAnonymousLogin`.
 */
export function unauthenticatedDestination(
  sessionNotice: string | null,
): "/" | "/login" {
  return sessionNotice === "account_deleted" || sessionNotice === "signed_out"
    ? "/"
    : "/login";
}

/**
 * Whether `/login` should replace itself with the public home.
 * Only `account_deleted` — `signed_out` still shows the sign-in form.
 */
export function shouldRedirectAnonymousLogin(
  sessionNotice: string | null,
): boolean {
  return sessionNotice === "account_deleted";
}

/** Destination AccountMenu uses after POST /auth/logout. */
export function explicitLogoutDestination(): "/" {
  return "/";
}
