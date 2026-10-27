import type { TemporalMilestoneState } from "@soma/shared-types";
import { remainingProgressPercent } from "./temporal-remaining.js";
import { quantifiableAchievementProgress } from "./home-progress.js";
import type { AchievementWithUnlockState } from "../../achievements/types.js";
import type { MedalTier } from "../components/MedalMark.js";
import type { achievementCatalog } from "../achievement-catalog.generated.js";

export type CatalogItem = (typeof achievementCatalog)[number];
export type LiveRow = AchievementWithUnlockState;
export type FamilyFilter = "all" | "temporal" | "curve";
export type SubstanceFilter = "all" | CatalogItem["substanceId"];
export type TierFilter = "all" | MedalTier;
export type StatusFilter = "all" | "unlocked" | "in_progress" | "locked" | "indeterminate";
export type SortMode = "catalog" | "recent";
export type StatusBucket = Exclude<StatusFilter, "all">;

export interface CatalogFamilyCounts {
  total: number;
  curve: number;
  temporal: number;
}

export interface TemporalCardProgress {
  thresholdDays: number;
  daysAbstinent: number | null;
  isCurrentNext: boolean;
  remainingDays: number | null;
  fillPercent: number | null;
  clockPassed: boolean;
}

export interface AchievementViewModel {
  sealed: boolean;
  unlocked: boolean;
  review: boolean;
  bucket: StatusBucket;
  curveProgress: ReturnType<typeof quantifiableAchievementProgress>;
  temporal: TemporalCardProgress | null;
  unlockedAt: string | null;
  gap: LiveGap | null;
}

export type LiveGap =
  | "missing_row"
  | "not_tracked"
  | "active_use"
  | "missing_date"
  | "insufficient";

export function catalogFamilyCounts(
  catalog: readonly CatalogItem[],
): CatalogFamilyCounts {
  let curve = 0;
  let temporal = 0;
  for (const item of catalog) {
    if (item.family === "temporal") temporal += 1;
    else curve += 1;
  }
  return { total: catalog.length, curve, temporal };
}

export function isSealedAchievement(
  item: Pick<CatalogItem, "hidden" | "tier">,
  unlocked: boolean,
): boolean {
  if (!item.hidden || unlocked) return false;
  return item.tier !== "platinum";
}

export function temporalProgressForItem(
  item: CatalogItem,
  state: TemporalMilestoneState | null | undefined,
): TemporalCardProgress | null {
  if (item.family !== "temporal" || item.abstinenceDays == null) return null;
  const thresholdDays = item.abstinenceDays;
  if (!state) {
    return {
      thresholdDays,
      daysAbstinent: null,
      isCurrentNext: false,
      remainingDays: null,
      fillPercent: null,
      clockPassed: false,
    };
  }
  if (
    state.status === "active_use" ||
    state.status === "missing_date" ||
    state.status === "invalid_date" ||
    state.daysAbstinent == null
  ) {
    return {
      thresholdDays,
      daysAbstinent: null,
      isCurrentNext: false,
      remainingDays: null,
      fillPercent: null,
      clockPassed: false,
    };
  }

  const daysAbstinent = Math.max(0, Math.floor(state.daysAbstinent));
  const isCurrentNext = state.next?.achievementId === item.id;
  const clockPassed = daysAbstinent >= thresholdDays;
  const remainingDays = clockPassed ? 0 : thresholdDays - daysAbstinent;
  const fillPercent = isCurrentNext
    ? remainingProgressPercent(state.next?.progress ?? 0)
    : null;

  return {
    thresholdDays,
    daysAbstinent,
    isCurrentNext,
    remainingDays: clockPassed ? null : remainingDays,
    fillPercent: fillPercent && fillPercent > 0 ? fillPercent : null,
    clockPassed,
  };
}

export function liveGapFor(
  item: CatalogItem,
  live: LiveRow | null | undefined,
): LiveGap | null {
  if (item.family === "temporal") return null;
  if (live === undefined) return null;
  if (live === null) return "missing_row";
  if (live.progressAvailability === "ready") return null;
  if (live.progressAvailability === "not_tracked") return "not_tracked";
  if (live.progressAvailability === "active_use") return "active_use";
  if (live.progressAvailability === "missing_date") return "missing_date";
  if (live.progressAvailability === "pending_review") return null;
  return "insufficient";
}

export function describeAchievement(
  item: CatalogItem,
  live: LiveRow | null | undefined,
  temporal: TemporalMilestoneState | null | undefined,
): AchievementViewModel {
  const unlocked = Boolean(live?.unlocked);
  const sealed = isSealedAchievement(item, unlocked);
  const review =
    !unlocked && (item.ruleReview || live?.progressAvailability === "pending_review");
  const curveProgress =
    item.family === "temporal" || sealed
      ? null
      : quantifiableAchievementProgress({
          unlocked,
          hidden: sealed,
          review,
          progressAvailability: live?.progressAvailability,
          achievementProgress: live?.achievementProgress,
          threshold: item.threshold ?? 0,
        });
  const temporalView = temporalProgressForItem(item, temporal);
  const gap = sealed || review || unlocked ? null : liveGapFor(item, live);

  let bucket: StatusBucket;
  if (unlocked) bucket = "unlocked";
  else if (review || gap !== null) bucket = "indeterminate";
  else if (item.family === "temporal") {
    if (!temporal || temporal.daysAbstinent == null) bucket = "indeterminate";
    else if (temporalView?.isCurrentNext) bucket = "in_progress";
    else bucket = "locked";
  } else if (curveProgress) bucket = "in_progress";
  else bucket = "locked";

  return {
    sealed,
    unlocked,
    review,
    bucket,
    curveProgress,
    temporal: temporalView,
    unlockedAt: unlocked ? (live?.unlockedAt ?? null) : null,
    gap,
  };
}

export function matchesSearch(input: {
  query: string;
  title: string;
  description: string;
  sealed: boolean;
  substanceLabel: string;
  substanceId: string;
}): boolean {
  const needle = input.query.trim().toLowerCase();
  if (!needle) return true;
  if (input.substanceLabel.toLowerCase().includes(needle)) return true;
  if (input.substanceId.toLowerCase().includes(needle)) return true;
  if (input.sealed) return false;
  if (input.title.toLowerCase().includes(needle)) return true;
  return input.description.toLowerCase().includes(needle);
}

export function filterCatalog(input: {
  catalog: readonly CatalogItem[];
  liveById: ReadonlyMap<string, LiveRow>;
  temporalBySubstance: ReadonlyMap<string, TemporalMilestoneState>;
  showingLive: boolean;
  family: FamilyFilter;
  substance: SubstanceFilter;
  tier: TierFilter;
  status: StatusFilter;
  query: string;
  titleFor: (item: CatalogItem) => string;
  descriptionFor?: (item: CatalogItem) => string;
  substanceFor?: (item: CatalogItem) => string;
}): CatalogItem[] {
  return input.catalog.filter((item) => {
    if (input.family !== "all" && item.family !== input.family) return false;
    if (input.substance !== "all" && item.substanceId !== input.substance) return false;
    if (input.tier !== "all" && item.tier !== input.tier) return false;
    const live = input.showingLive ? (input.liveById.get(item.id) ?? null) : undefined;
    const view = describeAchievement(
      item,
      live,
      input.temporalBySubstance.get(item.substanceId) ?? null,
    );
    if (input.status !== "all" && view.bucket !== input.status) return false;
    const title = view.sealed ? "" : input.titleFor(item);
    const description = view.sealed
      ? ""
      : (input.descriptionFor?.(item) ?? item.description);
    return matchesSearch({
      query: input.query,
      title,
      description,
      sealed: view.sealed,
      substanceLabel: input.substanceFor?.(item) ?? item.substanceName,
      substanceId: item.substanceId,
    });
  });
}

function unlockTime(iso: string | null | undefined): number {
  if (!iso) return Number.NEGATIVE_INFINITY;
  const time = Date.parse(iso);
  return Number.isFinite(time) ? time : Number.NEGATIVE_INFINITY;
}

export function sortCatalog(
  items: readonly CatalogItem[],
  mode: SortMode,
  liveById: ReadonlyMap<string, LiveRow>,
): CatalogItem[] {
  if (mode !== "recent") return [...items];
  return [...items].sort((a, b) => {
    const aTime = unlockTime(liveById.get(a.id)?.unlockedAt);
    const bTime = unlockTime(liveById.get(b.id)?.unlockedAt);
    if (aTime !== bTime) return bTime - aTime;
    return 0;
  });
}

export function countProgressStats(
  catalog: readonly CatalogItem[],
  liveById: ReadonlyMap<string, LiveRow>,
  temporalBySubstance: ReadonlyMap<string, TemporalMilestoneState>,
  showingLive: boolean,
): { unlocked: number; inProgress: number } {
  let unlocked = 0;
  let inProgress = 0;
  for (const item of catalog) {
    const live = showingLive ? (liveById.get(item.id) ?? null) : undefined;
    const view = describeAchievement(
      item,
      live,
      temporalBySubstance.get(item.substanceId) ?? null,
    );
    if (view.bucket === "unlocked") unlocked += 1;
    else if (view.bucket === "in_progress") inProgress += 1;
  }
  return { unlocked, inProgress };
}

export function catalogSharePercent(part: number, total: number): number {
  if (!Number.isFinite(part) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
}

/**
 * Up to four highlight ids: recent unlocks, next temporal, nearest curve,
 * then other upcoming temporals. Never pads with unrelated catalog rows.
 */
export function pickAchievementHighlights(input: {
  catalogIds: ReadonlySet<string>;
  recentUnlockedIds: readonly string[];
  temporalStates: readonly TemporalMilestoneState[];
  nextCurveId: string | null;
  limit?: number;
}): string[] {
  const limit = input.limit ?? 4;
  const seen = new Set<string>();
  const ids: string[] = [];

  function push(id: string | null | undefined) {
    if (!id || seen.has(id) || !input.catalogIds.has(id) || ids.length >= limit) return;
    seen.add(id);
    ids.push(id);
  }

  for (const id of input.recentUnlockedIds) push(id);
  const upcoming = input.temporalStates
    .filter((state) => state.status === "upcoming" && state.next)
    .slice()
    .sort((a, b) => (a.next?.remainingMs ?? 0) - (b.next?.remainingMs ?? 0));
  if (upcoming[0]?.next) push(upcoming[0].next.achievementId);
  push(input.nextCurveId);
  for (const state of upcoming) push(state.next?.achievementId);
  return ids;
}

export function platinumIdsOf(
  catalog: readonly CatalogItem[],
): string[] {
  return catalog.filter((item) => item.tier === "platinum").map((item) => item.id);
}
