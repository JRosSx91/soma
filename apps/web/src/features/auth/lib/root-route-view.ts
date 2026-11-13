import { unauthenticatedDestination } from "./unauthenticated-destination.js";

export type RootRouteView = "landing" | "login-gate";

/**
 * Public `/` paint decision (PERF-01B).
 *
 * While session restore (`POST /auth/refresh`) is in flight, paint the landing
 * optimistically. Do not wait on the API for anonymous first content.
 * Redirect authenticated visitors through `/login` only after status is known.
 *
 * `account_deleted` / `signed_out` notices always keep the public home so
 * confirmation copy and explicit logout are not bounced to the sign-in form.
 */
export function rootRouteView(input: {
  loading: boolean;
  user: { id: string } | null;
  sessionNotice: string | null;
}): RootRouteView {
  if (unauthenticatedDestination(input.sessionNotice) === "/") {
    return "landing";
  }
  if (!input.loading && input.user) {
    return "login-gate";
  }
  return "landing";
}
