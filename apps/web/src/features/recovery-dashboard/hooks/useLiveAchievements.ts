import { useCallback, useEffect, useSyncExternalStore } from "react";
import { achievementSync } from "../../achievements/sync/achievement-sync.js";
import type { AchievementWithUnlockState } from "../../achievements/types.js";

interface LiveAchievementsState {
  rows: AchievementWithUnlockState[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Shared live catalog for Inicio and Logros.
 * A null user id reads nothing and does not reset another signed-in session.
 * Reload invalidates AchievementSync after a confirmed profile write.
 */
export function useLiveAchievements(userId: string | null): LiveAchievementsState {
  const snapshot = useSyncExternalStore(
    achievementSync.subscribe,
    achievementSync.getSnapshot,
    achievementSync.getSnapshot,
  );

  useEffect(() => {
    if (!userId) return;
    void achievementSync.sync(userId);
  }, [userId]);

  const reload = useCallback(() => {
    achievementSync.invalidate();
  }, []);

  if (!userId) {
    return { rows: null, loading: false, error: null, reload };
  }

  const mine = snapshot.userId === userId;
  return {
    rows: mine ? snapshot.rows : null,
    loading: mine ? snapshot.loading : true,
    error: mine ? snapshot.error : null,
    reload,
  };
}
