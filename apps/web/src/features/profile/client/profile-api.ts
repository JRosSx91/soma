import {
  apiRequest,
  ApiError,
  notifySessionRevoked,
  refreshAccessSession,
} from "../../auth/client/api.js";
import type { OnboardingStatus } from "../onboarding-status.js";
import type { UsageInput, UserProfileResponse } from "../hooks/useUserProfile.js";
import type { ProfileDetailsPatch } from "../lib/profile-details.js";
import { isWrongPasswordDeleteError } from "../lib/delete-account.js";

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

/**
 * Permanently deletes the authenticated account.
 * Wrong-password 401 must not revoke the session; expired JWT uses the
 * usual refresh / session-revoked path.
 */
export async function withdrawSpecialCategoryConsent(
  password: string,
): Promise<void> {
  if (typeof password !== "string" || password.trim().length === 0) {
    throw new TypeError("password is required");
  }

  const sendWithdraw = () =>
    apiRequest<void>("/me/account/special-category-consent/withdraw", {
      method: "POST",
      body: { password },
      credentials: "include",
      cookieAuth: true,
      skipRefresh: true,
    });

  try {
    await sendWithdraw();
  } catch (err) {
    if (isWrongPasswordDeleteError(err)) {
      throw err;
    }
    if (!(err instanceof ApiError) || err.status !== 401) {
      throw err;
    }

    let refreshed: Awaited<ReturnType<typeof refreshAccessSession>>;
    try {
      refreshed = await refreshAccessSession();
    } catch (networkErr) {
      throw networkErr;
    }

    if (refreshed.ok) {
      await sendWithdraw();
      return;
    }
    if (refreshed.status === 401 || refreshed.status === 403) {
      notifySessionRevoked();
    }
    throw err;
  }
}

export async function deleteOwnAccount(password: string): Promise<void> {
  if (typeof password !== "string" || password.trim().length === 0) {
    throw new TypeError("password is required");
  }

  const sendDelete = () =>
    apiRequest<void>("/me/account", {
      method: "DELETE",
      body: { password },
      credentials: "include",
      cookieAuth: true,
      skipRefresh: true,
    });

  try {
    await sendDelete();
  } catch (err) {
    if (isWrongPasswordDeleteError(err)) {
      throw err;
    }
    if (!(err instanceof ApiError) || err.status !== 401) {
      throw err;
    }

    let refreshed: Awaited<ReturnType<typeof refreshAccessSession>>;
    try {
      refreshed = await refreshAccessSession();
    } catch (networkErr) {
      throw networkErr;
    }

    if (refreshed.ok) {
      await sendDelete();
      return;
    }
    if (refreshed.status === 401 || refreshed.status === 403) {
      notifySessionRevoked();
    }
    throw err;
  }
}
