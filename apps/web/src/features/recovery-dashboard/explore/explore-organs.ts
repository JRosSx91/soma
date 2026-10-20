/**
 * Presentation helper: unique catalog organ ids linked to a substance
 * in existing educational indexes. Does not invent or rank damage.
 */

export function uniqueOrganIdsForSubstance(
  substanceId: string,
  pairs: ReadonlyArray<{ organId: string; substanceId: string }>,
): string[] {
  const seen = new Set<string>();
  for (const pair of pairs) {
    if (pair.substanceId !== substanceId) continue;
    seen.add(pair.organId);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

export function joinOrganLabels(labels: readonly string[]): string {
  return labels.join(" · ");
}
