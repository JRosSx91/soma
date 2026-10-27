import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ChevronRight } from "lucide-react";
import type { TemporalMilestoneState } from "@soma/shared-types";
import { previewFocus } from "../focus.js";
import {
  remainingProgressPercent,
  remainingTimeParts,
  temporalBarFill,
} from "../dashboard/temporal-remaining.js";
import { AchievementMedal } from "./AchievementMedal.js";

const textLink = `${previewFocus} inline-flex min-h-10 items-center gap-1 text-sm text-soma-shell-accent hover:text-soma-action`;

export function formatRemainingLabel(remainingMs: number, t: TFunction): string {
  const parts = remainingTimeParts(remainingMs);
  if (parts.kind === "lt_minute") return t("recovery:remainingLessThanMinute");
  if (parts.kind === "minutes") {
    return t("recovery:remainingMinutes", { count: parts.minutes });
  }
  if (parts.kind === "hours") {
    return t("recovery:remainingHoursMinutes", {
      hours: parts.hours,
      minutes: parts.minutes,
    });
  }
  return t("recovery:remainingDaysHours", { days: parts.days, hours: parts.hours });
}

export function NextTemporalMedalCard({
  featured,
  substanceName,
  achievementsTo,
}: {
  featured: TemporalMilestoneState;
  substanceName: string;
  achievementsTo: string;
}) {
  const { t } = useTranslation(["recovery", "achievements"]);
  const next = featured.next;
  if (!next) return null;
  const percent = remainingProgressPercent(next.progress);
  const fill = temporalBarFill(percent);
  const elapsed =
    featured.daysAbstinent == null ? null : Math.max(0, Math.floor(featured.daysAbstinent));

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="w-16 shrink-0">
          <AchievementMedal
            substanceId={featured.substanceId}
            tier={next.tier}
            family="temporal"
            locked
            size="compact"
            showTierLabel={false}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-soma-ink">{substanceName}</p>
          <p className="mt-1 text-sm font-semibold leading-snug text-soma-shell-accent">
            {t("recovery:homeNextMedalLead", {
              remaining: formatRemainingLabel(next.remainingMs, t),
            })}
          </p>
          <p className="mt-1 text-sm text-soma-ink">{t(`achievements:${next.titleKey}`)}</p>
        </div>
      </div>
      {fill ? (
      <span className="relative mt-3 block h-2 overflow-hidden rounded-full bg-soma-line" aria-hidden="true">
        <span
          data-temporal-progress={fill}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: fill, backgroundColor: "rgb(var(--soma-shell-accent))" }}
        />
      </span>
      ) : null}
      <p className="mt-2 text-xs tabular-nums text-soma-ink-secondary">
        {elapsed != null
          ? t("recovery:homeNextMedalDays", { current: elapsed, target: next.thresholdDays })
          : t("recovery:homeNextMedalThreshold", { count: next.thresholdDays })}
      </p>
      <p className="text-[11px] leading-relaxed text-soma-ink-muted">
        {t("recovery:homeNextMedalHint")}
      </p>
      </div>
      <Link to={achievementsTo} className={`${textLink} mt-3`}>
        {t("recovery:homeNextMedalSee")}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export function SubstanceTemporalMilestone({
  state,
  title,
}: {
  state: TemporalMilestoneState | undefined;
  title?: string;
}) {
  const { t } = useTranslation(["recovery", "achievements"]);
  if (!state) return null;
  if (state.status === "complete") {
    return (
      <span className="mt-2 block text-xs leading-snug text-soma-ink-muted">
        {t("recovery:recoveryNextMedalComplete")}
      </span>
    );
  }
  if (state.status !== "upcoming" || !state.next) return null;
  const percent = remainingProgressPercent(state.next.progress);
  const medalTitle = title ?? t(`achievements:${state.next.titleKey}`);

  return (
    <span className="mt-2 block min-w-0">
      <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-soma-action">
        {t("recovery:recoveryNextMedal")}
      </span>
      <span className="mt-0.5 block truncate text-xs font-medium text-soma-ink">{medalTitle}</span>
      <span className="mt-0.5 block text-xs tabular-nums text-soma-ink-secondary">
        {t("recovery:homeNextMedalThreshold", { count: state.next.thresholdDays })}
        {" · "}
        {formatRemainingLabel(state.next.remainingMs, t)}
        {" · "}
        {t("recovery:homeNextMedalProgress", { percent })}
      </span>
      <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-soma-line" aria-hidden="true">
        <span
          className="block h-full rounded-full bg-soma-action"
          style={{ width: `${percent}%` }}
        />
      </span>
    </span>
  );
}
