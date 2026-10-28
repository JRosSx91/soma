import type { EducationalNeurotransmitter } from "./neurotransmitter-education.ts";

/**
 * Read-only qualitative cells for Recovery 2.0.
 * Mirrors `apps/api/prisma/seed/neurotransmitter-profiles.ts`.
 * Do not edit values here unless the seed changes. Not a second scientific catalog.
 */

export const educationalNtPhases = [
  "during_use",
  "acute_withdrawal",
  "post_acute",
  "normalizing",
] as const;
export type EducationalNtPhase = (typeof educationalNtPhases)[number];

export const educationalNtSeverities = [
  "severe",
  "moderate",
  "mild",
  "normalizing",
] as const;
export type EducationalNtSeverity = (typeof educationalNtSeverities)[number];

export const educationalNtDirections = [
  "depleted",
  "elevated",
  "oscillating",
  "normalizing",
] as const;
export type EducationalNtDirection = (typeof educationalNtDirections)[number];

export const educationalNtConfidenceLevels = ["high", "medium", "low"] as const;
export type EducationalNtConfidence = (typeof educationalNtConfidenceLevels)[number];

/** Shared educational windows. Same numbers as the seed PHASE_RANGES. */
export const educationalNtPhaseWindows: Readonly<
  Record<EducationalNtPhase, { startDay: number; endDay: number | null }>
> = {
  during_use: { startDay: 0, endDay: 0 },
  acute_withdrawal: { startDay: 1, endDay: 7 },
  post_acute: { startDay: 8, endDay: 56 },
  normalizing: { startDay: 57, endDay: null },
};

export interface EducationalNtQualitativeCell {
  phase: EducationalNtPhase;
  startDay: number;
  endDay: number | null;
  severity: EducationalNtSeverity;
  direction: EducationalNtDirection;
}

export interface EducationalNtQualitativeProfile {
  substanceId: string;
  neurotransmitter: EducationalNeurotransmitter;
  mechanismKey: string;
  confidenceLevel: EducationalNtConfidence;
  cells: readonly EducationalNtQualitativeCell[];
}

function cell(
  phase: EducationalNtPhase,
  severity: EducationalNtSeverity,
  direction: EducationalNtDirection,
): EducationalNtQualitativeCell {
  const window = educationalNtPhaseWindows[phase];
  return {
    phase,
    startDay: window.startDay,
    endDay: window.endDay,
    severity,
    direction,
  };
}

export const educationalNtQualitativeProfiles: readonly EducationalNtQualitativeProfile[] = [
  {
    substanceId: "alcohol",
    neurotransmitter: "gaba",
    mechanismKey: "GABAA_POTENTIATION",
    confidenceLevel: "high",
    cells: [
      cell("during_use", "severe", "elevated"),
      cell("acute_withdrawal", "severe", "depleted"),
      cell("post_acute", "moderate", "depleted"),
      cell("normalizing", "mild", "normalizing"),
    ],
  },
  {
    substanceId: "alcohol",
    neurotransmitter: "glutamate",
    mechanismKey: "NMDA_INHIBITION",
    confidenceLevel: "high",
    cells: [
      cell("during_use", "moderate", "depleted"),
      cell("acute_withdrawal", "severe", "elevated"),
      cell("post_acute", "mild", "elevated"),
      cell("normalizing", "mild", "normalizing"),
    ],
  },
  {
    substanceId: "alcohol",
    neurotransmitter: "dopamine",
    mechanismKey: "MESOLIMBIC_INDIRECT",
    confidenceLevel: "medium",
    cells: [
      cell("during_use", "mild", "elevated"),
      cell("acute_withdrawal", "moderate", "depleted"),
      cell("post_acute", "mild", "depleted"),
      cell("normalizing", "mild", "normalizing"),
    ],
  },
  {
    substanceId: "alcohol",
    neurotransmitter: "serotonin",
    mechanismKey: "SERT_MODULATION",
    confidenceLevel: "medium",
    cells: [
      cell("during_use", "moderate", "oscillating"),
      cell("acute_withdrawal", "moderate", "depleted"),
      cell("post_acute", "mild", "normalizing"),
      cell("normalizing", "mild", "normalizing"),
    ],
  },
  {
    substanceId: "cocaine",
    neurotransmitter: "dopamine",
    mechanismKey: "DAT_BLOCKADE",
    confidenceLevel: "high",
    cells: [
      cell("during_use", "severe", "elevated"),
      cell("acute_withdrawal", "severe", "depleted"),
      cell("post_acute", "moderate", "depleted"),
      cell("normalizing", "mild", "normalizing"),
    ],
  },
  {
    substanceId: "cocaine",
    neurotransmitter: "norepinephrine",
    mechanismKey: "NET_BLOCKADE",
    confidenceLevel: "high",
    cells: [
      cell("during_use", "severe", "elevated"),
      cell("acute_withdrawal", "severe", "depleted"),
      cell("post_acute", "moderate", "oscillating"),
      cell("normalizing", "mild", "normalizing"),
    ],
  },
  {
    substanceId: "cocaine",
    neurotransmitter: "serotonin",
    mechanismKey: "SERT_BLOCKADE",
    confidenceLevel: "medium",
    cells: [
      cell("during_use", "moderate", "elevated"),
      cell("acute_withdrawal", "moderate", "depleted"),
      cell("post_acute", "mild", "depleted"),
      cell("normalizing", "mild", "normalizing"),
    ],
  },
  {
    substanceId: "nicotine",
    neurotransmitter: "acetylcholine",
    mechanismKey: "nAChR_STIMULATION",
    confidenceLevel: "high",
    cells: [
      cell("during_use", "moderate", "elevated"),
      cell("acute_withdrawal", "severe", "depleted"),
      cell("post_acute", "moderate", "depleted"),
      cell("normalizing", "mild", "normalizing"),
    ],
  },
  {
    substanceId: "nicotine",
    neurotransmitter: "dopamine",
    mechanismKey: "nAChR_MESOLIMBIC",
    confidenceLevel: "high",
    cells: [
      cell("during_use", "moderate", "elevated"),
      cell("acute_withdrawal", "moderate", "depleted"),
      cell("post_acute", "mild", "depleted"),
      cell("normalizing", "mild", "normalizing"),
    ],
  },
  {
    substanceId: "cannabis",
    neurotransmitter: "endocannabinoid",
    mechanismKey: "CB1_AGONISM",
    confidenceLevel: "high",
    cells: [
      cell("during_use", "severe", "elevated"),
      cell("acute_withdrawal", "moderate", "depleted"),
      cell("post_acute", "mild", "depleted"),
      cell("normalizing", "mild", "normalizing"),
    ],
  },
  {
    substanceId: "cannabis",
    neurotransmitter: "dopamine",
    mechanismKey: "CB1_PRESYNAPTIC_INDIRECT",
    confidenceLevel: "medium",
    cells: [
      cell("during_use", "mild", "elevated"),
      cell("acute_withdrawal", "mild", "depleted"),
      cell("post_acute", "mild", "normalizing"),
      cell("normalizing", "mild", "normalizing"),
    ],
  },
  {
    substanceId: "cannabis",
    neurotransmitter: "gaba",
    mechanismKey: "CB1_GABAergic",
    confidenceLevel: "medium",
    cells: [
      cell("during_use", "mild", "oscillating"),
      cell("acute_withdrawal", "mild", "depleted"),
      cell("post_acute", "mild", "normalizing"),
      cell("normalizing", "mild", "normalizing"),
    ],
  },
  {
    substanceId: "caffeine",
    neurotransmitter: "adenosine",
    mechanismKey: "ADENOSINE_RECEPTOR_BLOCKADE",
    confidenceLevel: "high",
    cells: [
      cell("during_use", "moderate", "depleted"),
      cell("acute_withdrawal", "severe", "elevated"),
      cell("post_acute", "moderate", "elevated"),
      cell("normalizing", "mild", "normalizing"),
    ],
  },
  {
    substanceId: "caffeine",
    neurotransmitter: "dopamine",
    mechanismKey: "ADENOSINE_DOPAMINE_CROSSTALK",
    confidenceLevel: "medium",
    cells: [
      cell("during_use", "mild", "elevated"),
      cell("acute_withdrawal", "mild", "depleted"),
      cell("post_acute", "mild", "normalizing"),
      cell("normalizing", "mild", "normalizing"),
    ],
  },
];
