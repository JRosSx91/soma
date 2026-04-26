import { MaleFront } from './views/MaleFront.js';
import type { BodyDiagramProps } from '../types.js';

/**
 * Selects the appropriate body silhouette + organ paths
 * based on biological sex and view direction.
 *
 * For PR 5, only MaleFront is implemented. The other three
 * variants (MaleBack, FemaleFront, FemaleBack) ship in a follow-up.
 */
export function BodyDiagram({
  biologicalSex,
  view,
  organStates,
  highlightedOrganId = null,
  onOrganHover = () => {},
  onOrganClick = () => {},
}: BodyDiagramProps) {
  // Only MaleFront exists for now. Other combinations fall back to it
  // with a warning so we surface missing implementations during dev.
  if (biologicalSex !== 'male' || view !== 'front') {
    if (typeof console !== 'undefined') {
      console.warn(
        `BodyDiagram: variant ${biologicalSex}/${view} not yet implemented, falling back to male/front`,
      );
    }
  }

  return (
    <MaleFront
      organStates={organStates}
      highlightedOrganId={highlightedOrganId}
      onOrganHover={onOrganHover}
      onOrganClick={onOrganClick}
    />
  );
}