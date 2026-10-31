/**
 * Featured anatomical systems on Explorar and organ-card art slots.
 * Dedicated explore assets may be added later; atlas plates stay untouched.
 */

export const featuredExploreSystemIds = [
  "nervous-central",
  "cardiovascular",
  "respiratory",
  "digestive",
  "hepatic",
] as const;

/** Drop files here later; empty until the organ-card assets exist. */
export const exploreSystemArtOverride: Readonly<Partial<Record<string, string>>> = {};

/**
 * Existing organ plates used only as Explorar card fallbacks.
 * They do not replace atlas system maps.
 */
export const exploreSystemOrganFallback: Readonly<Record<string, readonly string[]>> = {
  "nervous-central": ["/images/anatomy/brain.png"],
  cardiovascular: ["/images/anatomy/heart.png"],
  respiratory: ["/images/anatomy/lungs.png"],
  digestive: ["/images/anatomy/digestive.png"],
  hepatic: ["/images/anatomy/liver.png"],
  renal: ["/images/anatomy/kidneys.png"],
  immune: ["/images/anatomy/spleen.png"],
  reproductive: ["/images/anatomy/reproductive.png"],
  integumentary: ["/images/anatomy/skin.png"],
  sensory: ["/images/anatomy/eyes.png"],
  endocrine: ["/images/anatomy/endocrine.png"],
  "nervous-peripheral": ["/images/anatomy/peripheral-nerves.png"],
};

export function exploreSystemCardSources(
  systemId: string,
  atlasSrc: string | undefined,
): readonly string[] {
  const override = exploreSystemArtOverride[systemId];
  if (override) return [override];
  const organs = exploreSystemOrganFallback[systemId];
  if (organs && organs.length > 0) return organs;
  return atlasSrc ? [atlasSrc] : [];
}

export function collapseExploreIds<T extends string>(
  matched: readonly T[],
  featured: readonly T[],
  expanded: boolean,
  query: string,
): T[] {
  if (expanded || query.trim()) return [...matched];
  return featured.filter((id) => matched.includes(id));
}

/** First sentence of an existing educational intro. Does not invent copy. */
export function firstEducationalSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^[^.!?]+[.!?]/);
  return (match?.[0] ?? trimmed).trim();
}

export function canExpandExploreList(
  matchedCount: number,
  visibleCount: number,
  expanded: boolean,
  query: string,
): boolean {
  return !query.trim() && matchedCount > visibleCount && !expanded;
}