import { useEffect, type ReactNode } from "react";
import { useAuth } from "../../auth/index.js";
import { achievementSync } from "../sync/achievement-sync.js";

interface AchievementSyncProviderProps {
  children: ReactNode;
}

/**
 * Binds AchievementSync to the signed-in user. Logout and account switch
 * drop in-memory rows so one session cannot leak into another.
 * Views call `sync`/`invalidate`; this provider does not poll.
 */
export function AchievementSyncProvider({
  children,
}: AchievementSyncProviderProps) {
  const { user, status } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (status === "checking") return;
    if (!userId) {
      achievementSync.reset();
      return;
    }
    achievementSync.bindUser(userId);
  }, [status, userId]);

  return children;
}
