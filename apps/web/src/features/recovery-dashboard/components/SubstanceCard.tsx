import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import type { TemporalMilestoneState } from "@soma/shared-types";
import type { DemoSubstance } from "../demo-data.js";
import { previewFocus } from "../focus.js";
import {
  remainingProgressPercent,
  temporalBarFill,
} from "../dashboard/temporal-remaining.js";
import { AchievementMedal } from "./AchievementMedal.js";
import { SubstanceIllustration } from "./SubstanceIllustration.js";

const accentFill = { backgroundColor: "rgb(var(--soma-shell-accent))" };
const accentColor = { color: "rgb(var(--soma-shell-accent))" };

interface SubstanceCardProps {
  substance: DemoSubstance;
  selected: boolean;
  onSelect: (id: string) => void;
  temporal?: TemporalMilestoneState;
}

/** Supporting copy for states without a day count. Dated cards omit model ceilings. */
function substanceCardSupport(substance: DemoSubstance): string | null {
  if (/\d/.test(substance.abstinence)) return null;
  const phase = substance.phase.trim();
  return phase.length > 0 ? phase : null;
}

export function SubstanceCard({
  substance,
  selected,
  onSelect,
  temporal,
}: SubstanceCardProps) {
  const { t } = useTranslation(["recovery", "achievements"]);
  const support = substanceCardSupport(substance);
  const next = temporal?.status === "upcoming" ? temporal.next : null;
  const fill = next ? temporalBarFill(remainingProgressPercent(next.progress)) : null;
  const accessibleName = support
    ? `${substance.name}. ${substance.abstinence}. ${support}`
    : `${substance.name}. ${substance.abstinence}.`;

  return (
    <button
      type="button"
      onClick={() => onSelect(substance.id)}
      aria-pressed={selected}
      aria-label={accessibleName}
      className={`${previewFocus} flex h-full w-full min-w-0 flex-col rounded-2xl border bg-soma-surface/90 px-3 py-2.5 text-left transition-colors hover:border-soma-line-strong hover:bg-soma-raised/60 ${
        selected
          ? "border-[rgb(var(--soma-shell-accent)/0.85)] shadow-[0_0_0_1px_rgb(var(--soma-shell-accent)/0.35)]"
          : "border-soma-line-strong"
      }`}
    >
      <span className="flex min-w-0 items-start gap-2">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soma-canvas text-soma-shell-accent">
          <SubstanceIllustration name={substance.id} iconClassName="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium leading-snug text-soma-ink">
            {substance.name}
          </span>
          <span className="mt-0.5 block text-3xl font-semibold tabular-nums tracking-tight text-soma-ink">
            {substance.abstinence}
          </span>
        </span>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-soma-ink-muted" aria-hidden="true" />
      </span>
      {support ? (
        <span className="mt-1.5 text-xs leading-snug text-soma-ink-muted">{support}</span>
      ) : null}
      {fill ? (
        <span className="relative mt-2 block h-1.5 overflow-hidden rounded-full bg-soma-line" aria-hidden="true">
          <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: fill, ...accentFill }} />
        </span>
      ) : null}
      {next ? (
        <span className="mt-2 flex min-w-0 items-center gap-2">
          <span className="w-11 shrink-0">
            <AchievementMedal
              substanceId={substance.id}
              tier={next.tier}
              family="temporal"
              locked
              size="compact"
              showTierLabel={false}
            />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-medium uppercase tracking-[0.14em]" style={accentColor}>
              {t("homeNextMilestone")}
            </span>
            <span className="mt-0.5 block text-sm font-semibold tabular-nums text-soma-ink">
              {t("homeNextMedalThreshold", { count: next.thresholdDays })}
            </span>
            <span className="mt-0.5 block truncate text-xs text-soma-ink-secondary">
              {t(`achievements:${next.titleKey}`)}
            </span>
          </span>
        </span>
      ) : temporal?.status === "complete" ? (
        <span className="mt-2 text-xs leading-snug text-soma-ink-muted">
          {t("recoveryNextMedalComplete")}
        </span>
      ) : null}
    </button>
  );
}
