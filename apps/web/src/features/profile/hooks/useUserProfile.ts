import { useEffect, useState, useCallback } from 'react';
import { apiRequest } from '../../auth/client/api.js';

export interface UsageInput {
  substanceId: string;
  yearStarted: number;
  lastUseDate: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
}

export interface UserProfileResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    biologicalSex: 'male' | 'female';
    birthYear: number;
    weightKg: number | null;
  };
  usages: Array<{
    id: string;
    userId: string;
    substanceId: string;
    yearStarted: number;
    lastUseDate: string;
    frequency: UsageInput['frequency'];
    createdAt: string;
    updatedAt: string;
  }>;
}

interface UseUserProfileResult {
  profile: UserProfileResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  saveProfile: (usages: UsageInput[]) => Promise<UserProfileResponse>;
}

/**
 * Reads and updates the authenticated user's profile.
 * `saveProfile` performs a full replace of the usages array.
 */
export function useUserProfile(): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<UserProfileResponse>('/me/profile');
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (usages: UsageInput[]) => {
    const data = await apiRequest<UserProfileResponse>('/me/profile', {
      method: 'PUT',
      body: { usages },
    });
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, loading, error, refresh, saveProfile };
}