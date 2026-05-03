import type { RecoveryInput, RecoveryOutput } from './types.js';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysBetween(fromIso: string, toMs: number): number {
  const fromMs = new Date(fromIso).getTime();
  if (Number.isNaN(fromMs)) {
    throw new Error(`Invalid lastUseDate: ${fromIso}`);
  }
  const elapsed = (toMs - fromMs) / MS_PER_DAY;
  return Math.max(0, elapsed);
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