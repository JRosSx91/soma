import type { OrganId, SubstanceId } from "@soma/shared-types";

/**
 * Read-only index for the respiratory narratives already published in Soma 1.0.
 *
 * The prose stays in `organ-narrative` (`órgano.sustancia.fase`).
 * Confidence and source mirror `apps/api/prisma/seed/organ-narratives.ts`.
 * This module does not estimate personal recovery.
 */

export const narrativePhases = [
  "during_use",
  "acute_withdrawal",
  "post_acute",
  "normalizing",
] as const;

export type NarrativePhase = (typeof narrativePhases)[number];

export type NarrativeConfidence = "high" | "medium" | "low";

/** Day windows shared by every narrative profile. They are not a recovery curve. */
export const narrativePhaseWindows: Record<
  NarrativePhase,
  { startDay: number; endDay: number | null }
> = {
  during_use: { startDay: 0, endDay: 0 },
  acute_withdrawal: { startDay: 1, endDay: 7 },
  post_acute: { startDay: 8, endDay: 56 },
  normalizing: { startDay: 57, endDay: null },
};

const confidenceLabel: Record<NarrativeConfidence, string> = {
  high: "alta",
  medium: "media",
  low: "baja",
};

interface NarrativeProfile {
  organId: OrganId;
  substanceId: SubstanceId;
  confidenceLevel: NarrativeConfidence;
  referenceSource: string;
}

/**
 * Respiratory pairs that have a narrative in the seed.
 * Order is the deterministic fallback when the current substance is absent.
 */
const respiratoryProfiles: readonly NarrativeProfile[] = [
  {
    organId: "lungs",
    substanceId: "nicotine",
    confidenceLevel: "high",
    referenceSource: "U.S. Surgeon General 2020; ATS guidelines",
  },
  {
    organId: "lungs",
    substanceId: "cannabis",
    confidenceLevel: "medium",
    referenceSource: "NIDA Marijuana Research Report; ATS clinical reviews",
  },
  {
    organId: "bronchi",
    substanceId: "nicotine",
    confidenceLevel: "high",
    referenceSource: "U.S. Surgeon General 2020; ATS guidelines",
  },
  {
    organId: "bronchi",
    substanceId: "cannabis",
    confidenceLevel: "medium",
    referenceSource: "NIDA Marijuana Research Report",
  },
  {
    organId: "nasal-mucosa",
    substanceId: "cocaine",
    confidenceLevel: "high",
    referenceSource:
      "NIDA Cocaine Research Report; ENT clinical reviews on intranasal cocaine damage",
  },
  {
    organId: "nasal-mucosa",
    substanceId: "nicotine",
    confidenceLevel: "medium",
    referenceSource: "U.S. Surgeon General 2014; ENT reviews on tobacco nasal effects",
  },
  {
    organId: "nasal-mucosa",
    substanceId: "cannabis",
    confidenceLevel: "low",
    referenceSource: "NIDA Marijuana Research Report; limited literature on nasal effects",
  },
];

export interface EducationalNarrative {
  organId: OrganId;
  substanceId: SubstanceId;
  phase: NarrativePhase;
  narrativeKey: string;
  confidenceLevel: NarrativeConfidence;
  confidenceLabel: string;
  referenceSource: string;
  personalized: false;
}

export function narrativeSubstances(organId: string): SubstanceId[] {
  return respiratoryProfiles
    .filter((profile) => profile.organId === organId)
    .map((profile) => profile.substanceId);
}

/**
 * Keeps `current` when that substance has a narrative for the organ.
 * Otherwise returns the first catalogued substance, or null when the organ has none.
 */
export function selectNarrativeSubstance(
  current: string | null,
  organId: string,
): SubstanceId | null {
  const available = narrativeSubstances(organId);
  if (available.length === 0) return null;
  if (current && available.includes(current as SubstanceId)) {
    return current as SubstanceId;
  }
  return available[0] ?? null;
}

/** Compact day range. The phase name itself comes from `phases.json`. */
export function phaseWindowLabel(phase: NarrativePhase): string | null {
  if (phase === "acute_withdrawal") return "Días 1–7";
  if (phase === "post_acute") return "Días 8–56";
  if (phase === "normalizing") return "Desde el día 57";
  return null;
}

export function resolveEducationalNarrative(
  organId: string,
  substanceId: string,
  phase: NarrativePhase,
): EducationalNarrative | null {
  const profile = respiratoryProfiles.find(
    (item) => item.organId === organId && item.substanceId === substanceId,
  );
  if (!profile) return null;
  if (!narrativePhases.includes(phase)) return null;

  return {
    organId: profile.organId,
    substanceId: profile.substanceId,
    phase,
    narrativeKey: `${profile.organId}.${profile.substanceId}.${phase}`,
    confidenceLevel: profile.confidenceLevel,
    confidenceLabel: confidenceLabel[profile.confidenceLevel],
    referenceSource: profile.referenceSource,
    personalized: false,
  };
}
