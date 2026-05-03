import { MaleFront } from './views/MaleFront.js';
import type { BodyDiagramProps } from '../types.js';

export function BodyDiagram({
  biologicalSex,
  view,
  organStates,
  highlightedOrganId = null,
  onOrganHover = () => {},
  onOrganClick = () => {},
}: BodyDiagramProps) {
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