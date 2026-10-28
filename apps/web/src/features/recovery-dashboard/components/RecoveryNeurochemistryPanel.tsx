import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TemporalMilestoneState } from "@soma/shared-types";
import type { DemoSubstance } from "../demo-data.js";
import { previewFocus } from "../focus.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import {
  educationalNtInputFromRecovery,
  presentEducationalNtRecovery,
  type EducationalNtRecoveryRow,
  type EducationalNtRecoveryView,
} from "../anatomy/educational-nt-recovery.js";
import { educationalNtSeverities } from "../anatomy/educational-nt-qualitative-catalog.js";
import { signalingMarkClassName } from "../anatomy/signaling-presentation.js";
import { exploreEduHref } from "../explore/explore-edu-query.js";
import {
  isPublishedExploreEduSheet,
  type ExploreEduSheetId,
} from "../explore/explore-edu.js";

interface RecoveryNeurochemistryPanelProps {
  substance: DemoSubstance;
  temporal: TemporalMilestoneState | undefined;
}

function confidenceKey(level: EducationalNtRecoveryRow["confidence"]): string {
  if (level === "high") return "confidenceHigh";
  if (level === "medium") return "confidenceMedium";
  return "confidenceLow";
}

function exploreHrefFor(base: "/app" | "/preview", neurotransmitter: string): string | null {
  if (!isPublishedExploreEduSheet(neurotransmitter)) return null;
  return exploreEduHref(base, neurotransmitter as ExploreEduSheetId);
}

function SeveritySegments({
  severity,
}: {
  severity: EducationalNtRecoveryRow["severity"];
}) {
  const { t } = useTranslation("recovery");
  return (
    <ul
      className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4"
      aria-label={t("recoveryNtSeverityLegend")}
    >
      {educationalNtSeverities.map((level) => {
        const current = level === severity;
        return (
          <li key={level}>
            <span
              className={`block rounded-lg border px-2 py-1.5 text-center text-[11px] leading-snug ${
                current
                  ? "border-soma-action bg-soma-action/15 font-medium text-soma-ink"
                  : "border-soma-line bg-soma-canvas/40 text-soma-ink-muted"
              }`}
              aria-current={current ? "true" : undefined}
            >
              {t(`recoveryNtSeverity.${level}`)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function statusCopy(
  view: EducationalNtRecoveryView,
  translate: (key: string) => string,
): string | null {
  if (view.clockStatus === "missing_date") return translate("recoveryNtMissingDate");
  if (view.clockStatus === "day_zero") return translate("recoveryNtDayZero");
  if (view.clockStatus === "active") return translate("recoveryNtActive");
  return null;
}

export function RecoveryNeurochemistryPanel({
  substance,
  temporal,
}: RecoveryNeurochemistryPanelProps) {
  const { t } = useTranslation(["recovery", "neurotransmitters", "mechanisms", "explore"]);
  const base = useShellBase();
  const view = presentEducationalNtRecovery(
    educationalNtInputFromRecovery(substance, temporal),
  );
  const emptyHint = statusCopy(view, (key) => t(key));
  const daysLabel =
    view.daysUsed == null
      ? null
      : view.daysUsed === 1
        ? t("dayOne")
        : t("daysMany", { count: view.daysUsed });

  return (
    <section
      className="rounded-2xl border border-soma-line-strong bg-soma-surface/80 p-4 sm:p-5"
      aria-labelledby="recovery-nt-title"
      aria-describedby="recovery-nt-warning"
    >
      <h2 id="recovery-nt-title" className="text-base font-semibold text-soma-ink">
        {t("recoveryNtTitle")}
      </h2>
      <p className="mt-1 text-sm text-soma-ink-secondary">
        {t("recoveryNtSubstance", { name: substance.name })}
        {daysLabel ? ` · ${t("recoveryNtDaysUsed", { days: daysLabel })}` : null}
      </p>
      {view.educationalPhase ? (
        <p className="mt-1 text-xs text-soma-ink-muted">
          {t("recoveryNtPhaseLabel")}: {t(`explore:ntPhases.${view.educationalPhase}`)}
          {view.window ? ` · ${t(`recoveryNtWindow.${view.educationalPhase}`)}` : null}
        </p>
      ) : null}

      <p
        id="recovery-nt-warning"
        className="mt-3 rounded-xl border border-soma-line bg-soma-canvas/50 px-3 py-2 text-xs leading-relaxed text-soma-ink-secondary"
      >
        {t("recoveryNtWarning")}
      </p>

      {emptyHint ? (
        <p className="mt-3 text-sm text-soma-ink-muted">{emptyHint}</p>
      ) : null}

      {view.rows.length > 0 ? (
        <ul className="mt-3 grid gap-3">
          {view.rows.map((row) => {
            const ntName = t(`neurotransmitters:${row.neurotransmitter}.name`, {
              defaultValue: row.neurotransmitter,
            });
            const href = exploreHrefFor(base, row.neurotransmitter);
            return (
              <li
                key={`${row.substanceId}:${row.neurotransmitter}`}
                className="rounded-xl border border-soma-line bg-soma-canvas/40 p-3"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1 h-3 w-3 shrink-0 rounded-full ${signalingMarkClassName(row.neurotransmitter)}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-soma-ink">{ntName}</p>
                    <p className="mt-0.5 text-xs text-soma-ink-secondary">
                      {t("recoveryNtDirectionLabel")}: {t(`recoveryNtDirection.${row.direction}`)}
                    </p>
                    <SeveritySegments severity={row.severity} />
                    <p className="mt-2 text-xs text-soma-ink-muted">
                      {t("recoveryNtMechanismLabel")}:{" "}
                      {t(`mechanisms:${row.mechanismKey}`, { defaultValue: row.mechanismKey })}
                    </p>
                    <p className="mt-1 text-[11px] text-soma-ink-muted">
                      {t("recoveryNtConfidence", { level: t(confidenceKey(row.confidence)) })}
                    </p>
                    {href ? (
                      <Link
                        to={href}
                        className={`${previewFocus} mt-2 inline-flex min-h-9 items-center text-sm text-soma-action hover:text-soma-action-hover`}
                      >
                        {t("recoveryNtExploreLink", { name: ntName })}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
