import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TemporalMilestoneState } from "@soma/shared-types";
import { previewFocus } from "../focus.js";
import {
  buildTemporalRail,
  temporalRailProgressRatio,
  type TemporalRailMark,
  type TemporalRailNode,
} from "../dashboard/temporal-rail.js";
import { AchievementMedal } from "./AchievementMedal.js";

interface TemporalThresholdRailProps {
  substanceId: string;
  temporal: TemporalMilestoneState | undefined;
  persistedIds?: ReadonlySet<string>;
  /** Drop the outer card chrome when the rail already lives inside RecoveryFocusPanel. */
  embedded?: boolean;
  highlighted?: boolean;
}

function thresholdLabel(days: number, t: (key: string, opts?: Record<string, unknown>) => string) {
  if (days === 1) return t("recoveryThresholdHours", { count: 24 });
  if (days === 3) return t("recoveryThresholdHours", { count: 72 });
  return t("homeNextMedalThreshold", { count: days });
}

function markLabel(mark: TemporalRailMark, t: (key: string) => string) {
  if (mark === "complete") return t("recoveryRailComplete");
  if (mark === "current") return t("recoveryRailCurrent");
  if (mark === "upcoming") return t("recoveryRailUpcoming");
  return t("recoveryRailUnavailable");
}

function Node({
  node,
  substanceId,
}: {
  node: TemporalRailNode;
  substanceId: string;
}) {
  const { t } = useTranslation(["recovery", "achievements"]);
  const complete = node.mark === "complete";
  const current = node.mark === "current";
  const muted = node.mark === "upcoming" || node.mark === "unavailable";
  return (
    <li
      className={`relative z-10 flex w-[6.75rem] shrink-0 flex-col items-center px-1 ${
        muted ? "opacity-50" : ""
      }`}
    >
      <span
        className={`relative flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full ${
          current
            ? "shadow-[0_0_0_2px_rgb(var(--soma-shell-accent)),0_0_18px_rgb(var(--soma-shell-accent)/0.45)]"
            : complete
              ? "shadow-[0_0_0_1px_rgb(var(--soma-line-strong))]"
              : "grayscale-[0.35]"
        }`}
      >
        <AchievementMedal
          substanceId={substanceId}
          tier={node.tier}
          family={complete || current ? "temporal" : "curve"}
          locked={!complete}
          size="compact"
          showTierLabel={false}
        />
      </span>
      <p
        className={`mt-2 text-center text-[11px] font-semibold tabular-nums ${
          current ? "text-soma-shell-accent" : muted ? "text-soma-ink-muted" : "text-soma-ink"
        }`}
      >
        {thresholdLabel(node.thresholdDays, t)}
      </p>
      <p className="mt-1 line-clamp-2 min-h-8 text-center text-[10px] leading-snug text-soma-ink-secondary">
        {t(`achievements:${node.titleKey}`)}
      </p>
      <span className="sr-only">
        {markLabel(node.mark, t)}
        {node.persistedUnlock ? `. ${t("recoveryRailPersisted")}` : ""}
        {node.clockReached && !node.persistedUnlock ? `. ${t("recoveryRailClockOnly")}` : ""}
      </span>
    </li>
  );
}

export function TemporalThresholdRail({
  substanceId,
  temporal,
  persistedIds,
  embedded = false,
  highlighted = false,
}: TemporalThresholdRailProps) {
  const { t } = useTranslation("recovery");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const nodes = buildTemporalRail(temporal, persistedIds);
  const fillRatio = temporalRailProgressRatio(temporal?.daysAbstinent);

  const scrollBy = (direction: -1 | 1) => {
    const node = scrollerRef.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollBy({ left: direction * 220, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section
      id="recovery-temporal-rail"
      tabIndex={-1}
      className={
        embedded
          ? `mt-5 border-t border-soma-line pt-4 outline-none ${
              highlighted ? "rounded-xl ring-1 ring-[rgb(var(--soma-shell-accent)/0.4)] ring-offset-2 ring-offset-transparent px-2 pb-2" : ""
            }`
          : "rounded-2xl border border-soma-line-strong bg-soma-surface/80 px-3 py-4 sm:px-5"
      }
    >
      <h2 className="text-base font-semibold text-soma-ink">{t("recoveryTimelineTitle")}</h2>
      <p className="mt-1 text-xs text-soma-ink-muted">{t("recoveryTimelineHint")}</p>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          className={`${previewFocus} hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-soma-line text-soma-ink-muted hover:bg-soma-raised sm:flex`}
          aria-label={t("recoveryTimelinePrev")}
          onClick={() => scrollBy(-1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div
          ref={scrollerRef}
          tabIndex={0}
          role="list"
          aria-label={t("recoveryTimelineTitle")}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              scrollBy(1);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              scrollBy(-1);
            }
          }}
          className="min-w-0 flex-1 overflow-x-auto pb-2 [scrollbar-width:thin]"
        >
          <ol className="relative flex w-max min-w-full items-start justify-between pt-3">
            <span
              aria-hidden="true"
              className="absolute top-[2.35rem] h-0.5 overflow-hidden rounded-full bg-soma-line"
              style={{ left: "3.375rem", right: "3.375rem" }}
            >
              <span
                data-rail-progress={fillRatio.toFixed(4)}
                className="block h-full rounded-full"
                style={{
                  width: `${fillRatio * 100}%`,
                  backgroundColor: "rgb(var(--soma-shell-accent))",
                }}
              />
            </span>
            {nodes.map((node) => (
              <Node key={node.achievementId} node={node} substanceId={substanceId} />
            ))}
          </ol>
        </div>
        <button
          type="button"
          className={`${previewFocus} hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-soma-line text-soma-ink-muted hover:bg-soma-raised sm:flex`}
          aria-label={t("recoveryTimelineNext")}
          onClick={() => scrollBy(1)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
