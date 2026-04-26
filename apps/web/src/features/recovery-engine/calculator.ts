import type { RecoveryInput, RecoveryOutput } from './types.js';

/**
 * Milliseconds in a day. Centralized constant to avoid magic numbers.
 */
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Computes days elapsed between two ISO date strings.
 * Negative values are clamped to zero — the engine treats "future
 * last use" as zero days abstinent rather than throwing, because
 * client clock skew is a real source of slightly-future timestamps.
 */
function daysBetween(fromIso: string, toMs: number): number {
  const fromMs = new Date(fromIso).getTime();
  if (Number.isNaN(fromMs)) {
    throw new Error(`Invalid lastUseDate: ${fromIso}`);
  }
  const elapsed = (toMs - fromMs) / MS_PER_DAY;
  return Math.max(0, elapsed);
}

/**
 * Logarithmic recovery: fast at first, asymptotic.
 * Used for processes with rapid initial response that taper off,
 * such as hepatic regeneration or bronchial ciliary recovery.
 *
 * Formula: progress = 1 - exp(-k * t), where k is calibrated so that
 * progress reaches 0.95 at t = daysTo95Recovery.
 *
 * Solving 0.95 = 1 - exp(-k * t95) gives k = -ln(0.05) / t95 ≈ 2.996 / t95.
 */
function logarithmicProgress(daysAbstinent: number, daysTo95: number): number {
  if (daysAbstinent <= 0) return 0;
  if (daysTo95 <= 0) return 1;
  const k = -Math.log(0.05) / daysTo95;
  return 1 - Math.exp(-k * daysAbstinent);
}

/**
 * Sigmoidal recovery: slow at first, accelerates, then plateaus.
 * Used for processes that involve delayed onset followed by rapid
 * change, such as dopaminergic receptor renormalization.
 *
 * Formula: a logistic curve centered at t = daysTo95 / 2, calibrated
 * so progress reaches 0.95 at t = daysTo95.
 *
 * sigmoid(t) = 1 / (1 + exp(-k * (t - midpoint)))
 *
 * Solving for k such that sigmoid(daysTo95) = 0.95 with midpoint at
 * daysTo95/2: k = 2 * ln(19) / daysTo95 ≈ 5.889 / daysTo95.
 */
function sigmoidalProgress(daysAbstinent: number, daysTo95: number): number {
  if (daysAbstinent <= 0) return 0;
  if (daysTo95 <= 0) return 1;
  const midpoint = daysTo95 / 2;
  const k = (2 * Math.log(19)) / daysTo95;
  return 1 / (1 + Math.exp(-k * (daysAbstinent - midpoint)));
}

/**
 * Linear recovery: constant rate of progress.
 * Used sparingly, only when the literature does not support a more
 * specific shape.
 */
function linearProgress(daysAbstinent: number, daysTo95: number): number {
  if (daysTo95 <= 0) return 1;
  // Reach 0.95 at daysTo95, then continue linearly to 1.0 at daysTo95 / 0.95.
  return Math.min(1, daysAbstinent / (daysTo95 / 0.95));
}

/**
 * Stepwise recovery: discrete jumps at predefined milestones.
 * Used when literature reports recovery as occurring at thresholds
 * rather than as a continuous function.
 *
 * For v1 this is implemented as a linear approximation. A proper
 * stepwise function would require per-curve milestone definitions
 * which we don't have in the schema yet. When that lands, replace
 * this body. The interface remains the same.
 */
function stepwiseProgress(daysAbstinent: number, daysTo95: number): number {
  return linearProgress(daysAbstinent, daysTo95);
}

/**
 * Main entry point. Computes recovery state for a given organ at a
 * given moment.
 *
 * Pure function. No side effects. The `now` parameter is injected
 * rather than read from the system clock so the engine is testable
 * and deterministic.
 *
 * @param input  Curve parameters and last use date.
 * @param now    Current moment in milliseconds since epoch. Defaults
 *               to Date.now() — pass an explicit value in tests.
 */
export function computeRecovery(
  input: RecoveryInput,
  now: number = Date.now(),
): RecoveryOutput {
  const daysAbstinent = daysBetween(input.lastUseDate, now);

  let progressFraction: number;
  switch (input.shape) {
    case 'logarithmic':
      progressFraction = logarithmicProgress(daysAbstinent, input.daysTo95Recovery);
      break;
    case 'sigmoidal':
      progressFraction = sigmoidalProgress(daysAbstinent, input.daysTo95Recovery);
      break;
    case 'linear':
      progressFraction = linearProgress(daysAbstinent, input.daysTo95Recovery);
      break;
    case 'stepwise':
      progressFraction = stepwiseProgress(daysAbstinent, input.daysTo95Recovery);
      break;
  }

  // Clamp to [0, 1] to absorb any floating-point overshoot on edge cases.
  progressFraction = Math.max(0, Math.min(1, progressFraction));

  const absoluteRecovery = progressFraction * input.recoveryCeiling;

  return {
    daysAbstinent,
    progressFraction,
    absoluteRecovery,
  };
}