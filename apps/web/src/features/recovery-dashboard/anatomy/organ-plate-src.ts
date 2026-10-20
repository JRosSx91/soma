import type { AtlasSystem } from "./atlas-types.ts";
import { atlasSystems } from "./atlas-config.ts";
import { resolveOrganSheetById } from "./organ-sheet.ts";

/**
 * Individual atlas plate for one canonical organ.
 * Returns null when the id is unknown or the organ has no own plate.
 * Never borrows another organ or a system illustration.
 */
export function organPlateSrc(
  organId: string,
  systems: readonly AtlasSystem[] = atlasSystems,
): string | null {
  const sheet = resolveOrganSheetById(systems, organId);
  if (!sheet?.availability.hasPlate) return null;
  return sheet.plate?.src ?? null;
}
