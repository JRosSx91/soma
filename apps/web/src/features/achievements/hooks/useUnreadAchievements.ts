import { useCallback, useEffect, useState } from 'react';
import {
  fetchAchievements,
  markAchievementsAsNotified,
} from '../client/achievements-api.js';
import type { AchievementWithUnlockState } from '../types.js';

interface UseUnreadAchievementsResult {
  unread: AchievementWithUnlockState[];
  loading: boolean;
  error: string | null;
  /**
   * Marks the given achievement IDs as notified on the backend and
   * removes them from the local unread list. Idempotent on the server
   * side — re-sending an already-notified ID is a no-op.
   */
  markAsRead: (achievementIds: string[]) => Promise<void>;
}

/**
 * Loads achievements unlocked but not yet notified. Used by the
 * trophy toast stack to surface PSN-style notifications when the
 * user opens the app.
 *
 * The backend triggers unlock detection on the GET, so newly crossed
 * thresholds are included automatically.
 */
export function useUnreadAchievements(): UseUnreadAchievementsResult {
  const [unread, setUnread] = useState<AchievementWithUnlockState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await fetchAchievements();
        if (cancelled) return;
        const filtered = all.filter(
          (a) => a.unlocked && a.notifiedAt === null,
        );
        setUnread(filtered);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'Failed to load achievements',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const markAsRead = useCallback(async (achievementIds: string[]) => {
    if (achievementIds.length === 0) return;
    try {
      await markAchievementsAsNotified(achievementIds);
      setUnread((prev) =>
        prev.filter((a) => !achievementIds.includes(a.id)),
      );
    } catch (err) {
      // Silent failure: the toast will reappear on next load, which
      // is the worst-case behavior — annoying but not destructive.
      // Log for debugging.
      console.error('Failed to mark achievements as notified:', err);
    }
  }, []);

  return { unread, loading, error, markAsRead };
}