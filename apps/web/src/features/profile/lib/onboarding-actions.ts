import type { UsageInput, UserProfileResponse } from "../hooks/useUserProfile.js";
import type { OnboardingStatus } from "../onboarding-status.js";
import {
  patchOnboardingStatus,
  saveUserUsages,
} from "../client/profile-api.js";

export type OnboardingActionResult =
  | { ok: true; profile: UserProfileResponse }
  | {
      ok: false;
      phase: "put" | "patch" | "load";
      error: unknown;
      /** Usages already persisted; retry should only PATCH. */
      usagesSaved: boolean;
    };

/**
 * Save substance tracking then mark onboarding completed.
 * If PUT succeeds and PATCH fails, callers can retry with `completeOnly`.
 */
export async function completeOnboardingWithUsages(
  usages: UsageInput[],
  deps: {
    saveUsages?: typeof saveUserUsages;
    patchStatus?: typeof patchOnboardingStatus;
  } = {},
): Promise<OnboardingActionResult> {
  const save = deps.saveUsages ?? saveUserUsages;
  const patch = deps.patchStatus ?? patchOnboardingStatus;

  try {
    await save(usages);
  } catch (error) {
    return { ok: false, phase: "put", error, usagesSaved: false };
  }

  try {
    const profile = await patch("completed");
    return { ok: true, profile };
  } catch (error) {
    return {
      ok: false,
      phase: "patch",
      error,
      usagesSaved: true,
    };
  }
}

/** Retry only the completed status after a successful PUT. */
export async function completeOnboardingStatusOnly(
  deps: { patchStatus?: typeof patchOnboardingStatus } = {},
): Promise<OnboardingActionResult> {
  const patch = deps.patchStatus ?? patchOnboardingStatus;
  try {
    const profile = await patch("completed");
    return { ok: true, profile };
  } catch (error) {
    return { ok: false, phase: "patch", error, usagesSaved: true };
  }
}

/**
 * Mark onboarding skipped. Never sends PUT /me/profile — existing
 * SubstanceUsage rows must not be cleared.
 */
export async function skipOnboardingWithoutClearingUsages(
  deps: { patchStatus?: typeof patchOnboardingStatus } = {},
): Promise<OnboardingActionResult> {
  const patch = deps.patchStatus ?? patchOnboardingStatus;
  try {
    const profile = await patch("skipped");
    return { ok: true, profile };
  } catch (error) {
    return { ok: false, phase: "patch", error, usagesSaved: false };
  }
}

export function parseOnboardingStatusFromProfile(
  profile: UserProfileResponse | null,
): OnboardingStatus | null {
  if (!profile) return null;
  const raw = profile.onboardingStatus;
  if (raw === "pending" || raw === "skipped" || raw === "completed") {
    return raw;
  }
  return null;
}
