import { Check, ChevronRight, Lock } from "lucide-react";
import { AchievementMedal } from "./AchievementMedal.js";
import { previewFocus } from "../focus.js";
import { temporalBarFill } from "../dashboard/temporal-remaining.js";
import type { AchievementViewModel, CatalogItem, StatusBucket } from "../dashboard/achievements-view.js";

interface Labels {
  unlocked: string;
  inProgress: string;
  locked: string;
  indeterminate: string;
  review: string;
  remainingDays: (count: number) => string;
  daysProgress: (current: number, target: number) => string;
  temporalRequirement: (days: number, substance: string) => string;
  curveProgress: (current: number, threshold: number) => string;
  curveRequirement: (percent: number) => string;
  substance: string;
  tier: string;
}

export function AchievementGalleryCard({
  item,
  view,
  labels,
  layout,
  onOpen,
}: {
  item: CatalogItem;
  view: AchievementViewModel;
  labels: Labels;
  layout: "featured" | "gallery";
  onOpen: (id: string) => void;
}) {
  const status = statusLabel(view, labels);
  const requirement = requirementCopy(item, view, labels);
  const fill =
    view.bucket === "in_progress" && view.temporal?.fillPercent
      ? temporalBarFill(view.temporal.fillPercent)
      : view.curveProgress
        ? `${view.curveProgress.towardPercent}%`
        : null;
  const progressCaption =
    view.temporal?.isCurrentNext && view.temporal.daysAbstinent != null
      ? labels.daysProgress(view.temporal.daysAbstinent, view.temporal.thresholdDays)
      : view.curveProgress
        ? labels.curveProgress(view.curveProgress.currentPercent, view.curveProgress.thresholdPercent)
        : view.temporal?.remainingDays != null
          ? labels.remainingDays(view.temporal.remainingDays)
          : null;

  const medal = (
    <AchievementMedal
      substanceId={item.substanceId}
      tier={item.tier}
      sealed={view.sealed}
      locked={!view.unlocked}
      family={item.family === "temporal" ? "temporal" : "curve"}
      size={layout === "featured" ? "featured" : "gallery"}
      showTierLabel={false}
    />
  );

  const pill = (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${pillClass(view.bucket)}`}
    >
      {view.unlocked ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
      {view.bucket === "locked" && !view.unlocked ? (
        <Lock className="h-3 w-3" aria-hidden="true" />
      ) : null}
      {status}
    </span>
  );

  if (layout === "featured") {
    return (
      <button
        type="button"
        onClick={() => onOpen(item.id)}
        aria-label={view.sealed ? `${labels.locked}. ${labels.substance}. ${labels.tier}` : undefined}
        className={`${previewFocus} flex h-full w-full min-w-0 items-center gap-3 rounded-2xl border border-soma-line bg-soma-surface p-3 text-left`}
      >
        <span className="shrink-0">{medal}</span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            {pill}
            <ChevronRight className="h-4 w-4 shrink-0 text-soma-ink-muted" aria-hidden="true" />
          </span>
          <span className="mt-2 block line-clamp-2 text-sm font-semibold leading-snug text-soma-ink">
            {view.sealed ? "???" : item.title}
          </span>
          <span className="mt-1 block text-[11px] text-soma-ink-secondary">{requirement}</span>
          <span className="mt-2 inline-flex rounded-full bg-soma-raised px-2 py-0.5 text-[11px] text-soma-ink-secondary">
            {labels.substance}
          </span>
          {fill || progressCaption ? (
            <span className="mt-2 flex flex-col gap-1">
              {progressCaption ? (
                <span className="text-[11px] tabular-nums text-soma-ink-muted">{progressCaption}</span>
              ) : null}
              {fill ? (
                <span className="block h-1.5 overflow-hidden rounded-full bg-soma-line">
                  <span
                    className="block h-full rounded-full bg-soma-action"
                    style={{ width: fill }}
                  />
                </span>
              ) : null}
            </span>
          ) : null}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      aria-label={view.sealed ? `${labels.locked}. ${labels.substance}. ${labels.tier}` : undefined}
      className={`${previewFocus} relative flex h-full w-full min-w-0 flex-col items-start gap-1 rounded-2xl border border-soma-line bg-soma-surface px-2.5 py-2 text-left ${
        view.review ? "border-dashed border-soma-line-strong" : ""
      }`}
    >
      <ChevronRight className="absolute top-2 right-2 h-3.5 w-3.5 text-soma-ink-muted" aria-hidden="true" />
      <span className="mx-auto">{medal}</span>
      <span className="line-clamp-2 text-sm font-semibold leading-snug text-soma-ink">
        {view.sealed ? "???" : item.title}
      </span>
      <span className="text-[11px] leading-snug text-soma-ink-secondary">{requirement}</span>
      <span className="inline-flex rounded-full bg-soma-raised px-2 py-0.5 text-[11px] text-soma-ink-secondary">
        {labels.substance}
      </span>
      <span className="mt-auto flex w-full flex-col gap-1 pt-1.5">
        {view.bucket !== "in_progress" ? <span className="self-start">{pill}</span> : null}
        {progressCaption && view.bucket !== "in_progress" ? (
          <span className="text-[11px] tabular-nums text-soma-ink-muted">{progressCaption}</span>
        ) : null}
        {view.bucket === "in_progress" ? (
          <>
            {progressCaption ? (
              <span className="text-[11px] tabular-nums text-soma-ink-muted">{progressCaption}</span>
            ) : null}
            {fill ? (
              <span className="block h-1.5 overflow-hidden rounded-full bg-soma-line">
                <span className="block h-full rounded-full bg-soma-action" style={{ width: fill }} />
              </span>
            ) : (
              <span className="self-start">{pill}</span>
            )}
          </>
        ) : null}
      </span>
    </button>
  );
}

function statusLabel(view: AchievementViewModel, labels: Labels): string {
  if (view.review) return labels.review;
  if (view.bucket === "unlocked") return labels.unlocked;
  if (view.bucket === "in_progress") return labels.inProgress;
  if (view.bucket === "indeterminate") return labels.indeterminate;
  return labels.locked;
}

function pillClass(bucket: StatusBucket): string {
  if (bucket === "unlocked") return "bg-emerald-500/15 text-emerald-300";
  if (bucket === "in_progress") return "bg-soma-action/15 text-soma-action";
  return "bg-soma-raised text-soma-ink-muted";
}

function requirementCopy(item: CatalogItem, view: AchievementViewModel, labels: Labels): string {
  if (view.sealed) return labels.tier;
  if (item.family === "temporal" && item.abstinenceDays != null) {
    return labels.temporalRequirement(item.abstinenceDays, labels.substance);
  }
  if (item.threshold != null) {
    return labels.curveRequirement(Math.round(item.threshold * 100));
  }
  return labels.tier;
}
