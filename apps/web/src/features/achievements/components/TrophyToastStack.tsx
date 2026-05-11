import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUnreadAchievements } from '../hooks/useUnreadAchievements.js';
import { TrophyToast } from './TrophyToast.js';

/**
 * Stack of trophy unlock notifications, anchored to the bottom-right
 * of the viewport. Mounts globally in protected routes; surfaces
 * achievements unlocked but not yet notified, and batches the
 * mark-as-notified call when the user dismisses them.
 *
 * Behavior:
 *   - Each toast can be dismissed individually with ×.
 *   - "Mark all as seen" button at the top of the stack dismisses
 *     everything in one call.
 *   - Dismissed IDs are buffered and flushed to the backend when the
 *     stack empties, or on unmount.
 */
export function TrophyToastStack() {
  const { t } = useTranslation('main');
  const { unread, markAsRead } = useUnreadAchievements();

  // Local state — we manage the visible stack independently from the
  // hook so we can animate dismissals and batch the backend call.
  const [visible, setVisible] = useState<typeof unread>([]);
  const [pendingDismiss, setPendingDismiss] = useState<string[]>([]);

  // When unread changes (initial load), populate the visible stack.
  useEffect(() => {
    setVisible(unread);
  }, [unread]);

  const dismissOne = useCallback((id: string) => {
    setVisible((prev) => prev.filter((a) => a.id !== id));
    setPendingDismiss((prev) => [...prev, id]);
  }, []);

  const dismissAll = useCallback(() => {
    setPendingDismiss((prev) => [...prev, ...visible.map((a) => a.id)]);
    setVisible([]);
  }, [visible]);

  // Flush pending dismissals to the backend when the stack empties.
  // We don't flush per-dismissal to avoid hammering the API when the
  // user clicks through several toasts in a row.
  useEffect(() => {
    if (visible.length === 0 && pendingDismiss.length > 0) {
      const ids = pendingDismiss;
      setPendingDismiss([]);
      void markAsRead(ids);
    }
  }, [visible.length, pendingDismiss, markAsRead]);

  // Defensive flush on unmount — if the user navigates away with
  // toasts still pending, we don't lose the mark.
  useEffect(() => {
    return () => {
      if (pendingDismiss.length > 0) {
        void markAsRead(pendingDismiss);
      }
    };
    // We deliberately omit pendingDismiss from deps: we only want
    // this to run on unmount, with whatever the latest value was.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (visible.length === 0) return null;

  return (
    <div
      className="
        fixed bottom-4 right-4 z-50
        flex flex-col gap-2 items-end
        pointer-events-none
        max-h-[calc(100vh-2rem)]
      "
    >
      {visible.length > 1 && (
        <button
          onClick={dismissAll}
          className="
            text-[11px] text-soma-fg-muted hover:text-soma-fg-primary
            bg-soma-bg-surface/80 backdrop-blur-sm
            border border-soma-border-subtle/60 rounded
            px-2 py-1
            pointer-events-auto
            transition-colors
          "
        >
          {t('trophies.toastDismissAll', { count: visible.length })}
        </button>
      )}
      <div className="flex flex-col gap-2 pointer-events-auto overflow-y-auto pr-1">
        {visible.map((achievement) => (
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