import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAuth } from "../../auth/index.js";
import { useShellBase } from "../../recovery-dashboard/context/ShellBaseContext.js";
import { markAchievementsCelebrated } from "../client/achievements-api.js";
import {
  celebrationAttemptKey,
  celebrationFromClaimed,
  confirmCelebrationClaim,
  planCelebration,
  shouldCelebrateInShell,
  type CelebrationMode,
} from "../celebration/celebration-plan.js";
import { achievementSync } from "../sync/achievement-sync.js";
import type { AchievementWithUnlockState } from "../types.js";
import { AchievementCelebrationModal } from "./AchievementCelebrationModal.js";

/**
 * LIVE-only host. Claims celebrate ids after a live AchievementSync GET,
 * then opens one modal. Initial sync never celebrates.
 */
export function AchievementCelebrationHost() {
  const base = useShellBase();
  const { user } = useAuth();
  const snapshot = useSyncExternalStore(
    achievementSync.subscribe,
    achievementSync.getSnapshot,
    achievementSync.getSnapshot,
  );
  const handledKey = useRef<string>("");
  const claiming = useRef(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CelebrationMode>("none");
  const [achievements, setAchievements] = useState<AchievementWithUnlockState[]>(
    [],
  );

  const liveShell = shouldCelebrateInShell(base) && Boolean(user?.id);

  useEffect(() => {
    if (!liveShell || !user?.id) {
      handledKey.current = "";
      setOpen(false);
      setMode("none");
      setAchievements([]);
      return;
    }
    if (snapshot.userId !== user.id || snapshot.loading) return;

    const key = celebrationAttemptKey({
      userId: snapshot.userId,
      generation: snapshot.generation,
      kind: snapshot.kind,
      insertedIds: snapshot.lastInsertedIds,
    });
    if (handledKey.current === key || claiming.current) return;

    const plan = planCelebration({
      liveShell: true,
      kind: snapshot.kind,
      rows: snapshot.rows,
      insertedIds: snapshot.lastInsertedIds,
    });
    if (plan.mode === "none") {
      handledKey.current = key;
      return;
    }

    claiming.current = true;
    void confirmCelebrationClaim({
      userId: user.id,
      ids: plan.candidateIds,
      currentUserId: () => achievementSync.getSnapshot().userId,
      post: markAchievementsCelebrated,
      applyLocal: (ids) => achievementSync.markCelebratedLocally(ids),
    }).then((result) => {
      claiming.current = false;
      handledKey.current = key;
      if (result.status !== "ok" || result.celebratedIds.length === 0) return;
      const shown = celebrationFromClaimed(
        achievementSync.getSnapshot().rows,
        result.celebratedIds,
      );
      if (shown.mode === "none") return;
      setMode(shown.mode);
      setAchievements(shown.achievements);
      setOpen(true);
    });
  }, [
    liveShell,
    snapshot.generation,
    snapshot.kind,
    snapshot.lastInsertedIds,
    snapshot.loading,
    snapshot.rows,
    snapshot.userId,
    user?.id,
  ]);

  if (!liveShell) return null;

  return (
    <AchievementCelebrationModal
      open={open}
      mode={mode}
      achievements={achievements}
      onClose={() => setOpen(false)}
    />
  );
}
