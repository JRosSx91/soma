import { useCallback, useEffect, useState } from "react";
import { useUnreadAchievements } from "../hooks/useUnreadAchievements.js";
import {
  MAX_VISIBLE_TOASTS,
  selectAnnouncementBatch,
} from "../lib/achievement-notify-queue.js";
import type { AchievementWithUnlockState } from "../types.js";
import { TrophyToast } from "./TrophyToast.js";

/**
 * Bottom-right unlock toasts for Soma 2.0. Marks only the batch that was
 * actually painted; further unread items stay queued until this batch is gone.
 */
export function TrophyToastStack() {
  const { unread, confirmPresented } = useUnreadAchievements();
  const [batch, setBatch] = useState<AchievementWithUnlockState[]>([]);
  const [confirmedKey, setConfirmedKey] = useState("");

  useEffect(() => {
    if (batch.length > 0) return;
    const next = selectAnnouncementBatch(unread, MAX_VISIBLE_TOASTS);
    if (next.length === 0) return;
    setBatch(next);
  }, [unread, batch.length]);

  useEffect(() => {
    if (batch.length === 0) return;
    const key = batch.map((item) => item.id).join("|");
    if (key === confirmedKey) return;
    setConfirmedKey(key);
    void confirmPresented(batch.map((item) => item.id));
  }, [batch, confirmedKey, confirmPresented]);

  const dismissOne = useCallback((id: string) => {
    setBatch((prev) => prev.filter((item) => item.id !== id));
  }, []);

  if (batch.length === 0) return null;

  return (
    <div
      className="
        pointer-events-none fixed bottom-24 right-4 z-40
        flex max-h-[min(40vh,20rem)] flex-col items-end gap-2
        lg:bottom-4
      "
    >
      <div className="pointer-events-auto flex max-h-full flex-col gap-2 overflow-y-auto pr-1">
        {batch.map((achievement) => (
          <TrophyToast
            key={achievement.id}
            achievement={achievement}
            onDismiss={() => dismissOne(achievement.id)}
          />
        ))}
      </div>
    </div>
  );
}
