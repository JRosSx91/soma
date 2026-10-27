import type { OrganId } from "@soma/shared-types";
import {
  anatomyExplorerHref,
  anatomyExplorerHrefForOrgan,
  atlasSystemIdForOrgan,
  resolveAnatomyExplorerSelection,
} from "../anatomy/anatomy-explorer-query.js";
import { atlasSystems } from "../anatomy/atlas-config.js";
import type { ShellBase } from "../shell-base.js";
import type { ExploreEduSheetId } from "./explore-edu.js";

/**
 * Explicit educational → atlas destinations.
 * Not inferred from system membership, NT maps, or recovery curves.
 */
export type ExploreEduAnatomyDestination =
  | { kind: "organ"; organId: OrganId; systemId: string }
  | { kind: "system"; systemId: string };

export const EXPLORE_EDU_ANATOMY_MAX_DESTINATIONS = 3;

export const exploreEduAnatomyDestinations = {
  dopamine: [
    { kind: "organ", organId: "brain-vta", systemId: "nervous-central" },
    { kind: "organ", organId: "brain-nucleus-accumbens", systemId: "nervous-central" },
    { kind: "organ", organId: "brain-prefrontal-cortex", systemId: "nervous-central" },
  ],
  glutamate: [{ kind: "organ", organId: "brain-hippocampus", systemId: "nervous-central" }],
  metabolism: [{ kind: "organ", organId: "liver", systemId: "hepatic" }],
  neuroadaptation: [{ kind: "system", systemId: "nervous-central" }],
} as const satisfies Partial<
  Record<ExploreEduSheetId, readonly ExploreEduAnatomyDestination[]>
>;

export type ExploreEduAnatomySheetId = keyof typeof exploreEduAnatomyDestinations;

export function exploreEduAnatomyLinks(
  sheetId: ExploreEduSheetId,
): readonly ExploreEduAnatomyDestination[] {
  if (!(sheetId in exploreEduAnatomyDestinations)) return [];
  return exploreEduAnatomyDestinations[sheetId as ExploreEduAnatomySheetId];
}

/** Anatomical prose is still Spanish-first. Hide atlas links outside Spanish UI. */
export function exploreEduAnatomyLinksVisible(language: string | undefined): boolean {
  const code = (language ?? "").toLowerCase();
  return code === "es" || code.startsWith("es-");
}

export function isExploreEduAnatomyDestinationValid(
  destination: ExploreEduAnatomyDestination,
): boolean {
  if (destination.kind === "system") {
    return atlasSystems.some((system) => system.id === destination.systemId);
  }
  const owner = atlasSystemIdForOrgan(destination.organId);
  if (owner !== destination.systemId) return false;
  const selection = resolveAnatomyExplorerSelection(destination.systemId, destination.organId);
  return selection.systemId === destination.systemId && selection.organId === destination.organId;
}

export function exploreEduAnatomyHref(
  base: ShellBase,
  destination: ExploreEduAnatomyDestination,
): string | null {
  if (!isExploreEduAnatomyDestinationValid(destination)) return null;
  if (destination.kind === "organ") {
    return anatomyExplorerHrefForOrgan(base, destination.organId);
  }
  return anatomyExplorerHref(base, destination.systemId);
}

function anatomyDestinationKey(destination: ExploreEduAnatomyDestination): string {
  return destination.kind === "organ"
    ? `organ:${destination.organId}`
    : `system:${destination.systemId}`;
}

const exploreEduAnatomyInverse = (() => {
  const inverse = new Map<string, ExploreEduSheetId>();
  for (const sheetId of Object.keys(exploreEduAnatomyDestinations) as ExploreEduAnatomySheetId[]) {
    for (const destination of exploreEduAnatomyDestinations[sheetId]) {
      const key = anatomyDestinationKey(destination);
      const existing = inverse.get(key);
      if (existing && existing !== sheetId) {
        inverse.delete(key);
        continue;
      }
      inverse.set(key, sheetId);
    }
  }
  return inverse;
})();

export function exploreEduSheetForAnatomy(
  destination: ExploreEduAnatomyDestination,
): ExploreEduSheetId | null {
  if (!isExploreEduAnatomyDestinationValid(destination)) return null;
  return exploreEduAnatomyInverse.get(anatomyDestinationKey(destination)) ?? null;
}

/** Organ-level inverse only. Does not inherit the parent system's article. */
export function exploreEduSheetForOrgan(organId: string): ExploreEduSheetId | null {
  const systemId = atlasSystemIdForOrgan(organId);
  if (!systemId) return null;
  return exploreEduSheetForAnatomy({
    kind: "organ",
    organId: organId as OrganId,
    systemId,
  });
}

/** System-level inverse only. Does not collect organ articles in that system. */
export function exploreEduSheetForSystem(systemId: string): ExploreEduSheetId | null {
  return exploreEduSheetForAnatomy({ kind: "system", systemId });
}
