import type { AchievementWithUnlockState } from "../../achievements/types.js";

/**
 * Presentation helpers for the Home daily summary.
 * Do not compute recovery curves, abstinence, or unlock state.
 */

export function formatDisplayDate(iso: string | null | undefined, locale: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale.startsWith("en") ? "en" : "es", {
    dateStyle: "medium",
  }).format(date);
}

export function percentTowardThreshold(progress: number | null | undefined): number | null {
  if (typeof progress !== "number" || !Number.isFinite(progress)) return null;
  if (progress >= 1) return 100;
  return Math.max(0, Math.floor(progress * 100));
}

export interface QuantifiableAchievementProgress {
  /** Share of the catalog threshold already covered, 0–99. */
  towardPercent: number;
  /** Catalog curve-progress threshold as a percentage. */
  thresholdPercent: number;
  /** Current curve progress as a percentage. */
  currentPercent: number;
}

/**
 * Progress a locked, visible achievement can show.
 * Uses live `achievementProgress` and the catalog threshold. No remaining
 * calendar days: those are not on the live payload and the threshold is a
 * curve fraction, not a day count.
 */
export function quantifiableAchievementProgress(input: {
  unlocked: boolean;
  hidden: boolean;
  review?: boolean;
  progressAvailability?: AchievementWithUnlockState["progressAvailability"];
  achievementProgress?: number | null;
  threshold: number;
}): QuantifiableAchievementProgress | null {
  if (input.unlocked || input.hidden || input.review) return null;
  if (input.progressAvailability !== "ready") return null;
  const towardPercent = percentTowardThreshold(input.achievementProgress ?? null);
  if (towardPercent === null || towardPercent >= 100) return null;
  if (!Number.isFinite(input.threshold) || input.threshold <= 0) return null;
  const thresholdPercent = Math.max(0, Math.round(input.threshold * 100));
  const currentPercent = Math.max(
    0,
    Math.floor((input.achievementProgress ?? 0) * input.threshold * 100),
  );
  return { towardPercent, thresholdPercent, currentPercent };
}

/** Closest locked, calculable catalog achievement for tracked substances. */
export function pickNextLockedAchievement(
  rows: readonly AchievementWithUnlockState[] | null | undefined,
  trackedSubstanceIds: readonly string[],
): AchievementWithUnlockState | null {
  if (!rows || rows.length === 0 || trackedSubstanceIds.length === 0) return null;
  const tracked = new Set(trackedSubstanceIds);
  const candidates = rows.filter((row) => {
    if (row.unlocked) return false;
    if (row.hidden) return false;
    if (row.progressAvailability !== "ready") return false;
    if (!tracked.has(row.triggerSubstanceId)) return false;
    if (row.family === "temporal") return false;
    if (row.triggerRecoveryThreshold == null) return false;
    const percent = percentTowardThreshold(row.achievementProgress ?? null);
    return percent !== null && percent < 100;
  });
  candidates.sort(
    (a, b) => (b.achievementProgress ?? 0) - (a.achievementProgress ?? 0),
  );
  return candidates[0] ?? null;
}

const TIER_RANK: Record<AchievementWithUnlockState["tier"], number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
};

/** Highest unlocked tier; ties break on the most recent `unlockedAt`. */
export function pickFeaturedUnlockedAchievement(
  rows: readonly AchievementWithUnlockState[] | null | undefined,
): AchievementWithUnlockState | null {
  if (!rows || rows.length === 0) return null;
  const unlocked = rows.filter((row) => row.unlocked);
  if (unlocked.length === 0) return null;
  unlocked.sort((a, b) => {
    const tierDelta = TIER_RANK[b.tier] - TIER_RANK[a.tier];
    if (tierDelta !== 0) return tierDelta;
    const aTime = a.unlockedAt ? Date.parse(a.unlockedAt) : 0;
    const bTime = b.unlockedAt ? Date.parse(b.unlockedAt) : 0;
    return bTime - aTime;
  });
  return unlocked[0] ?? null;
}

function unlockTime(iso: string | null | undefined): number {
  if (!iso) return Number.NEGATIVE_INFINITY;
  const time = Date.parse(iso);
  return Number.isFinite(time) ? time : Number.NEGATIVE_INFINITY;
}

/**
 * Confirmed unlocks for the Home collection, newest first.
 * Does not infer medals from abstinence. Rows without `unlockedAt` sort last.
 */
export function pickRecentUnlockedAchievements(
  rows: readonly AchievementWithUnlockState[] | null | undefined,
  limit = 4,
): AchievementWithUnlockState[] {
  if (!rows || rows.length === 0 || limit <= 0) return [];
  return rows
    .filter((row) => row.unlocked)
    .slice()
    .sort((a, b) => unlockTime(b.unlockedAt) - unlockTime(a.unlockedAt))
    .slice(0, limit);
}
