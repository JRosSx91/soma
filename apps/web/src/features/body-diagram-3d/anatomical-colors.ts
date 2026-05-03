import type { OrganId } from '@soma/shared-types';

export interface OrganColorPair {
  damaged: string;
  healthy: string;
}

/**
 * Anatomically-inspired colors with extra saturation so they remain
 * legible through the translucent skin layer.
 *
 * Damaged states retain a hint of the organ's natural hue but
 * desaturated, so the user always recognizes which organ is which
 * even at worst recovery state.
 */
export const ANATOMICAL_COLORS: Record<OrganId, OrganColorPair> = {
  liver: {
    damaged: '#5a3a32',
    healthy: '#a83820',
  },
  heart: {
    damaged: '#5a3a38',
    healthy: '#c8281e',
  },
  lungs: {
    damaged: '#7a5a55',
    healthy: '#e09084',
  },
  bronchi: {
    damaged: '#6a5a55',
    healthy: '#c8a89c',
  },
  kidneys: {
    damaged: '#5a3a30',
    healthy: '#a02818',
  },
  stomach: {
    damaged: '#7a5a40',
    healthy: '#c08858',
  },
  pancreas: {
    damaged: '#6a5a40',
    healthy: '#e0b850',
  },
  'brain-prefrontal-cortex': {
    damaged: '#5a5550',
    healthy: '#c8b8a8',
  },
  'brain-hippocampus': {
    damaged: '#5a5550',
    healthy: '#c8b8a8',
  },
  'brain-vta': {
    damaged: '#5a5550',
    healthy: '#c8b8a8',
  },
  'brain-nucleus-accumbens': {
    damaged: '#5a5550',
    healthy: '#c8b8a8',
  },
  'brain-amygdala': {
    damaged: '#5a5550',
    healthy: '#c8b8a8',
  },
  skin: {
    damaged: '#a89888',
    healthy: '#d4b8a0',
  },
  testes: {
    damaged: '#5a4a40',
    healthy: '#a08070',
  },
  ovaries: {
    damaged: '#5a4a40',
    healthy: '#a08070',
  },
};

export function interpolateOrganColor(
  organId: OrganId,
  progressFraction: number,
): string {
  const palette = ANATOMICAL_COLORS[organId];
  const t = Math.max(0, Math.min(1, progressFraction));

  const a = hexToRgb(palette.damaged);
  const b = hexToRgb(palette.healthy);

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