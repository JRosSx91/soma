/**
 * Where to send a visitor once the in-memory session is gone.
 *
 * `account_deleted` must land on the public home so the generic
 * confirmation can render. `signed_out` is an explicit logout: AccountMenu
 * aims at `/`, and ProtectedRoute must not steal that to `/login` while
 * `/app` unmounts. Expired sessions and anonymous deep-links to `/app`
 * still use `/login`.
 */
export function unauthenticatedDestination(
  sessionNotice: string | null,
): "/" | "/login" {
  return sessionNotice === "account_deleted" || sessionNotice === "signed_out"
    ? "/"
    : "/login";
}

/** Destination AccountMenu uses after POST /auth/logout. */
export function explicitLogoutDestination(): "/" {
  return "/";
}
