import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ChevronRight } from "lucide-react";
import type { TemporalMilestoneState } from "@soma/shared-types";
import { previewFocus } from "../focus.js";
import {
  remainingProgressPercent,
  remainingTimeParts,
} from "../dashboard/temporal-remaining.js";
import { AchievementMedal } from "./AchievementMedal.js";

const textLink = `${previewFocus} inline-flex min-h-11 items-center gap-1 text-sm text-soma-action hover:text-soma-action-hover`;

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

  return (
    <section className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-5 sm:px-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-soma-action">
        {t("recovery:homeNextMedal")}
      </p>
      <div className="mt-3 flex min-w-0 items-center gap-4">
        <span className="w-20 shrink-0 sm:w-24">
          <AchievementMedal
            substanceId={featured.substanceId}
            tier={next.tier}
            family="temporal"
            locked
            showTierLabel={false}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-soma-ink">
            {t(`achievements:${next.titleKey}`)}
          </p>
          <p className="mt-0.5 text-xs text-soma-ink-secondary">{substanceName}</p>
          <p className="mt-1 text-xs text-soma-ink-muted">
            {t("recovery:homeNextMedalThreshold", { count: next.thresholdDays })}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm tabular-nums text-soma-ink">
        {formatRemainingLabel(next.remainingMs, t)}
        <span className="text-soma-ink-secondary">
          {" · "}
          {t("recovery:homeNextMedalProgress", { percent })}
        </span>
      </p>
      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-soma-line" aria-hidden="true">
        <span
          className="block h-full rounded-full bg-soma-action"
          style={{ width: `${percent}%` }}
        />
      </span>
      <p className="mt-2 text-xs leading-relaxed text-soma-ink-muted">
        {t("recovery:homeNextMedalHint")}
      </p>
      <Link to={achievementsTo} className={`${textLink} mt-3`}>
        {t("recovery:homeNextMedalSee")}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
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
