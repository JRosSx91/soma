import type { BodySystem, OrganId, SubstanceId } from "@soma/shared-types";
import {
  educationalAnatomy,
  type AnatomyEducationEntry,
  type AnatomySource,
} from "./anatomy-education.ts";
import { narrativeSubstances } from "./narrative-catalog.ts";
import { signalingSubstances } from "./neurotransmitter-education.ts";
import { recoverySubstances } from "./recovery-catalog.ts";
import type { AtlasOrgan, AtlasPlate, AtlasSystem } from "./atlas-types.ts";

/**
 * Typed anatomical sheet for the Soma 2.0 explorer.
 *
 * Identity and plates come from `atlas-config` (canonical organ ids).
 * Prose comes from `anatomy-education` when a ficha exists.
 * Substance narratives and recovery curves stay in their own catalogs;
 * this model only reports whether they are available.
 *
 * A missing field is null or false. Nothing is borrowed from another organ.
 */

export interface OrganSheetAvailability {
  /** Individual organ plate in the atlas. */
  hasPlate: boolean;
  /** Neutral anatomical education entry (ficha). */
  hasEducation: boolean;
  /** At least one organ×substance narrative in the seed index. */
  hasNarratives: boolean;
  /** At least one compatible educational neurotransmitter profile for this organ. */
  hasEducationalSignaling: boolean;
  /** At least one recovery curve in the seed snapshot. */
  hasRecoveryCurves: boolean;
  narrativeSubstanceIds: readonly SubstanceId[];
  signalingSubstanceIds: readonly SubstanceId[];
  recoverySubstanceIds: readonly SubstanceId[];
}

/**
 * Resolved view of one atlas organ. Does not invent anatomical prose,
 * personal recovery estimates, or parallel organ identifiers.
 */
export interface OrganAnatomicalSheet {
  organId: OrganId;
  name: string;
  systemId: string;
  catalogSystem: BodySystem;
  systemName: string;
  /** Anatomical site when the education entry provides it. */
  location: string | null;
  anatomy: string | null;
  physiology: string | null;
  relations: string | null;
  plate: AtlasPlate | null;
  sources: readonly AnatomySource[];
  availability: OrganSheetAvailability;
  /** Raw education entry when present; null when the ficha is absent. */
  education: AnatomyEducationEntry | null;
}

export interface SystemSheetCoverage {
  systemId: string;
  catalogSystem: BodySystem;
  systemName: string;
  organCount: number;
  organsWithPlate: number;
  organsWithEducation: number;
  organsWithNarratives: number;
  organsWithRecoveryCurves: number;
  /** True when the catalog lists the system but no organs yet. */
  emptySystem: boolean;
}

function availabilityFor(organId: string, plate: AtlasPlate | null): OrganSheetAvailability {
  const narrativeSubstanceIds = narrativeSubstances(organId);
  const signalingSubstanceIds = signalingSubstances(organId);
  const recoverySubstanceIds = recoverySubstances(organId);
  return {
    hasPlate: plate !== null,
    hasEducation: educationalAnatomy(organId) !== null,
    hasNarratives: narrativeSubstanceIds.length > 0,
    hasEducationalSignaling: signalingSubstanceIds.length > 0,
    hasRecoveryCurves: recoverySubstanceIds.length > 0,
    narrativeSubstanceIds,
    signalingSubstanceIds,
    recoverySubstanceIds,
  };
}

/**
 * Builds a sheet from an atlas system + organ. Uses only existing catalogs.
 */
export function resolveOrganSheet(
  system: AtlasSystem,
  organ: AtlasOrgan,
): OrganAnatomicalSheet {
  const education = educationalAnatomy(organ.id);
  return {
    organId: organ.id,
    name: organ.name,
    systemId: system.id,
    catalogSystem: system.catalogSystem,
    systemName: system.name,
    location: education?.location ?? null,
    anatomy: education?.anatomy ?? null,
    physiology: education?.physiology ?? null,
    relations: education?.relations ?? null,
    plate: organ.plate,
    sources: education?.sources ?? [],
    availability: availabilityFor(organ.id, organ.plate),
    education,
  };
}

export function resolveOrganSheetById(
  systems: readonly AtlasSystem[],
  organId: string,
): OrganAnatomicalSheet | null {
  for (const system of systems) {
    const organ = system.organs.find((item) => item.id === organId);
    if (organ) return resolveOrganSheet(system, organ);
  }
  return null;
}

export function listOrganSheets(system: AtlasSystem): readonly OrganAnatomicalSheet[] {
  return system.organs.map((organ) => resolveOrganSheet(system, organ));
}

export function systemSheetCoverage(system: AtlasSystem): SystemSheetCoverage {
  const sheets = listOrganSheets(system);
  return {
    systemId: system.id,
    catalogSystem: system.catalogSystem,
    systemName: system.name,
    organCount: sheets.length,
    organsWithPlate: sheets.filter((sheet) => sheet.availability.hasPlate).length,
    organsWithEducation: sheets.filter((sheet) => sheet.availability.hasEducation).length,
    organsWithNarratives: sheets.filter((sheet) => sheet.availability.hasNarratives).length,
    organsWithRecoveryCurves: sheets.filter((sheet) => sheet.availability.hasRecoveryCurves)
      .length,
    emptySystem: sheets.length === 0,
  };
}
