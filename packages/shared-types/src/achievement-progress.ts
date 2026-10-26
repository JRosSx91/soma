import {
  daysBetween,
  evaluateAchievement,
  type AchievementEvaluation,
  type CurveModel,
} from "./recovery-math.js";

/**
 * What a future achievements screen can render for one catalog row.
 *
 * Persisted fields come from UserAchievement. Everything else is derived
 * from the curve model and must be labelled as a heuristic estimate.
 */
export type AchievementViewStatus = "locked" | "unlocked" | "hidden" | "pending_review";

export interface PersistedAchievementUnlock {
  achievementId: string;
  unlockedAt: string;
  notifiedAt: string | null;
}

export interface AchievementProgressSnapshot {
  id: string;
  status: AchievementViewStatus;
  /** Catalog threshold on curve progress. Not a clinical target. */
  achievementThreshold: number;
  /** Derived share of that threshold, in [0, 1]. Null without a curve. */
  achievementProgress: number | null;
  /** Derived curve fraction, in [0, 1]. Null without a curve. */
  curveProgress: number | null;
  /** Derived curveProgress * ceiling. Null without a curve. */
  estimatedRecovery: number | null;
  /** Derived crossing of the historical rule. Does not grant the row. */
  isAchievementUnlocked: boolean;
  /** True while a hidden trophy must not reveal its copy or its numbers. */
  detailsConcealed: boolean;
  /** Persisted. Null until a UserAchievement row exists. */
  unlockedAt: string | null;
  /** Persisted. Null until the person has been told about the unlock. */
  notifiedAt: string | null;
}

export function buildAchievementProgressSnapshot(input: {
  id: string;
  hidden: boolean;
  evaluation: AchievementEvaluation;
  persisted: PersistedAchievementUnlock | null;
}): AchievementProgressSnapshot {
  const persisted = input.persisted?.achievementId === input.id ? input.persisted : null;
  const concealed = input.hidden && !persisted;

  let status: AchievementViewStatus;
  if (persisted) status = "unlocked";
  else if (input.evaluation.pendingReview) status = "pending_review";
  else if (concealed) status = "hidden";
  else status = "locked";

  return {
    id: input.id,
    status,
    achievementThreshold: input.evaluation.achievementThreshold,
    achievementProgress: concealed ? null : input.evaluation.achievementProgress,
    curveProgress: concealed ? null : input.evaluation.curveProgress,
    estimatedRecovery: concealed ? null : input.evaluation.estimatedRecovery,
    isAchievementUnlocked: input.evaluation.isAchievementUnlocked,
    detailsConcealed: concealed,
    unlockedAt: persisted?.unlockedAt ?? null,
    notifiedAt: persisted?.notifiedAt ?? null,
  };
}

/**
 * Why a locked achievement has, or does not have, a progress figure.
 * `ready` is the only state that carries a percentage.
 */
export type ProgressAvailability =
  | "ready"
  | "not_tracked"
  | "active_use"
  | "missing_date"
  | "pending_review"
  | "concealed";

export interface AchievementProgressReading {
  /** Share of the curve-progress threshold, in [0, 1]. Null when not calculable. */
  achievementProgress: number | null;
  progressAvailability: ProgressAvailability;
}

/**
 * Progress toward the catalog threshold. A persisted row is not created
 * here: `persisted` only decides whether a hidden trophy may reveal its
 * figure. Unlock state stays with the stored row.
 */
export function readAchievementProgress(input: {
  hidden: boolean;
  persisted: boolean;
  achievementThreshold: number;
  curve: CurveModel | null;
  usage: { status: "abstinent" | "active"; lastUseDate: Date | null } | null;
  now: Date;
  family?: "curve" | "temporal";
  abstinenceDays?: number | null;
}): AchievementProgressReading {
  if (input.hidden && !input.persisted) {
    return { achievementProgress: null, progressAvailability: "concealed" };
  }
  if (input.family === "temporal") {
    if (!input.usage) {
      return { achievementProgress: null, progressAvailability: "not_tracked" };
    }
    if (input.usage.status === "active") {
      return { achievementProgress: null, progressAvailability: "active_use" };
    }
    if (!input.usage.lastUseDate) {
      return { achievementProgress: null, progressAvailability: "missing_date" };
    }
    const needed = input.abstinenceDays;
    if (needed == null || needed <= 0) {
      return { achievementProgress: null, progressAvailability: "pending_review" };
    }
    const daysAbstinent = daysBetween(input.usage.lastUseDate, input.now);
    return {
      achievementProgress: Math.min(1, daysAbstinent / needed),
      progressAvailability: "ready",
    };
  }
  if (!input.curve) {
    return { achievementProgress: null, progressAvailability: "pending_review" };
  }
  if (!input.usage) {
    return { achievementProgress: null, progressAvailability: "not_tracked" };
  }
  if (input.usage.status === "active") {
    return { achievementProgress: null, progressAvailability: "active_use" };
  }
  if (!input.usage.lastUseDate) {
    return { achievementProgress: null, progressAvailability: "missing_date" };
  }

  const evaluation = evaluateAchievement({
    id: "progress",
    achievementThreshold: input.achievementThreshold,
    daysAbstinent: daysBetween(input.usage.lastUseDate, input.now),
    curve: input.curve,
  });
  return {
    achievementProgress: evaluation.achievementProgress,
    progressAvailability: "ready",
  };
}
