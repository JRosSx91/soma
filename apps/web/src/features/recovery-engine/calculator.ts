import { estimateCurve } from "@soma/shared-types";
import type { RecoveryInput, RecoveryOutput } from "./types.js";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysBetween(fromIso: string, toMs: number): number {
  const fromMs = new Date(fromIso).getTime();
  if (Number.isNaN(fromMs)) {
    throw new Error(`Invalid lastUseDate: ${fromIso}`);
  }
  const elapsed = (toMs - fromMs) / MS_PER_DAY;
  return Math.max(0, elapsed);
}

/**
 * Main entry point. Computes recovery state for a given organ at a
 * given moment.
 *
 * Pure function. No side effects. The `now` parameter is injected
 * rather than read from the system clock so the engine is testable
 * and deterministic.
 *
 * `progressFraction` is curve progress. `absoluteRecovery` multiplies
 * that progress by the ceiling. Achievement unlocks use the first one.
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
  const estimate = estimateCurve(daysAbstinent, {
    shape: input.shape,
    daysTo95Recovery: input.daysTo95Recovery,
    recoveryCeiling: input.recoveryCeiling,
  });

  return {
    daysAbstinent,
    progressFraction: estimate.curveProgress,
    absoluteRecovery: estimate.estimatedRecovery,
  };
}
