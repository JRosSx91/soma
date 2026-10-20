import type { SubstanceId } from "@soma/shared-types";
import enMechanisms from "../../../i18n/locales/en/mechanisms.json" with { type: "json" };
import enPhases from "../../../i18n/locales/en/neurotransmitter-phases.json" with { type: "json" };
import { narrativePhases, narrativeSubstances, type NarrativePhase } from "./narrative-catalog.ts";

/**
 * Educational neurotransmitter index for the atlas Effects tab.
 *
 * Profiles mirror `apps/api/prisma/seed/neurotransmitter-profiles.ts`
 * (substance × neurotransmitter × mechanismKey only).
 * Organ mapping mirrors `apps/api/src/neurotransmitter-state/organ-neurotransmitter-map.ts`.
 * This module does not estimate personal recovery or compose `/me` state.
 */

export type EducationalNeurotransmitter =
  | "dopamine"
  | "serotonin"
  | "gaba"
  | "glutamate"
  | "acetylcholine"
  | "norepinephrine"
  | "endocannabinoid"
  | "endorphin"
  | "adenosine";

interface EducationalNtProfile {
  substanceId: SubstanceId;
  neurotransmitter: EducationalNeurotransmitter;
  mechanismKey: string;
}

/**
 * Snapshot of the API organ map. Do not add organs or transmitters here
 * unless the scientific map is updated in a dedicated change.
 */
export const educationalOrganNeurotransmitters: Readonly<
  Record<string, readonly EducationalNeurotransmitter[]>
> = {
  "brain-prefrontal-cortex": ["dopamine", "serotonin", "norepinephrine", "adenosine"],
  "brain-vta": ["dopamine", "gaba"],
  "brain-nucleus-accumbens": ["dopamine", "endocannabinoid", "endorphin"],
  "brain-amygdala": ["gaba", "norepinephrine", "serotonin"],
  "brain-hippocampus": ["glutamate", "acetylcholine", "adenosine"],
  heart: ["norepinephrine", "adenosine"],
};

/**
 * The 14 seeded substance × neurotransmitter profiles.
 * Mechanism keys only; severity and direction stay out of the atlas.
 */
export const educationalNtProfiles: readonly EducationalNtProfile[] = [
  { substanceId: "alcohol", neurotransmitter: "gaba", mechanismKey: "GABAA_POTENTIATION" },
  { substanceId: "alcohol", neurotransmitter: "glutamate", mechanismKey: "NMDA_INHIBITION" },
  { substanceId: "alcohol", neurotransmitter: "dopamine", mechanismKey: "MESOLIMBIC_INDIRECT" },
  { substanceId: "alcohol", neurotransmitter: "serotonin", mechanismKey: "SERT_MODULATION" },
  { substanceId: "cocaine", neurotransmitter: "dopamine", mechanismKey: "DAT_BLOCKADE" },
  { substanceId: "cocaine", neurotransmitter: "norepinephrine", mechanismKey: "NET_BLOCKADE" },
  { substanceId: "cocaine", neurotransmitter: "serotonin", mechanismKey: "SERT_BLOCKADE" },
  { substanceId: "nicotine", neurotransmitter: "acetylcholine", mechanismKey: "nAChR_STIMULATION" },
  { substanceId: "nicotine", neurotransmitter: "dopamine", mechanismKey: "nAChR_MESOLIMBIC" },
  { substanceId: "cannabis", neurotransmitter: "endocannabinoid", mechanismKey: "CB1_AGONISM" },
  { substanceId: "cannabis", neurotransmitter: "dopamine", mechanismKey: "CB1_PRESYNAPTIC_INDIRECT" },
  { substanceId: "cannabis", neurotransmitter: "gaba", mechanismKey: "CB1_GABAergic" },
  { substanceId: "caffeine", neurotransmitter: "adenosine", mechanismKey: "ADENOSINE_RECEPTOR_BLOCKADE" },
  { substanceId: "caffeine", neurotransmitter: "dopamine", mechanismKey: "ADENOSINE_DOPAMINE_CROSSTALK" },
];

export interface EducationalSignalingEntry {
  neurotransmitter: EducationalNeurotransmitter;
  mechanismKey: string | null;
  phase: NarrativePhase;
  phaseKey: string;
}

type PhaseBundle = Record<string, Record<string, Record<string, string>>>;

function phaseCopy(
  substanceId: string,
  neurotransmitter: string,
  phase: NarrativePhase,
): string | undefined {
  const text = (enPhases as PhaseBundle)[substanceId]?.[neurotransmitter]?.[phase];
  return typeof text === "string" && text.trim().length > 0 ? text : undefined;
}

function validMechanismKey(key: string): string | null {
  if (!(key in enMechanisms)) return null;
  return key;
}

/**
 * Strict intersection: organ map ∩ substance profile ∩ educational phase copy.
 * Never unions those sets. Never infers from system membership.
 */
export function resolveEducationalSignaling(
  organId: string,
  substanceId: string,
  phase: NarrativePhase,
): EducationalSignalingEntry[] {
  if (!narrativePhases.includes(phase)) return [];
  const organNts = educationalOrganNeurotransmitters[organId];
  if (!organNts || organNts.length === 0) return [];

  const seen = new Set<EducationalNeurotransmitter>();
  const entries: EducationalSignalingEntry[] = [];

  for (const neurotransmitter of organNts) {
    if (seen.has(neurotransmitter)) continue;
    const profile = educationalNtProfiles.find(
      (item) => item.substanceId === substanceId && item.neurotransmitter === neurotransmitter,
    );
    if (!profile) continue;
    if (!phaseCopy(substanceId, neurotransmitter, phase)) continue;
    seen.add(neurotransmitter);
    entries.push({
      neurotransmitter,
      mechanismKey: validMechanismKey(profile.mechanismKey),
      phase,
      phaseKey: `${substanceId}.${neurotransmitter}.${phase}`,
    });
  }

  return entries;
}

export function signalingSubstances(organId: string): SubstanceId[] {
  const seen = new Set<SubstanceId>();
  const ids: SubstanceId[] = [];
  for (const profile of educationalNtProfiles) {
    if (seen.has(profile.substanceId)) continue;
    if (resolveEducationalSignaling(organId, profile.substanceId, "during_use").length === 0) {
      continue;
    }
    seen.add(profile.substanceId);
    ids.push(profile.substanceId);
  }
  return ids;
}

/** Substances that have either an organ narrative or compatible signaling. */
export function educationalEffectsSubstances(organId: string): SubstanceId[] {
  const seen = new Set<SubstanceId>();
  const ids: SubstanceId[] = [];
  for (const id of [...narrativeSubstances(organId), ...signalingSubstances(organId)]) {
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

export function selectEducationalEffectsSubstance(
  current: string | null,
  organId: string,
): SubstanceId | null {
  const available = educationalEffectsSubstances(organId);
  if (available.length === 0) return null;
  if (current && available.includes(current as SubstanceId)) {
    return current as SubstanceId;
  }
  return available[0] ?? null;
}
