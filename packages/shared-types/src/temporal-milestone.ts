import {
  dateAfterDays,
  daysBetween,
  type AbstinenceUsage,
} from "./recovery-math.js";

export const TEMPORAL_THRESHOLDS = [1, 3, 7, 14, 21, 30, 60, 90, 180, 365] as const;

export const TEMPORAL_SUBSTANCES = [
  "cannabis",
  "nicotine",
  "cocaine",
  "caffeine",
  "alcohol",
] as const;

export type TemporalSubstanceId = (typeof TEMPORAL_SUBSTANCES)[number];
export type TemporalThresholdDays = (typeof TEMPORAL_THRESHOLDS)[number];

export type TemporalMilestoneStatus =
  | "upcoming"
  | "complete"
  | "active_use"
  | "missing_date"
  | "invalid_date";

export type TemporalMedalTier = "bronze" | "silver" | "gold";

export interface TemporalNextHit {
  achievementId: string;
  titleKey: string;
  thresholdDays: number;
  dueAt: Date;
  remainingMs: number;
  /** Absolute share of this medal's interval, in [0, 1). */
  progress: number;
  tier: TemporalMedalTier;
}

export interface TemporalMilestoneState {
  substanceId: string;
  status: TemporalMilestoneStatus;
  /** Elapsed 24h intervals. Null when the clock cannot run. */
  daysAbstinent: number | null;
  next: TemporalNextHit | null;
}

export function temporalAchievementId(substanceId: string, days: number): string {
  return `${substanceId}-temporal-${days}`;
}

export function temporalTitleKey(achievementId: string): string {
  return `${achievementId}.title`;
}

export function temporalTierForDays(days: number): TemporalMedalTier {
  if (days >= 60) return "gold";
  if (days >= 14) return "silver";
  return "bronze";
}

function isValidDate(value: Date | null): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function positiveThresholds(thresholds: readonly number[]): number[] {
  const unique = new Set<number>();
  for (const value of thresholds) {
    if (Number.isFinite(value) && value > 0) unique.add(value);
  }
  return [...unique].sort((a, b) => a - b);
}

/**
 * Next GAME-01 temporal medal for one substance.
 * Uses the same 24h clock as `planAchievementUnlocks`. Does not read UserAchievement.
 */
export function nextTemporalMilestone(input: {
  usage: AbstinenceUsage;
  thresholds?: readonly number[];
  now: Date;
}): TemporalMilestoneState {
  const substanceId = input.usage.substanceId;
  const thresholds = positiveThresholds(input.thresholds ?? TEMPORAL_THRESHOLDS);

  if (input.usage.status === "active") {
    return { substanceId, status: "active_use", daysAbstinent: null, next: null };
  }

  const lastUse = input.usage.lastUseDate;
  if (lastUse == null) {
    return { substanceId, status: "missing_date", daysAbstinent: null, next: null };
  }
  if (!isValidDate(lastUse) || !isValidDate(input.now) || lastUse.getTime() > input.now.getTime()) {
    return { substanceId, status: "invalid_date", daysAbstinent: null, next: null };
  }

  const daysAbstinent = daysBetween(lastUse, input.now);
  for (const thresholdDays of thresholds) {
    const dueAt = dateAfterDays(lastUse, thresholdDays);
    if (input.now.getTime() >= dueAt.getTime()) continue;
    const remainingMs = Math.max(0, dueAt.getTime() - input.now.getTime());
    const progress = Math.min(1, daysAbstinent / thresholdDays);
    const achievementId = temporalAchievementId(substanceId, thresholdDays);
    return {
      substanceId,
      status: "upcoming",
      daysAbstinent,
      next: {
        achievementId,
        titleKey: temporalTitleKey(achievementId),
        thresholdDays,
        dueAt,
        remainingMs,
        progress,
        tier: temporalTierForDays(thresholdDays),
      },
    };
  }

  return { substanceId, status: "complete", daysAbstinent, next: null };
}

export function nextTemporalMilestones(input: {
  usages: readonly AbstinenceUsage[];
  thresholds?: readonly number[];
  now: Date;
}): TemporalMilestoneState[] {
  return input.usages.map((usage) =>
    nextTemporalMilestone({
      usage,
      thresholds: input.thresholds,
      now: input.now,
    }),
  );
}

function substanceRank(substanceId: string): number {
  const index = (TEMPORAL_SUBSTANCES as readonly string[]).indexOf(substanceId);
  return index === -1 ? TEMPORAL_SUBSTANCES.length : index;
}

/**
 * Closest pending temporal medal. Physiological curve milestones are out of scope.
 */
export function pickFeaturedTemporalMilestone(
  states: readonly TemporalMilestoneState[],
): TemporalMilestoneState | null {
  const upcoming = states.filter(
    (state) => state.status === "upcoming" && state.next != null && state.next.remainingMs > 0,
  );
  if (upcoming.length === 0) return null;
  upcoming.sort((a, b) => {
    const remaining = (a.next?.remainingMs ?? 0) - (b.next?.remainingMs ?? 0);
    if (remaining !== 0) return remaining;
    const rank = substanceRank(a.substanceId) - substanceRank(b.substanceId);
    if (rank !== 0) return rank;
    return (a.next?.achievementId ?? "").localeCompare(b.next?.achievementId ?? "");
  });
  return upcoming[0] ?? null;
}

export interface UpcomingTemporalDue {
  achievementId: string;
  dueAtMs: number;
}

export function upcomingTemporalDues(
  states: readonly TemporalMilestoneState[],
): UpcomingTemporalDue[] {
  const dues: UpcomingTemporalDue[] = [];
  for (const state of states) {
    if (state.status !== "upcoming" || !state.next) continue;
    dues.push({
      achievementId: state.next.achievementId,
      dueAtMs: state.next.dueAt.getTime(),
    });
  }
  return dues;
}

export function temporalDueSyncKeys(
  previous: readonly UpcomingTemporalDue[],
  nowMs: number,
): string[] {
  const keys: string[] = [];
  for (const due of previous) {
    if (nowMs >= due.dueAtMs) {
      keys.push(`${due.achievementId}:${due.dueAtMs}`);
    }
  }
  return keys;
}
