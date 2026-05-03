import type { BiologicalSex, OrganId } from '@soma/shared-types';

export type BodyView = 'front' | 'back';

export interface OrganVisualState {
  /**
   * Recovery progress in [0, 1]. Determines color along the
   * damaged → mid → healthy gradient.
   */
  progressFraction: number;
  /**
   * If true the organ uses its computed color. If false it's
   * rendered in a muted inactive tone.
   */
  active: boolean;
}

export type OrganStateMap = Map<OrganId, OrganVisualState>;

export interface BodyDiagram3DProps {
  biologicalSex: BiologicalSex;
  view: BodyView;
  organStates: OrganStateMap;
  onOrganHover?: (organId: OrganId | null) => void;
  onOrganClick?: (organId: OrganId) => void;
  highlightedOrganId?: OrganId | null;
}