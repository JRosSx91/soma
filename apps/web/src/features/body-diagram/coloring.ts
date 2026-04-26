/**
 * Interpolates between two hex colors.
 * Returns rgb() string.
 */
function interpolateHex(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

/**
 * Computes the organ fill color for a given recovery progress fraction.
 *
 * Three-stop gradient:
 *   0%   damaged (muted garnet)
 *   50%  mid (warm ochre)
 *   100% healthy (soft amber/gold)
 *
 * Reads CSS variables to keep palette in sync with design tokens.
 * Falls back to hardcoded values if running outside browser context.
 */
export function organFillColor(progressFraction: number): string {
  const clamped = Math.max(0, Math.min(1, progressFraction));

  // Read CSS variables from :root so the function tracks token changes.
  const styles = typeof window !== 'undefined'
    ? getComputedStyle(document.documentElement)
    : null;

  const damaged = styles?.getPropertyValue('--soma-organ-damaged').trim() || '#8a3a32';
  const mid = styles?.getPropertyValue('--soma-organ-mid').trim() || '#b8884a';
  const healthy = styles?.getPropertyValue('--soma-organ-healthy').trim() || '#d4a857';

  if (clamped < 0.5) {
    return interpolateHex(damaged, mid, clamped * 2);
  } else {
    return interpolateHex(mid, healthy, (clamped - 0.5) * 2);
  }
}

/**
 * Color for an inactive (irrelevant to the user) organ.
 * Subtle, low contrast — present for anatomical reference but
 * visually de-emphasized.
 */
export const INACTIVE_ORGAN_COLOR = 'rgba(138, 127, 111, 0.25)';