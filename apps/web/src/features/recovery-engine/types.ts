import type { RecoveryCurveShape } from "@soma/shared-types";

/**
 * Input to the recovery engine: everything needed to compute the current
 * recovery state of a single organ for a given user.
 *
 * Decoupled from the API response shape on purpose. The engine should
 * stay portable — if we ever move it to the backend, no API types
 * leak into it.
 */
export interface RecoveryInput {
  /**
   * Mathematical shape of the recovery curve. Determines which formula
   * is applied to compute progress.
   */
  shape: RecoveryCurveShape;
  /**
   * Days needed under standard conditions to reach 95% of asymptotic
   * recovery. The 95% point — not 100% — because the asymptotes used
   * by logarithmic and sigmoidal curves never quite reach the ceiling.
   */
  daysTo95Recovery: number;
  /**
   * Maximum recovery achievable. 1.0 = full recovery to pre-use baseline.
   * Values below 1.0 reflect partially irreversible damage (e.g. lung
   * capacity loss in long-term smokers, structural cardiac changes from
   * cocaine).
   */
  recoveryCeiling: number;
  /**
   * ISO date string of the user's last reported use of the substance
   * affecting this organ.
   */
  lastUseDate: string;
}

/**
 * Output of the recovery engine.
 */
export interface RecoveryOutput {
  /**
   * Days elapsed since `lastUseDate`.
   */
  daysAbstinent: number;
  /**
   * Heuristic progress along the recovery curve. Range [0, 1].
   * A value of 1.0 means the curve has reached its own end, not that
   * the organ matches a pre-use baseline. The ceiling is applied only
   * in `absoluteRecovery`.
   *
   * Organ color uses this fraction. Achievement unlocks compare it
   * with the catalog threshold.
   */
  progressFraction: number;
  /**
   * Heuristic estimate relative to a pre-use baseline.
   * Range [0, recoveryCeiling]. This is progressFraction times the
   * ceiling. Achievement unlocks do not use it; they compare
   * progressFraction with the catalog threshold.
   *
   * Example: with recoveryCeiling = 0.75 and progressFraction = 1.0,
   * absoluteRecovery = 0.75.
   */
  absoluteRecovery: number;
}
