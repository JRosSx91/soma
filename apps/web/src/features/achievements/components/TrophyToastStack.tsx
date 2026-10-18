import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUnreadAchievements } from "../hooks/useUnreadAchievements.js";
import { TrophyToast } from "./TrophyToast.js";

/** Keep the stack short so it cannot cover Soma 2.0 chrome (header / account). */
const MAX_VISIBLE_TOASTS = 3;

/**
 * Stack of trophy unlock notifications, anchored to the bottom-right
 * of the viewport. Mounts once in ProtectedLayout; surfaces
 * achievements unlocked but not yet notified, and batches the
 * mark-as-notified call when the user dismisses them.
 *
 * Behavior:
 *   - At most three toasts are shown; the rest stay pending until marked.
 *   - Each toast can be dismissed individually with ×.
 *   - "Mark all as seen" dismisses the entire unread set in one call.
 *   - Dismissed IDs are buffered and flushed to the backend when the
 *     stack empties, or on unmount.
 */
export function TrophyToastStack() {
  const { t } = useTranslation("main");
  const { unread, markAsRead } = useUnreadAchievements();

  const [visible, setVisible] = useState<typeof unread>([]);
  const [pendingDismiss, setPendingDismiss] = useState<string[]>([]);
  const pendingDismissRef = useRef(pendingDismiss);
  pendingDismissRef.current = pendingDismiss;

  // Sync from unread without resurrecting locally dismissed IDs.
  useEffect(() => {
    const dismissed = new Set(pendingDismissRef.current);
    setVisible((prev) => {
      const unreadById = new Map(unread.map((item) => [item.id, item]));
      const kept = prev.filter(
        (item) => unreadById.has(item.id) && !dismissed.has(item.id),
      );
      const keptIds = new Set(kept.map((item) => item.id));
      const newcomers = unread.filter(
        (item) => !keptIds.has(item.id) && !dismissed.has(item.id),
      );
      if (prev.length === 0 && kept.length === 0) {
        return unread.filter((item) => !dismissed.has(item.id));
      }
      return [...kept, ...newcomers];
    });
  }, [unread]);

  const dismissOne = useCallback((id: string) => {
    setVisible((prev) => prev.filter((a) => a.id !== id));
    setPendingDismiss((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const dismissAll = useCallback(() => {
    setPendingDismiss((prev) => {
      const merged = new Set([...prev, ...visible.map((a) => a.id)]);
      return [...merged];
    });
    setVisible([]);
  }, [visible]);

  // Flush pending dismissals to the backend when the stack empties.
  useEffect(() => {
    if (visible.length === 0 && pendingDismiss.length > 0) {
      const ids = pendingDismiss;
      setPendingDismiss([]);
      void markAsRead(ids);
    }
  }, [visible.length, pendingDismiss, markAsRead]);

  // Defensive flush on unmount.
  useEffect(() => {
    return () => {
      if (pendingDismissRef.current.length > 0) {
        void markAsRead(pendingDismissRef.current);
      }
    };
  }, [markAsRead]);

  if (visible.length === 0) return null;

  const shown = visible.slice(0, MAX_VISIBLE_TOASTS);
  const hiddenCount = visible.length - shown.length;

  return (
    <div
      className="
        pointer-events-none fixed bottom-24 right-4 z-40
        flex max-h-[min(40vh,20rem)] flex-col items-end gap-2
        lg:bottom-4
      "
    >
      {(visible.length > 1 || hiddenCount > 0) && (
        <button
          type="button"
          onClick={dismissAll}
          className="
            pointer-events-auto rounded border border-soma-border-subtle/60
            bg-soma-bg-surface/80 px-2 py-1 text-[11px]
            text-soma-fg-muted backdrop-blur-sm transition-colors
            hover:text-soma-fg-primary
          "
        >
          {t("trophies.toastDismissAll", { count: visible.length })}
        </button>
      )}
      <div className="pointer-events-auto flex max-h-full flex-col gap-2 overflow-y-auto pr-1">
        {shown.map((achievement) => (
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
