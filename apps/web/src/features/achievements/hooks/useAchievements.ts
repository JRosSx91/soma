import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useAuth } from "../../auth/index.js";
import { achievementSync } from "../sync/achievement-sync.js";
import type { AchievementWithUnlockState } from "../types.js";

interface UseAchievementsResult {
  achievements: AchievementWithUnlockState[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Loads the user's achievements from AchievementSync.
 * `refresh` invalidates so the next GET is live detection.
 */
export function useAchievements(): UseAchievementsResult {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const snapshot = useSyncExternalStore(
    achievementSync.subscribe,
    achievementSync.getSnapshot,
    achievementSync.getSnapshot,
  );

  useEffect(() => {
    if (!userId) {
      return;
    }
    void achievementSync.sync(userId);
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    achievementSync.invalidate();
  }, [userId]);

  if (!userId || snapshot.userId !== userId) {
    return {
      achievements: [],
      loading: Boolean(userId),
      error: null,
      refresh,
    };
  }

  return {
    achievements: snapshot.rows ?? [],
    loading: snapshot.loading,
    error: snapshot.error,
    refresh,
  };
}
