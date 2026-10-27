import {
  educationalNtProfiles,
  type EducationalNeurotransmitter,
} from "../anatomy/neurotransmitter-education.js";

export const exploreNtPhases = [
  "during_use",
  "acute_withdrawal",
  "post_acute",
  "normalizing",
] as const;

export type ExploreNtPhase = (typeof exploreNtPhases)[number];

/** Catalog order for the Explorar index. Nine educational transmitters, not a clinical panel. */
export const exploreNeurotransmitters = [
  "dopamine",
  "serotonin",
  "gaba",
  "glutamate",
  "acetylcholine",
  "norepinephrine",
  "endocannabinoid",
  "endorphin",
  "adenosine",
] as const satisfies readonly EducationalNeurotransmitter[];

export const featuredExploreNeurotransmitters = [
  "dopamine",
  "serotonin",
  "gaba",
  "glutamate",
  "acetylcholine",
] as const satisfies readonly EducationalNeurotransmitter[];

export function isExploreNtPhase(value: string): value is ExploreNtPhase {
  return (exploreNtPhases as readonly string[]).includes(value);
}

export function isExploreNeurotransmitter(
  value: string,
): value is EducationalNeurotransmitter {
  return (exploreNeurotransmitters as readonly string[]).includes(value);
}

/** Substances with a seeded educational profile for this transmitter. Order follows the profile index. */
export function substancesForEducationalNeurotransmitter(
  neurotransmitter: EducationalNeurotransmitter,
): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const profile of educationalNtProfiles) {
    if (profile.neurotransmitter !== neurotransmitter) continue;
    if (seen.has(profile.substanceId)) continue;
    seen.add(profile.substanceId);
    ids.push(profile.substanceId);
  }
  return ids;
}
