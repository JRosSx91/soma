import { apiRequest } from "../../auth/client/api.js";
import type { OnboardingStatus } from "../onboarding-status.js";
import type { UsageInput, UserProfileResponse } from "../hooks/useUserProfile.js";

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
