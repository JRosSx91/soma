/** Mirrors API OnboardingStatus — never derived from usages.length. */
export type OnboardingStatus = "pending" | "skipped" | "completed";

export function isOnboardingStatus(value: unknown): value is OnboardingStatus {
  return value === "pending" || value === "skipped" || value === "completed";
}

/**
 * Where to send the user after a successful login (or session restore on /login).
 * pending → stay for a soft invite; skipped/completed → app.
 */
export function destinationAfterLogin(
  status: OnboardingStatus,
): "invite" | "app" {
  return status === "pending" ? "invite" : "app";
}
