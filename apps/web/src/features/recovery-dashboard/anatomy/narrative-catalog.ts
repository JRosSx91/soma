import type { OrganId, SubstanceId } from "@soma/shared-types";

/**
 * Read-only index of organ narratives already published in Soma 1.0.
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

/**
 * Legacy snapshot of Soma 1.0 Prisma `PHASE_RANGES` (global 0 / 1–7 / 8–56 / 57+).
 * Kept so existing tests and adapters do not drift from the seed. It is not a
 * per-substance educational clock and must not be shown as a universal calendar
 * in the atlas. Use `educational-phase-windows.ts` for optional authored ranges.
 */
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
 * Pairs that have a narrative in the seed.
 * Order is the deterministic fallback when the current substance is absent.
 */
const narrativeProfiles: readonly NarrativeProfile[] = [
  {
    organId: "liver",
    substanceId: "alcohol",
    confidenceLevel: "high",
    referenceSource: "AASLD 2019; ALF clinical reviews",
  },
  {
    organId: "kidneys",
    substanceId: "cocaine",
    confidenceLevel: "medium",
    referenceSource: "NIDA Cocaine Research Report; UpToDate renal complications",
  },
  {
    organId: "kidneys",
    substanceId: "alcohol",
    confidenceLevel: "medium",
    referenceSource: "AASLD 2019; UpToDate alcohol and renal function",
  },
  {
    organId: "pancreas",
    substanceId: "alcohol",
    confidenceLevel: "high",
    referenceSource: "NIDDK; ACG guidelines on alcoholic pancreatitis",
  },
  {
    organId: "stomach",
    substanceId: "alcohol",
    confidenceLevel: "high",
    referenceSource: "ACG guidelines on gastritis; Goodman & Gilman 14th ed.",
  },
  {
    organId: "stomach",
    substanceId: "nicotine",
    confidenceLevel: "medium",
    referenceSource: "U.S. Surgeon General 2014; clinical reviews on tobacco GI effects",
  },
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
    organId: "heart",
    substanceId: "caffeine",
    confidenceLevel: "medium",
    referenceSource: "AHA 2019 statement; Cano-Marquina et al. 2013",
  },
  {
    organId: "stomach",
    substanceId: "caffeine",
    confidenceLevel: "medium",
    referenceSource: "ACG 2020; clinical reviews on caffeine and gastric acid",
  },
  {
    organId: "intestines",
    substanceId: "alcohol",
    confidenceLevel: "medium",
    referenceSource: "Bishehsari et al. (2017); NIAAA reviews on gut-liver axis",
  },
  {
    organId: "intestines",
    substanceId: "cannabis",
    confidenceLevel: "medium",
    referenceSource: "NIDA Marijuana Research Report; CB1 and GI motility reviews",
  },
  {
    organId: "intestines",
    substanceId: "caffeine",
    confidenceLevel: "medium",
    referenceSource: "ACG 2020; clinical reviews on caffeine and colonic motility",
  },
  {
    organId: "spleen",
    substanceId: "alcohol",
    confidenceLevel: "low",
    referenceSource: "AASLD 2019; reviews on portal hypertension and splenomegaly",
  },
  {
    organId: "oral-mucosa",
    substanceId: "alcohol",
    confidenceLevel: "medium",
    referenceSource: "IARC Monographs; ADA clinical reviews on alcohol and oral health",
  },
  {
    organId: "oral-mucosa",
    substanceId: "nicotine",
    confidenceLevel: "high",
    referenceSource: "U.S. Surgeon General 2014; ADA tobacco cessation guidelines",
  },
  {
    organId: "oral-mucosa",
    substanceId: "cannabis",
    confidenceLevel: "medium",
    referenceSource: "NIDA Marijuana Research Report; ADA clinical reviews",
  },
  {
    organId: "nasal-mucosa",
    substanceId: "cocaine",
    confidenceLevel: "high",
    referenceSource: "NIDA Cocaine Research Report; ENT clinical reviews on intranasal cocaine damage",
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
  {
    organId: "teeth",
    substanceId: "alcohol",
    confidenceLevel: "low",
    referenceSource: "ADA reviews on alcohol and dental erosion; Goodman & Gilman 14th ed.",
  },
  {
    organId: "teeth",
    substanceId: "nicotine",
    confidenceLevel: "medium",
    referenceSource: "U.S. Surgeon General 2014; ADA tobacco and periodontal disease reviews",
  },
  {
    organId: "teeth",
    substanceId: "cannabis",
    confidenceLevel: "low",
    referenceSource: "ADA reviews on cannabis and oral health; limited literature",
  },
  {
    organId: "teeth",
    substanceId: "cocaine",
    confidenceLevel: "medium",
    referenceSource: "NIDA Cocaine Research Report; dental erosion from cocaine reviews",
  },
  {
    organId: "eyes",
    substanceId: "alcohol",
    confidenceLevel: "medium",
    referenceSource: "Clinical reviews on alcohol and ocular health; AAO guidelines",
  },
  {
    organId: "eyes",
    substanceId: "nicotine",
    confidenceLevel: "medium",
    referenceSource: "U.S. Surgeon General 2014; AAO reviews on smoking and macular degeneration",
  },
  {
    organId: "eyes",
    substanceId: "cannabis",
    confidenceLevel: "high",
    referenceSource: "Flach (2002); clinical reviews on cannabis and intraocular pressure",
  },
  {
    organId: "eyes",
    substanceId: "cocaine",
    confidenceLevel: "medium",
    referenceSource: "NIDA Cocaine Research Report; AAO reviews on cocaine ocular effects",
  },
  {
    organId: "skin",
    substanceId: "alcohol",
    confidenceLevel: "medium",
    referenceSource: "Clinical reviews on alcohol and dermatology; AAD guidelines",
  },
  {
    organId: "skin",
    substanceId: "cocaine",
    confidenceLevel: "medium",
    referenceSource: "NIDA Cocaine Research Report; dermatology reviews on stimulant skin effects",
  }
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
  return narrativeProfiles
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

/**
 * Legacy Spanish labels for `narrativePhaseWindows`. Unused by atlas chrome.
 * Do not wire this into Effects or Consejos.
 */
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
  const profile = narrativeProfiles.find(
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

/** Snapshot of catalogued pairs for tests and integrity checks. */
export function narrativeCatalogPairs(): ReadonlyArray<{
  organId: OrganId;
  substanceId: SubstanceId;
}> {
  return narrativeProfiles.map(({ organId, substanceId }) => ({ organId, substanceId }));
}
