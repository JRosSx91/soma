/**
 * Where to send a visitor once the in-memory session is gone.
 *
 * `account_deleted` must land on the public home so the generic
 * confirmation can render. Other unauthenticated cases keep /login
 * (logout, expired session, anonymous deep-link to /app).
 */
export function unauthenticatedDestination(
  sessionNotice: string | null,
): "/" | "/login" {
  return sessionNotice === "account_deleted" ? "/" : "/login";
}
