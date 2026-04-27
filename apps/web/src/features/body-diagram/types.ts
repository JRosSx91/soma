import type { BiologicalSex, OrganId } from '@soma/shared-types';

export type BodyView = 'front' | 'back';

export interface OrganVisualState {
  progressFraction: number;
  active: boolean;
}

export type OrganStateMap = Map<OrganId, OrganVisualState>;

export interface BodyDiagramProps {
  biologicalSex: BiologicalSex;
  view: BodyView;
  organStates: OrganStateMap;
  /** Called when the user hovers an active organ. */
  onOrganHover?: (organId: OrganId | null) => void;
  /** Called when the user clicks an active organ. */
  onOrganClick?: (organId: OrganId) => void;
  /** Currently highlighted organ (if any). Drives visual emphasis. */
  highlightedOrganId?: OrganId | null;
}