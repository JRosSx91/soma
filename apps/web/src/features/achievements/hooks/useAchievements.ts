import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../auth/index.js";
import { fetchAchievements } from "../client/achievements-api.js";
import type { AchievementWithUnlockState } from "../types.js";

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
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [achievements, setAchievements] = useState<
    AchievementWithUnlockState[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setAchievements([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAchievements(userId);
      setAchievements(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load achievements",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { achievements, loading, error, refresh };
}
