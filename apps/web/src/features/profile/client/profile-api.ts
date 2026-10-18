import { apiRequest } from "../../auth/client/api.js";
import type { OnboardingStatus } from "../onboarding-status.js";
import type { UsageInput, UserProfileResponse } from "../hooks/useUserProfile.js";
import type { ProfileDetailsPatch } from "../lib/profile-details.js";

export async function fetchUserProfile(): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>("/me/profile");
}

export async function saveUserUsages(
  usages: UsageInput[],
): Promise<UserProfileResponse> {
  if (!Array.isArray(usages)) {
    throw new TypeError("usages must be an array");
  }
  return apiRequest<UserProfileResponse>("/me/profile", {
    method: "PUT",
    body: { usages },
  });
}

export async function patchOnboardingStatus(
  status: OnboardingStatus,
): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>("/me/profile/onboarding-status", {
    method: "PATCH",
    body: { status },
  });
}

/**
 * Partial update of personal fields only.
 * Callers must send a non-empty patch of already-validated numbers (not strings).
 */
export async function patchProfileDetails(
  patch: ProfileDetailsPatch,
): Promise<UserProfileResponse> {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    throw new TypeError("patch must be an object");
  }
  if (Object.keys(patch).length === 0) {
    throw new TypeError("patch must include at least one field");
  }
  return apiRequest<UserProfileResponse>("/me/profile/details", {
    method: "PATCH",
    body: patch,
  });
}
