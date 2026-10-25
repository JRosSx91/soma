import type { NarrativePhase } from "./narrative-catalog.ts";
import type { EducationalNeurotransmitter } from "./neurotransmitter-education.ts";

/**
 * Catalog keys whose phase paragraph includes an inseparable medical warning.
 * The full catalog sentence stays visible because splitting it would change
 * the meaning.
 *
 * Explicit list only. Do not derive this from keyword search at runtime.
 */
export const educationalNtFullPhaseCopyKeys = [
  "alcohol.gaba.acute_withdrawal",
  "alcohol.glutamate.acute_withdrawal",
] as const;

export type EducationalNtFullPhaseCopyKey = (typeof educationalNtFullPhaseCopyKeys)[number];

export function educationalNtPhaseCopyKey(
  substanceId: string,
  neurotransmitter: string,
  phase: string,
): string {
  return `${substanceId}.${neurotransmitter}.${phase}`;
}

export function keepsFullPhaseCopyVisible(
  substanceId: string,
  neurotransmitter: EducationalNeurotransmitter,
  phase: NarrativePhase,
): boolean {
  const key = educationalNtPhaseCopyKey(substanceId, neurotransmitter, phase);
  return (educationalNtFullPhaseCopyKeys as readonly string[]).includes(key);
}
