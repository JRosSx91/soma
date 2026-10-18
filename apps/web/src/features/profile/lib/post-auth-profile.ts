import type { OnboardingStatus } from "../onboarding-status.js";
import { destinationAfterLogin } from "../onboarding-status.js";
import { parseOnboardingStatusFromProfile } from "./onboarding-actions.js";
import type { UserProfileResponse } from "../hooks/useUserProfile.js";

export type PostAuthProfileOutcome =
  | { kind: "pending" }
  | { kind: "app"; status: Exclude<OnboardingStatus, "pending"> }
  | { kind: "unknown" };

/**
 * Interprets GET /me/profile after login or session restore.
 * Never invents pending/skipped/completed when the profile is missing.
 */
export function outcomeFromProfileFetch(
  result:
    | { ok: true; profile: UserProfileResponse }
    | { ok: false },
): PostAuthProfileOutcome {
  if (!result.ok) return { kind: "unknown" };
  const status = parseOnboardingStatusFromProfile(result.profile);
  if (!status) return { kind: "unknown" };
  if (status === "pending" || destinationAfterLogin(status) === "invite") {
    return { kind: "pending" };
  }
  return { kind: "app", status };
}
