import { useEffect, useState, useCallback } from "react";
import type { UsageStatus } from "@soma/shared-types";
import type { OnboardingStatus } from "../onboarding-status.js";
import {
  fetchUserProfile,
  patchOnboardingStatus,
  saveUserUsages,
} from "../client/profile-api.js";

export interface UsageInput {
  substanceId: string;
  yearStarted: number;
  /** Null when status is 'active'. */
  lastUseDate: string | null;
  frequency: "daily" | "weekly" | "monthly" | "occasional";
  status: UsageStatus;
}

export interface UserProfileResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    biologicalSex: "male" | "female";
    birthYear: number;
    weightKg: number | null;
  };
  /** Explicit backend intent — independent of usages.length. */
  onboardingStatus: OnboardingStatus;
  usages: Array<{
    id: string;
    userId: string;
    substanceId: string;
    yearStarted: number;
    lastUseDate: string | null;
    frequency: UsageInput["frequency"];
    status: UsageStatus;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface UseUserProfileOptions {
  /** When false, skip the initial GET (e.g. unauthenticated login form). */
  enabled?: boolean;
}

interface UseUserProfileResult {
  profile: UserProfileResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<UserProfileResponse | null>;
  saveProfile: (usages: UsageInput[]) => Promise<UserProfileResponse>;
  setOnboardingStatus: (
    status: OnboardingStatus,
  ) => Promise<UserProfileResponse>;
}

/**
 * Reads and updates the authenticated user's profile.
 * `saveProfile` performs a full replace of the usages array.
 * Onboarding intent is updated only via `setOnboardingStatus`.
 */
export function useUserProfile(
  options: UseUserProfileOptions = {},
): UseUserProfileResult {
  const enabled = options.enabled !== false;
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserProfile();
      setProfile(data);
      return data;
    } catch (err) {
      setProfile(null);
      setError(err instanceof Error ? err.message : "Failed to load profile");
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const saveProfile = useCallback(async (usages: UsageInput[]) => {
    const data = await saveUserUsages(usages);
    setProfile(data);
    return data;
  }, []);

  const setOnboardingStatus = useCallback(async (status: OnboardingStatus) => {
    const data = await patchOnboardingStatus(status);
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    profile,
    loading,
    error,
    refresh,
    saveProfile,
    setOnboardingStatus,
  };
}
