import { useTranslation } from "react-i18next";
import { AchievementMedal } from "../../recovery-dashboard/components/AchievementMedal.js";
import type { AchievementWithUnlockState } from "../types.js";

interface TrophyToastProps {
  achievement: AchievementWithUnlockState;
  onDismiss: () => void;
}

export function TrophyToast({ achievement, onDismiss }: TrophyToastProps) {
  const { t } = useTranslation(["achievements", "main", "substances"]);

  const title = t(`achievements:${achievement.titleKey}`);
  const description = t(`achievements:${achievement.descriptionKey}`);
  const substanceName = t(`substances:${achievement.triggerSubstanceId}.name`, {
    defaultValue: achievement.triggerSubstanceId,
  });

  return (
    <div
      className="relative flex w-full max-w-sm items-start gap-3 rounded-2xl border border-soma-line bg-soma-surface p-3 pl-4 shadow-[0_12px_32px_rgba(8,16,24,0.35)]"
      role="status"
      aria-live="polite"
    >
      <span className="w-16 shrink-0 sm:w-[4.5rem]">
        <AchievementMedal
          substanceId={achievement.triggerSubstanceId}
          tier={achievement.tier}
          locked={false}
          size="card"
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-soma-action">
          {t("main:trophies.toastEyebrow")}
        </p>
        <p className="mt-0.5 text-sm font-semibold leading-snug text-soma-ink line-clamp-1">
          {title}
        </p>
        <p className="mt-0.5 text-xs text-soma-ink-secondary">{substanceName}</p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-soma-ink-muted">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 px-1 text-lg leading-none text-soma-ink-muted transition-colors hover:text-soma-ink"
        aria-label={t("main:trophies.toastDismiss")}
      >
        ×
      </button>
    </div>
  );
}
