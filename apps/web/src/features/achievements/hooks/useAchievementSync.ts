import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useAuth } from "../../auth/index.js";
import {
  achievementSync,
  type AchievementSyncSnapshot,
} from "../sync/achievement-sync.js";

export interface UseAchievementSyncResult extends AchievementSyncSnapshot {
  invalidate: () => void;
  refresh: () => Promise<AchievementSyncSnapshot | null>;
}

export function useAchievementSync(): UseAchievementSyncResult {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const snapshot = useSyncExternalStore(
    achievementSync.subscribe,
    achievementSync.getSnapshot,
    achievementSync.getSnapshot,
  );

  useEffect(() => {
    if (!userId) return;
    void achievementSync.sync(userId);
  }, [userId]);

  const invalidate = useCallback(() => {
    achievementSync.invalidate();
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) return null;
    return achievementSync.sync(userId);
  }, [userId]);

  if (!userId || snapshot.userId !== userId) {
    return {
      userId,
      rows: null,
      kind: null,
      lastInsertedIds: [],
      initialInsertedIds: [],
      loading: Boolean(userId),
      error: null,
      generation: snapshot.generation,
      invalidate,
      refresh,
    };
  }

  return { ...snapshot, invalidate, refresh };
}
