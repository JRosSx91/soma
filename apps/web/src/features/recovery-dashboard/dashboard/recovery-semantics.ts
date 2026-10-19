/**
 * Presentation helpers for Soma 2.0 recovery figures.
 *
 * Language-independent. Does not change engine math. Maps:
 * - progressFraction / curveProgress → trajectory advance (primary UI %)
 * - absoluteRecovery → ceiling-aware estimate (contextual only)
 * - recoveryCeiling → model cap (shown only when known and < 1)
 *
 * None of these are clinical measurements of the individual user.
 */

export const UNAVAILABLE_DISPLAY = "—";

export function isCalculableProgress(
  value: number | null | undefined,
): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Trajectory-advance percentage, or "—" when the value is not calculable.
 * Valid 0 remains "0%". NaN / Infinity never become a fake 0%.
 */
export function formatTrajectoryPercent(
  progressFraction: number | null | undefined,
): string {
  if (!isCalculableProgress(progressFraction)) return UNAVAILABLE_DISPLAY;
  const pct = Math.round(clamp01(progressFraction) * 100);
  return `${pct}%`;
}

/** Compact “Hoy · 42%” / “Today · 42%” legend value. */
export function formatLabeledPercent(
  label: string,
  progressFraction: number | null | undefined,
): string {
  return `${label} · ${formatTrajectoryPercent(progressFraction)}`;
}

/** Rounded ceiling percent, or null when unknown / full (~1) / non-positive. */
export function modelCeilingPercent(
  recoveryCeiling: number | null | undefined,
): number | null {
  if (recoveryCeiling == null || !Number.isFinite(recoveryCeiling)) {
    return null;
  }
  if (recoveryCeiling >= 0.999) return null;
  if (recoveryCeiling <= 0) return null;
  return Math.round(recoveryCeiling * 100);
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
