import type { RecoveryCurveShape } from '@prisma/client';

/**
 * Recovery math, ported from apps/web/src/features/recovery-engine.
 *
 * TODO: extract to a shared @soma/recovery-engine package so the
 * frontend and backend both consume the same source of truth.
 *
 * Two operations are exposed:
 *   - computeProgress: given days abstinent and curve params, return
 *     the progress fraction in [0, 1].
 *   - daysToReachThreshold: invert a curve. Given a target progress
 *     fraction in [0, 1], return the days of abstinence required to
 *     reach it.
 *
 * Both functions are pure and deterministic.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface CurveParams {
  shape: RecoveryCurveShape;
  daysTo95Recovery: number;
}

// ---------------------------------------------------------------------------
// Forward direction: days -> progress
// ---------------------------------------------------------------------------

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

export function computeProgress(
  daysAbstinent: number,
  params: CurveParams,
): number {
  let progress: number;
  switch (params.shape) {
    case 'logarithmic':
      progress = logarithmicProgress(daysAbstinent, params.daysTo95Recovery);
      break;
    case 'sigmoidal':
      progress = sigmoidalProgress(daysAbstinent, params.daysTo95Recovery);
      break;
    case 'linear':
      progress = linearProgress(daysAbstinent, params.daysTo95Recovery);
      break;
    case 'stepwise':
      progress = linearProgress(daysAbstinent, params.daysTo95Recovery);
      break;
  }
  return Math.max(0, Math.min(1, progress));
}

// ---------------------------------------------------------------------------
// Inverse direction: progress -> days
// ---------------------------------------------------------------------------

/**
 * Given a target progress fraction, returns the days of abstinence
 * required to reach (or exceed) that fraction under the given curve.
 *
 * Returns Infinity if the threshold is mathematically unreachable
 * (i.e. >= 1.0 for asymptotic curves, where the curve approaches but
 * never reaches 1.0).
 *
 * Returns 0 if the threshold is already crossed at day 0 (i.e. <= 0).
 */
export function daysToReachThreshold(
  threshold: number,
  params: CurveParams,
): number {
  if (threshold <= 0) return 0;

  const { shape, daysTo95Recovery: daysTo95 } = params;

  if (daysTo95 <= 0) return 0;

  // Logarithmic: 1 - exp(-k*d) = t  =>  d = -ln(1 - t) / k
  if (shape === 'logarithmic') {
    if (threshold >= 1) return Infinity;
    const k = -Math.log(0.05) / daysTo95;
    return -Math.log(1 - threshold) / k;
  }

  // Sigmoidal: 1 / (1 + exp(-k*(d - mid))) = t
  //   =>  d = mid - ln(1/t - 1) / k
  if (shape === 'sigmoidal') {
    if (threshold >= 1) return Infinity;
    const mid = daysTo95 / 2;
    const k = (2 * Math.log(19)) / daysTo95;
    return mid - Math.log(1 / threshold - 1) / k;
  }

  // Linear / stepwise: d / (daysTo95 / 0.95) = t  =>  d = t * daysTo95 / 0.95
  if (shape === 'linear' || shape === 'stepwise') {
    if (threshold > 1) return Infinity;
    return (threshold * daysTo95) / 0.95;
  }

  // Should be unreachable.
  throw new Error(`Unknown curve shape: ${shape}`);
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

export function daysBetween(fromDate: Date, toDate: Date): number {
  return Math.max(0, (toDate.getTime() - fromDate.getTime()) / MS_PER_DAY);
}

export function dateAfterDays(fromDate: Date, days: number): Date {
  return new Date(fromDate.getTime() + days * MS_PER_DAY);
}