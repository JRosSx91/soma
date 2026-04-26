import type { RecoveryCurveShape } from '@soma/shared-types';

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
   * Recovery progress as a fraction of the achievable ceiling.
   * Range [0, 1]. A value of 1.0 means "as recovered as this organ
   * can possibly get" — which, if `recoveryCeiling` is 0.75, still
   * means 25% of damage is permanent.
   *
   * This is the value the UI uses to interpolate organ colors. It
   * answers the question "how far along is this user on their possible
   * recovery journey?" rather than "how close is this organ to a
   * pre-use state?".
   */
  progressFraction: number;
  /**
   * Recovery as an absolute fraction relative to the pre-use baseline.
   * Range [0, recoveryCeiling]. Useful for achievement triggers that
   * are defined in absolute terms.
   *
   * Example: with recoveryCeiling = 0.75 and progressFraction = 1.0,
   * absoluteRecovery = 0.75.
   */
  absoluteRecovery: number;
}