import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import { previewFocus } from "../../recovery-dashboard/focus.js";
import { AchievementMedal } from "../../recovery-dashboard/components/AchievementMedal.js";
import { formatDisplayDate } from "../../recovery-dashboard/dashboard/home-progress.js";
import { useAchievementInbox } from "../hooks/useAchievementInbox.js";
import type { AchievementInboxItem } from "../inbox/inbox-notifications.js";

interface AchievementInboxBellProps {
  compact?: boolean;
  placement?: "up" | "down";
}

export function AchievementInboxBell({
  compact = false,
  placement = "down",
}: AchievementInboxBellProps) {
  const { t, i18n } = useTranslation(["common", "achievements"]);
  const inbox = useAchievementInbox();
  const [open, setOpen] = useState(false);
  const [digestForOpen, setDigestForOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const acknowledgeDigest = inbox.acknowledgeDigest;

  useEffect(() => {
    if (!open) {
      setDigestForOpen(false);
      return;
    }
    if (inbox.showDigest) {
      setDigestForOpen(true);
      acknowledgeDigest();
    }
    panelRef.current?.focus();

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [acknowledgeDigest, inbox.showDigest, open]);

  if (!inbox.visible) return null;

  const triggerClass = compact
    ? `${previewFocus} relative flex h-9 w-9 items-center justify-center rounded-full text-soma-ink-secondary hover:bg-soma-surface hover:text-soma-ink`
    : `${previewFocus} relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-soma-ink-secondary transition-colors hover:bg-soma-surface hover:text-soma-ink`;

  const badgeLabel = t("notifications.badgeLabel", { count: inbox.unreadCount });

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className={triggerClass}
        aria-label={t("notifications.bellLabel")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className={compact ? "h-5 w-5" : "h-4 w-4 shrink-0"} aria-hidden="true" />
        {compact ? null : t("notifications.title")}
        {inbox.unreadCount > 0 ? (
          <span
            className={`flex min-w-[1.15rem] items-center justify-center rounded-full bg-soma-action px-1 text-[10px] font-semibold text-[#081018] ${
              compact ? "absolute right-0.5 top-0.5 h-4" : "ml-auto h-5"
            }`}
            aria-label={badgeLabel}
          >
            {inbox.unreadCount > 99 ? "99+" : inbox.unreadCount}
          </span>
        ) : (
          <span className="sr-only">{badgeLabel}</span>
        )}
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label={t("notifications.title")}
          tabIndex={-1}
          className={`absolute z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-soma-line bg-soma-raised shadow-lg outline-none ${
            compact
              ? "right-0 top-full mt-2"
              : placement === "up"
                ? "left-0 bottom-full mb-2"
                : "left-0 top-full mt-2"
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-soma-line px-3 py-2">
            <p className="text-sm font-semibold text-soma-ink">
              {t("notifications.title")}
            </p>
            {inbox.unreadCount > 0 ? (
              <button
                type="button"
                className={`${previewFocus} text-xs text-soma-action hover:text-soma-action-hover`}
                onClick={() => {
                  void inbox.markAllUnread();
                }}
              >
                {t("notifications.markRead")}
              </button>
            ) : null}
          </div>

          {digestForOpen ? (
            <p
              role="status"
              className="border-b border-soma-line px-3 py-2 text-xs text-soma-ink-secondary"
            >
              {t("notifications.initialSummary", { count: inbox.digestCount })}
            </p>
          ) : null}

          {inbox.readError ? (
            <p role="alert" className="px-3 py-2 text-xs text-red-300">
              {t("notifications.readError")}
            </p>
          ) : null}

          {inbox.items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-soma-ink-muted">
              {t("notifications.empty")}
            </p>
          ) : (
            <ul className="max-h-[min(50vh,20rem)] overflow-y-auto py-1">
              {inbox.items.map((item) => (
                <InboxRow
                  key={item.id}
                  item={item}
                  locale={i18n.language}
                  onMark={() => {
                    if (item.unread) void inbox.markRead([item.id]);
                  }}
                />
              ))}
            </ul>
          )}

          <Link
            to="/app/achievements"
            className={`${previewFocus} block border-t border-soma-line px-3 py-2 text-sm text-soma-action hover:bg-soma-surface`}
            onClick={() => setOpen(false)}
          >
            {t("notifications.viewAll")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function InboxRow({
  item,
  locale,
  onMark,
}: {
  item: AchievementInboxItem;
  locale: string;
  onMark: () => void;
}) {
  const { t } = useTranslation(["common", "achievements"]);
  const achievement = item.achievement;
  const title = t(`achievements:${achievement.titleKey}`);
  const unlocked = formatDisplayDate(achievement.unlockedAt, locale);

  return (
    <li>
      <button
        type="button"
        className={`${previewFocus} flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-soma-surface ${
          item.unread ? "bg-soma-surface/60" : ""
        }`}
        onClick={onMark}
        aria-label={
          item.unread
            ? `${title}. ${t("notifications.unread")}`
            : `${title}. ${t("notifications.read")}`
        }
      >
        <span className="w-10 shrink-0">
          <AchievementMedal
            substanceId={achievement.triggerSubstanceId}
            tier={achievement.tier}
            locked={false}
            size="card"
            showTierLabel={false}
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-soma-ink">
              {title}
            </span>
            {item.unread ? (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-soma-action"
                aria-hidden="true"
              />
            ) : null}
          </span>
          {unlocked ? (
            <span className="mt-0.5 block text-xs text-soma-ink-muted">
              {unlocked}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}
