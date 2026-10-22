import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/index.js";
import {
  fetchAchievements,
  markAchievementsAsNotified,
} from "../client/achievements-api.js";
import {
  adoptNotifyOwner,
  enqueueMarkFlush,
  filterUnannounced,
  pendingAckIds,
  presentedIds,
  recordPresentedBatch,
  sessionNotifyStorage,
  type MemoryStorage,
} from "../lib/achievement-notify-queue.js";
import type { AchievementWithUnlockState } from "../types.js";

const memoryFallback: MemoryStorage = (() => {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
})();

function notifyStorage(): MemoryStorage {
  return sessionNotifyStorage() ?? memoryFallback;
}

interface UseUnreadAchievementsResult {
  unread: AchievementWithUnlockState[];
  loading: boolean;
  error: string | null;
  /**
   * Records that this batch was shown, then acks only those ids.
   * Remaining unread items stay queued and are not marked.
   */
  confirmPresented: (achievementIds: string[]) => Promise<void>;
}

/**
 * Unlocked achievements not yet notified and not already shown this session.
 * Presented/pending ids are scoped to the signed-in user for this tab.
 */
export function useUnreadAchievements(): UseUnreadAchievementsResult {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [unread, setUnread] = useState<AchievementWithUnlockState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const retryPending = useCallback(async () => {
    if (!userId) return;
    const storage = notifyStorage();
    adoptNotifyOwner(storage, userId);
    const result = await enqueueMarkFlush(
      storage,
      markAchievementsAsNotified,
      userId,
    );
    if (result.remaining.length === 0) return;
    // Keep remaining ids pending; they stay hidden via presented set.
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setUnread([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      const storage = notifyStorage();
      adoptNotifyOwner(storage, userId);
      try {
        await retryPending();
        const all = await fetchAchievements(userId);
        if (cancelled) return;
        setUnread(filterUnannounced(all, new Set(presentedIds(storage))));
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load achievements",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
      const storage = notifyStorage();
      if (pendingAckIds(storage).length > 0) {
        void enqueueMarkFlush(storage, markAchievementsAsNotified, userId);
      }
    };
  }, [retryPending, userId]);

  const confirmPresented = useCallback(
    async (achievementIds: string[]) => {
      const ids = achievementIds.filter((id) => id.length > 0);
      if (ids.length === 0 || !userId) return;
      const storage = notifyStorage();
      adoptNotifyOwner(storage, userId);
      recordPresentedBatch(storage, ids);
      setUnread((prev) => prev.filter((row) => !ids.includes(row.id)));
      const result = await enqueueMarkFlush(
        storage,
        markAchievementsAsNotified,
        userId,
      );
      if (result.remaining.length > 0) {
        console.error("Failed to mark achievements as notified:", result.remaining);
      }
    },
    [userId],
  );

  return { unread, loading, error, confirmPresented };
}
