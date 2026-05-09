import { useEffect, useState, useCallback } from 'react';
import { fetchAchievements } from '../client/achievements-api.js';
import type { AchievementWithUnlockState } from '../types.js';

interface UseAchievementsResult {
  achievements: AchievementWithUnlockState[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Loads the user's achievements. The backend triggers unlock detection
 * on every request, so calling refresh() is the way to surface newly
 * crossed thresholds.
 */
export function useAchievements(): UseAchievementsResult {
  const [achievements, setAchievements] = useState<AchievementWithUnlockState[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAchievements();
      setAchievements(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load achievements',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { achievements, loading, error, refresh };
}