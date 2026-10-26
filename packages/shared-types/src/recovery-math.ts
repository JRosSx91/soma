import type { RecoveryCurveShape } from "./recovery.js";

/**
 * Heuristic recovery model shared by the API and the web app.
 *
 * Two different fractions come out of one curve. They are estimates
 * for visualization and achievement rules, not clinical measurements.
 *
 * - `curveProgress` is how far the clock has travelled along the curve,
 *   from 0 toward its asymptote. Achievement unlocks use this fraction.
 *   That is the historical rule in AchievementsService.
 * - `estimatedRecovery` is `curveProgress * recoveryCeiling`. It is the
 *   model's guess relative to a pre-use baseline. A ceiling of 0.6 means
 *   the estimate never exceeds 0.6, even when `curveProgress` is 1.
 *
 * Switching unlocks to `estimatedRecovery` would change who qualifies,
 * including people already stored in UserAchievement. This module does
 * not make that switch.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface CurveModel {
  shape: RecoveryCurveShape;
  daysTo95Recovery: number;
  /** Model cap in (typically) [0, 1]. Not a lab result. */
  recoveryCeiling: number;
}

export interface CurveEstimate {
  daysAbstinent: number;
  /** Heuristic progress along the curve, in [0, 1]. */
  curveProgress: number;
  /** Heuristic baseline estimate, in [0, recoveryCeiling]. */
  estimatedRecovery: number;
}

export interface AchievementEvaluationInput {
  id: string;
  /** Required `curveProgress`. Not a clinical percentage. */
  achievementThreshold: number;
  daysAbstinent: number;
  /** Null when the organ/substance pair has no curve. */
  curve: CurveModel | null;
}

export interface AchievementEvaluation {
  id: string;
  achievementThreshold: number;
  curveProgress: number | null;
  estimatedRecovery: number | null;
  /**
   * Share of the threshold already covered, in [0, 1].
   * Null when no curve exists.
   */
  achievementProgress: number | null;
  /**
   * Historical unlock rule: a curve exists and `curveProgress` has
   * reached the threshold. This does not write a database row.
   */
  isAchievementUnlocked: boolean;
  /** True when the rule cannot be evaluated because the curve is missing. */
  pendingReview: boolean;
}

export type AchievementFamily = "curve" | "temporal";

export interface UnlockCandidate {
  id: string;
  organId: string | null;
  substanceId: string;
  threshold: number | null;
  family?: AchievementFamily;
  abstinenceDays?: number | null;
}

export interface CurveRecord extends CurveModel {
  organId: string;
  substanceId: string;
}

export interface AbstinenceUsage {
  substanceId: string;
  status: "abstinent" | "active";
  lastUseDate: Date | null;
}

export interface PlannedUnlock {
  id: string;
  unlockedAt: Date;
}

export function daysBetween(fromDate: Date, toDate: Date): number {
  return Math.max(0, (toDate.getTime() - fromDate.getTime()) / MS_PER_DAY);
}

export function dateAfterDays(fromDate: Date, days: number): Date {
  return new Date(fromDate.getTime() + days * MS_PER_DAY);
}

export function estimateCurve(daysAbstinent: number, model: CurveModel): CurveEstimate {
  const elapsed = Math.max(0, daysAbstinent);
  const curveProgress = clamp01(progressForShape(elapsed, model.shape, model.daysTo95Recovery));
  return {
    daysAbstinent: elapsed,
    curveProgress,
    estimatedRecovery: curveProgress * model.recoveryCeiling,
  };
}

/**
 * Days of abstinence required to reach a `curveProgress` target.
 * Infinity means an asymptotic curve cannot reach that target.
 */
export function daysToReachCurveProgress(
  target: number,
  model: Pick<CurveModel, "shape" | "daysTo95Recovery">,
): number {
  if (target <= 0) return 0;
  const { shape, daysTo95Recovery: daysTo95 } = model;
  if (daysTo95 <= 0) return 0;

  if (shape === "logarithmic") {
    if (target >= 1) return Infinity;
    const k = -Math.log(0.05) / daysTo95;
    return -Math.log(1 - target) / k;
  }

  if (shape === "sigmoidal") {
    if (target >= 1) return Infinity;
    const mid = daysTo95 / 2;
    const k = (2 * Math.log(19)) / daysTo95;
    return mid - Math.log(1 / target - 1) / k;
  }

  if (shape === "linear" || shape === "stepwise") {
    if (target > 1) return Infinity;
    return (target * daysTo95) / 0.95;
  }

  const never: never = shape;
  throw new Error(`Unknown curve shape: ${never}`);
}

export function evaluateAchievement(input: AchievementEvaluationInput): AchievementEvaluation {
  const threshold = input.achievementThreshold;
  if (!input.curve) {
    return {
      id: input.id,
      achievementThreshold: threshold,
      curveProgress: null,
      estimatedRecovery: null,
      achievementProgress: null,
      isAchievementUnlocked: false,
      pendingReview: true,
    };
  }

  const estimate = estimateCurve(input.daysAbstinent, input.curve);
  const unlocked = estimate.curveProgress >= threshold;
  const achievementProgress =
    threshold <= 0 ? 1 : Math.min(1, estimate.curveProgress / threshold);

  return {
    id: input.id,
    achievementThreshold: threshold,
    curveProgress: estimate.curveProgress,
    estimatedRecovery: estimate.estimatedRecovery,
    achievementProgress,
    isAchievementUnlocked: unlocked,
    pendingReview: false,
  };
}

/**
 * Pure copy of the historical unlock scan. Already-unlocked ids are
 * skipped, and a missing curve never produces an unlock.
 */
export function planAchievementUnlocks(input: {
  achievements: readonly UnlockCandidate[];
  curves: readonly CurveRecord[];
  usages: readonly AbstinenceUsage[];
  alreadyUnlockedIds: ReadonlySet<string>;
  now: Date;
}): PlannedUnlock[] {
  const curveByPair = new Map<string, CurveModel>();
  for (const curve of input.curves) {
    curveByPair.set(`${curve.organId}:${curve.substanceId}`, curve);
  }
  const usageBySubstance = new Map<string, AbstinenceUsage>();
  for (const usage of input.usages) {
    usageBySubstance.set(usage.substanceId, usage);
  }

  const planned: PlannedUnlock[] = [];
  for (const achievement of input.achievements) {
    if (input.alreadyUnlockedIds.has(achievement.id)) continue;

    const usage = usageBySubstance.get(achievement.substanceId);
    if (!usage || usage.status === "active" || !usage.lastUseDate) continue;

    const family = achievement.family ?? "curve";
    if (family === "temporal") {
      const needed = achievement.abstinenceDays;
      if (needed == null || needed <= 0) continue;
      const daysAbstinent = daysBetween(usage.lastUseDate, input.now);
      if (daysAbstinent < needed) continue;
      planned.push({
        id: achievement.id,
        unlockedAt: dateAfterDays(usage.lastUseDate, needed),
      });
      continue;
    }

    if (achievement.organId == null || achievement.threshold == null) continue;

    const curve = curveByPair.get(`${achievement.organId}:${achievement.substanceId}`);
    if (!curve) continue;

    const daysAbstinent = daysBetween(usage.lastUseDate, input.now);
    const evaluation = evaluateAchievement({
      id: achievement.id,
      achievementThreshold: achievement.threshold,
      daysAbstinent,
      curve,
    });
    if (!evaluation.isAchievementUnlocked) continue;

    const daysAtThreshold = daysToReachCurveProgress(achievement.threshold, curve);
    const unlockedAt = Number.isFinite(daysAtThreshold)
      ? dateAfterDays(usage.lastUseDate, daysAtThreshold)
      : input.now;
    planned.push({ id: achievement.id, unlockedAt });
  }
  return planned;
}

function progressForShape(
  daysAbstinent: number,
  shape: RecoveryCurveShape,
  daysTo95: number,
): number {
  switch (shape) {
    case "logarithmic":
      return logarithmicProgress(daysAbstinent, daysTo95);
    case "sigmoidal":
      return sigmoidalProgress(daysAbstinent, daysTo95);
    case "linear":
    case "stepwise":
      return linearProgress(daysAbstinent, daysTo95);
    default: {
      const never: never = shape;
      throw new Error(`Unknown curve shape: ${never}`);
    }
  }
}

function logarithmicProgress(daysAbstinent: number, daysTo95: number): number {
  if (daysAbstinent <= 0) return 0;
  if (daysTo95 <= 0) return 1;
  const k = -Math.log(0.05) / daysTo95;
  return 1 - Math.exp(-k * daysAbstinent);
}

function sigmoidalProgress(daysAbstinent: number, daysTo95: number): number {
  if (daysAbstinent <= 0) return 0;
  if (daysTo95 <= 0) return 1;
  const midpoint = daysTo95 / 2;
  const k = (2 * Math.log(19)) / daysTo95;
  return 1 / (1 + Math.exp(-k * (daysAbstinent - midpoint)));
}

function linearProgress(daysAbstinent: number, daysTo95: number): number {
  if (daysTo95 <= 0) return 1;
  return Math.min(1, daysAbstinent / (daysTo95 / 0.95));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
