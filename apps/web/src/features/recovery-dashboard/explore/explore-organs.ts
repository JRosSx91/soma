/**
 * Presentation helper: unique catalog organ ids linked to a substance
 * in existing educational indexes. Does not invent or rank damage.
 */

import { atlasSystems } from "../anatomy/atlas-config.js";

export interface EducationalOrganGroup {
  systemId: string | null;
  organIds: readonly string[];
}

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

/**
 * Groups educational organ ids by atlasSystems order.
 * Ids absent from the atlas stay in a trailing ungrouped bucket.
 */
export function groupEducationalOrgansByAtlasSystem(
  organIds: readonly string[],
): EducationalOrganGroup[] {
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const organId of organIds) {
    if (seen.has(organId)) continue;
    seen.add(organId);
    unique.push(organId);
  }

  const used = new Set<string>();
  const groups: EducationalOrganGroup[] = [];

  for (const system of atlasSystems) {
    const inSystem = system.organs
      .map((organ) => organ.id)
      .filter((organId) => seen.has(organId));
    if (inSystem.length === 0) continue;
    groups.push({ systemId: system.id, organIds: inSystem });
    for (const organId of inSystem) used.add(organId);
  }

  const ungrouped = unique.filter((organId) => !used.has(organId));
  if (ungrouped.length > 0) {
    groups.push({ systemId: null, organIds: ungrouped });
  }
  return groups;
}

export function atlasOrganFallbackName(organId: string): string | null {
  for (const system of atlasSystems) {
    const organ = system.organs.find((item) => item.id === organId);
    if (organ) return organ.name;
  }
  return null;
}
