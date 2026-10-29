import type { EducationalNeurotransmitter } from "../anatomy/neurotransmitter-education.js";
import { exploreNeurotransmitters } from "./explore-neurotransmitters.js";

export const exploreNeurotransmitterArt = {
  dopamine: "/images/neurotransmitters/neurotransmitter-dopamine.png",
  serotonin: "/images/neurotransmitters/neurotransmitter-serotonin.png",
  gaba: "/images/neurotransmitters/neurotransmitter-gaba.png",
  glutamate: "/images/neurotransmitters/neurotransmitter-glutamate.png",
  acetylcholine: "/images/neurotransmitters/neurotransmitter-acetylcholine.png",
  norepinephrine: "/images/neurotransmitters/neurotransmitter-norepinephrine.png",
  endocannabinoid: "/images/neurotransmitters/neurotransmitter-endocannabinoid.png",
  endorphin: "/images/neurotransmitters/neurotransmitter-endorphin.png",
  adenosine: "/images/neurotransmitters/neurotransmitter-adenosine.png",
} as const satisfies Record<EducationalNeurotransmitter, string>;

export const exploreProcessTopics = [
  "receptors",
  "tolerance",
  "dependence",
  "neuroadaptation",
  "metabolism",
] as const;

export type ExploreProcessTopic = (typeof exploreProcessTopics)[number];

export const exploreProcessArt = {
  receptors: "/images/processes/process-receptors.png",
  tolerance: "/images/processes/process-tolerance.png",
  dependence: "/images/processes/process-dependence.png",
  neuroadaptation: "/images/processes/process-neuroadaptation.png",
  metabolism: "/images/processes/process-metabolism.png",
} as const satisfies Record<ExploreProcessTopic, string>;

export const exploreMissionsArt = "/images/missions/educational-missions.png";

export function allExploreGraphicSources(): readonly string[] {
  return [
    ...exploreNeurotransmitters.map((id) => exploreNeurotransmitterArt[id]),
    ...exploreProcessTopics.map((id) => exploreProcessArt[id]),
    exploreMissionsArt,
  ];
}
