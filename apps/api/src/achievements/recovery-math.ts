import type { RecoveryCurveShape } from "@prisma/client";
import {
  dateAfterDays,
  daysBetween,
  daysToReachCurveProgress,
  estimateCurve,
  planAchievementUnlocks,
  readAchievementProgress,
  type CurveModel,
} from "@soma/shared-types";

/**
 * Facade over @soma/shared-types. The formulas live there so the web
 * app and this API cannot drift. Names below stay for existing callers.
 *
 * `computeProgress` is curve progress, not the ceiling-adjusted estimate.
 */

export interface CurveParams {
  shape: RecoveryCurveShape;
  daysTo95Recovery: number;
}

export function computeProgress(daysAbstinent: number, params: CurveParams): number {
  return estimateCurve(daysAbstinent, {
    shape: params.shape,
    daysTo95Recovery: params.daysTo95Recovery,
    recoveryCeiling: 1,
  }).curveProgress;
}

export function daysToReachThreshold(threshold: number, params: CurveParams): number {
  return daysToReachCurveProgress(threshold, {
    shape: params.shape,
    daysTo95Recovery: params.daysTo95Recovery,
  });
}

export { dateAfterDays, daysBetween, planAchievementUnlocks, readAchievementProgress };
export type { CurveModel };
