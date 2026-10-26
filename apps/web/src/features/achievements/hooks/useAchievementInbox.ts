import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useAuth } from "../../auth/index.js";
import { useShellBase } from "../../recovery-dashboard/context/ShellBaseContext.js";
import { markAchievementsInboxRead } from "../client/achievements-api.js";
import {
  confirmInboxRead,
  peekInitialDigestShown,
  rememberInitialDigestShown,
  resetInitialDigestMemory,
  selectInboxItems,
  shouldShowAchievementInbox,
  shouldShowInitialUnlockDigest,
  unreadInboxCount,
  unreadInboxIds,
} from "../inbox/inbox-notifications.js";
import { achievementSync } from "../sync/achievement-sync.js";

export function useAchievementInbox() {
  const base = useShellBase();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const visible = shouldShowAchievementInbox(base) && Boolean(userId);
  const snapshot = useSyncExternalStore(
    achievementSync.subscribe,
    achievementSync.getSnapshot,
    achievementSync.getSnapshot,
  );
  const [digestTick, setDigestTick] = useState(0);
  const [readError, setReadError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      resetInitialDigestMemory();
      return;
    }
    if (!visible) return;
    void achievementSync.sync(userId);
  }, [userId, visible]);

  const mine = visible && snapshot.userId === userId;
  const items = useMemo(
    () => (mine ? selectInboxItems(snapshot.rows) : []),
    [mine, snapshot.rows],
  );
  const unreadCount = mine ? unreadInboxCount(snapshot.rows) : 0;
  const digestShown = peekInitialDigestShown(userId);
  const showDigest =
    mine &&
    shouldShowInitialUnlockDigest(snapshot.initialInsertedIds, digestShown);
  void digestTick;

  const acknowledgeDigest = useCallback(() => {
    if (!userId) return;
    rememberInitialDigestShown(userId);
    setDigestTick((value) => value + 1);
  }, [userId]);

  const markRead = useCallback(
    async (ids: readonly string[]) => {
      if (!userId) return false;
      setReadError(null);
      const result = await confirmInboxRead({
        userId,
        ids,
        currentUserId: () => achievementSync.getSnapshot().userId,
        post: markAchievementsInboxRead,
        applyLocal: (readIds) => achievementSync.markInboxReadLocally(readIds),
      });
      if (result === "failed") setReadError("readError");
      return result === "ok";
    },
    [userId],
  );

  const markAllUnread = useCallback(async () => {
    return markRead(unreadInboxIds(items));
  }, [items, markRead]);

  return {
    visible,
    items,
    unreadCount,
    showDigest,
    digestCount: snapshot.initialInsertedIds.length,
    loading: Boolean(visible) && (!mine || snapshot.loading),
    readError,
    acknowledgeDigest,
    markRead,
    markAllUnread,
  };
}
