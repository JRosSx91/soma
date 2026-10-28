import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Award, Calendar, ChevronRight, Clock, Compass } from "lucide-react";
import type { TemporalMilestoneState } from "@soma/shared-types";
import type { DemoSubstance } from "../demo-data.js";
import { previewFocus } from "../focus.js";
import {
  remainingProgressPercent,
  temporalBarFill,
} from "../dashboard/temporal-remaining.js";
import { temporalRailReachedCount, buildTemporalRail } from "../dashboard/temporal-rail.js";
import { formatRemainingLabel } from "./NextTemporalMedalCard.js";
import { AchievementMedal } from "./AchievementMedal.js";
import { SubstanceIllustration } from "./SubstanceIllustration.js";

const accentFill = { backgroundColor: "rgb(var(--soma-shell-accent))" };
const accentColor = { color: "rgb(var(--soma-shell-accent))" };

interface RecoveryFocusPanelProps {
  substance: DemoSubstance;
  temporal: TemporalMilestoneState | undefined;
  persistedIds?: ReadonlySet<string>;
  live: boolean;
  children?: ReactNode;
}

export function RecoveryFocusPanel({
  substance,
  temporal,
  persistedIds,
  live,
  children,
}: RecoveryFocusPanelProps) {
  const { t } = useTranslation(["recovery", "achievements"]);
  const next = temporal?.status === "upcoming" ? temporal.next : null;
  const fill = next ? temporalBarFill(remainingProgressPercent(next.progress)) : null;
  const nodes = buildTemporalRail(temporal, persistedIds);
  const reached = temporalRailReachedCount(nodes);
  const elapsed =
    temporal?.daysAbstinent == null ? null : Math.max(0, Math.floor(temporal.daysAbstinent));

  return (
    <section className="rounded-2xl border border-soma-line-strong bg-soma-surface/80 p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.7fr)] lg:items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-soma-line-strong bg-soma-canvas">
              <SubstanceIllustration name={substance.id} iconClassName="h-9 w-9" />
            </span>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-soma-ink">{substance.name}</p>
              <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-soma-ink sm:text-3xl">
                {substance.abstinence}
              </p>
            </div>
          </div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-soma-ink-secondary">
            {t("recoveryFocusIntro")}
          </p>
        </div>

        <div className="min-w-0">
          {live ? (
            <div className="mb-2 flex justify-end">
              <Link
                to="/onboarding"
                className={`${previewFocus} inline-flex min-h-9 items-center gap-2 text-sm text-soma-ink-secondary hover:text-soma-ink`}
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {t("recoveryEditLastUse")}
                <ChevronRight className="h-4 w-4 lg:hidden" aria-hidden="true" />
              </Link>
            </div>
          ) : null}
          <div className="grid items-stretch gap-3 sm:grid-cols-2">
            <div className="flex h-full flex-col rounded-2xl border border-soma-line bg-soma-canvas/40 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em]" style={accentColor}>
                {t("homeNextMilestone")}
              </p>
              {next ? (
                <div className="mt-3 flex items-center gap-3">
                  <span className="w-14 shrink-0">
                    <AchievementMedal
                      substanceId={substance.id}
                      tier={next.tier}
                      family="temporal"
                      locked
                      size="compact"
                      showTierLabel={false}
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="text-2xl font-semibold tabular-nums text-soma-ink">
                      {t("homeNextMedalThreshold", { count: next.thresholdDays })}
                    </p>
                    <p className="mt-0.5 text-sm text-soma-ink">{t(`achievements:${next.titleKey}`)}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-soma-ink-secondary">{t("recoveryNextMedalComplete")}</p>
              )}
              {fill ? (
                <span className="relative mt-4 block h-2 overflow-hidden rounded-full bg-soma-line" aria-hidden="true">
                  <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: fill, ...accentFill }} />
                </span>
              ) : null}
              {next ? (
                <p className="mt-2 text-xs tabular-nums text-soma-ink-muted">
                  {elapsed != null
                    ? t("recoveryNextMilestoneDays", { current: elapsed, target: next.thresholdDays })
                    : formatRemainingLabel(next.remainingMs, t)}
                </p>
              ) : null}
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-soma-line bg-soma-canvas/40 p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em]" style={accentColor}>
                {t("recoveryProgressTitle")}
              </p>
              <ul className="mt-3">
              <li className="flex items-start gap-3">
                <Award className="mt-0.5 h-5 w-5 shrink-0 text-soma-reward" aria-hidden="true" />
                <span>
                  <span className="block text-[11px] text-soma-ink-muted">{t("recoveryProgressMedals")}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-soma-ink">
                    {t("recoveryProgressMedalsValue", { count: reached })}
                  </span>
                </span>
              </li>
              <li className="mt-3 flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-soma-reward" aria-hidden="true" />
                <span>
                  <span className="block text-[11px] text-soma-ink-muted">{t("recoveryProgressTime")}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-soma-ink">
                    {substance.abstinence}
                  </span>
                </span>
              </li>
              <li className="mt-3 flex items-start gap-3">
                <Compass className="mt-0.5 h-5 w-5 shrink-0 text-soma-reward" aria-hidden="true" />
                <span>
                  <span className="block text-[11px] text-soma-ink-muted">{t("recoveryProgressNext")}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-soma-ink">
                    {next
                      ? t("homeNextMedalThreshold", { count: next.thresholdDays })
                      : t("homeExplorerNextNone")}
                  </span>
                </span>
              </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}
