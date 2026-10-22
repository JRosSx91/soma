import { useEffect, useState } from "react";
import { fetchAchievements } from "../../achievements/client/achievements-api.js";
import type { AchievementWithUnlockState } from "../../achievements/types.js";

interface LiveAchievementsState {
  rows: AchievementWithUnlockState[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Loads GET /me/achievements for the signed-in user.
 * A null user id fetches nothing and drops any previous payload,
 * so a public visit or a logout cannot keep another person's rows.
 * The response stays in memory for this view. It is not written to storage.
 */
export function useLiveAchievements(userId: string | null): LiveAchievementsState {
  const [rows, setRows] = useState<AchievementWithUnlockState[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState(0);

  useEffect(() => {
    if (!userId) {
      setRows(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setRows(null);
    setError(null);
    setLoading(true);

    fetchAchievements(userId)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setRows(null);
        setError(err instanceof Error ? err.message : "No se han podido cargar los logros.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, request]);

  return {
    rows,
    loading,
    error,
    reload: () => setRequest((value) => value + 1),
  };
}
