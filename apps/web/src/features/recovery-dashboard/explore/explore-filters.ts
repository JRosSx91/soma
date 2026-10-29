export const exploreScopes = ["all", "substances", "systems", "neurotransmitters"] as const;

export type ExploreScope = (typeof exploreScopes)[number];

export function isExploreScope(value: string): value is ExploreScope {
  return (exploreScopes as readonly string[]).includes(value);
}

export function scopeShowsSubstances(scope: ExploreScope): boolean {
  return scope === "all" || scope === "substances";
}

export function scopeShowsSystems(scope: ExploreScope): boolean {
  return scope === "all" || scope === "systems";
}

export function scopeShowsNeurotransmitters(scope: ExploreScope): boolean {
  return scope === "all" || scope === "neurotransmitters";
}

export function scopeShowsComingSoonPanels(scope: ExploreScope, query: string): boolean {
  return scope === "all" && !query.trim();
}
