import type { BodySystem } from "@soma/shared-types";
import type { AnatomySource } from "./anatomy-education.ts";
import {
  educationalSystem,
  type SystemEducationEntry,
} from "./system-education.ts";
import type { AtlasPlate, AtlasSystem } from "./atlas-types.ts";

/**
 * Typed educational sheet for an atlas system (especially empty systems).
 * Does not invent OrganId, organ narratives, or recovery curves.
 */

export interface SystemAnatomicalSheet {
  systemId: string;
  catalogSystem: BodySystem;
  systemName: string;
  /** True when the catalog lists no organs for this system. */
  emptySystem: boolean;
  organCount: number;
  location: string | null;
  anatomy: string | null;
  physiology: string | null;
  relations: string | null;
  /** System-level plate (full-body highlight), not an organ plate. */
  plate: AtlasPlate | null;
  sources: readonly AnatomySource[];
  availability: {
    hasPlate: boolean;
    hasEducation: boolean;
    /** Always false at system level: curves belong to organs. */
    hasNarratives: boolean;
    hasRecoveryCurves: boolean;
  };
  education: SystemEducationEntry | null;
}

/**
 * Resolves system education and the system plate. Never fabricates organs.
 */
export function resolveSystemSheet(system: AtlasSystem): SystemAnatomicalSheet {
  const education = educationalSystem(system.catalogSystem);
  const plate = system.plates.anterior;
  return {
    systemId: system.id,
    catalogSystem: system.catalogSystem,
    systemName: system.name,
    emptySystem: system.organs.length === 0,
    organCount: system.organs.length,
    location: education?.location ?? null,
    anatomy: education?.anatomy ?? null,
    physiology: education?.physiology ?? null,
    relations: education?.relations ?? null,
    plate,
    sources: education?.sources ?? [],
    availability: {
      hasPlate: plate !== null,
      hasEducation: education !== null,
      hasNarratives: false,
      hasRecoveryCurves: false,
    },
    education,
  };
}
