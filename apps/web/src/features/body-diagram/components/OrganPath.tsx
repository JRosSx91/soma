import type { OrganId } from '@soma/shared-types';
import { INACTIVE_ORGAN_COLOR, organFillColor } from '../coloring.js';
import type { OrganVisualState } from '../types.js';

interface OrganPathProps {
  organId: OrganId;
  /** SVG path data. */
  d: string;
  state: OrganVisualState | undefined;
  highlighted: boolean;
  onHover: (organId: OrganId | null) => void;
  onClick: (organId: OrganId) => void;
}

export function OrganPath({
  organId,
  d,
  state,
  highlighted,
  onHover,
  onClick,
}: OrganPathProps) {
  const isActive = state?.active ?? false;
  const fill = isActive
    ? organFillColor(state!.progressFraction)
    : INACTIVE_ORGAN_COLOR;

  return (
    <path
      d={d}
      data-organ-id={organId}
      fill={fill}
      stroke={highlighted ? 'var(--soma-accent-focus)' : 'var(--soma-border-default)'}
      strokeWidth={highlighted ? 1.5 : 0.5}
      style={{
        cursor: isActive ? 'pointer' : 'default',
        transition: 'fill 200ms ease, stroke 150ms ease, stroke-width 150ms ease',
        filter: highlighted ? 'drop-shadow(0 0 4px var(--soma-accent-default))' : 'none',
        opacity: isActive ? 1 : 0.6,
      }}
      onMouseEnter={isActive ? () => onHover(organId) : undefined}
      onMouseLeave={isActive ? () => onHover(null) : undefined}
      onClick={isActive ? () => onClick(organId) : undefined}
    />
  );
}