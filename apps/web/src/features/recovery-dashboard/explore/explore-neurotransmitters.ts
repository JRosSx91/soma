export const exploreNtPhases = [
  "during_use",
  "acute_withdrawal",
  "post_acute",
  "normalizing",
] as const;

export type ExploreNtPhase = (typeof exploreNtPhases)[number];

export function isExploreNtPhase(value: string): value is ExploreNtPhase {
  return (exploreNtPhases as readonly string[]).includes(value);
}
