import type { BiologicalSex, OrganId } from '@soma/shared-types';

export type BodyView = 'front' | 'back';

/**
 * Visual state of a single organ in the diagram.
 * Drives fill color and interactivity.
 */
export interface OrganVisualState {
  /**
   * Recovery progress in [0, 1]. Determines the color along the
   * damaged → mid → healthy gradient.
   */
  progressFraction: number;
  /**
   * If true, the organ is rendered with full opacity and is interactive.
   * If false, the organ is rendered dimmed because the user has no
   * substance affecting it.
   */
  active: boolean;
}

/**
 * Map keyed by OrganId, providing visual state for each organ
 * the diagram should render in active state.
 *
 * Organs not present in the map are rendered as dimmed/inactive
 * (anatomical reference but not relevant to the user's profile).
 */
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