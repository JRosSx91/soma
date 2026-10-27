import type { EducationalNeurotransmitter } from "../anatomy/neurotransmitter-education.js";
import type { ExploreProcessTopic } from "./explore-art.js";

export const exploreEduSheetIds = ["dopamine", "receptors"] as const;
export type ExploreEduSheetId = (typeof exploreEduSheetIds)[number];

export const exploreEduNtSheets = ["dopamine"] as const satisfies readonly EducationalNeurotransmitter[];
export const publishedExploreProcessSheets = ["receptors"] as const satisfies readonly ExploreProcessTopic[];

export const exploreEduSectionIds = {
  dopamine: [
    "what",
    "how",
    "purpose",
    "pathways",
    "drugs",
    "repeated",
    "stopping",
    "caveats",
  ],
  receptors: [
    "what",
    "how",
    "agonists",
    "transmitters",
    "drugs",
    "change",
    "tolerance",
    "caveats",
  ],
} as const;

export type ExploreEduSectionId<S extends ExploreEduSheetId> =
  (typeof exploreEduSectionIds)[S][number];

export const exploreEduRelatedSheet = {
  dopamine: "receptors",
  receptors: "dopamine",
} as const satisfies Record<ExploreEduSheetId, ExploreEduSheetId>;

/** Catalog mechanism keys that must never appear in reader-facing copy. */
export const exploreEduHiddenMechanismTokens = [
  "DAT_BLOCKADE",
  "NET_BLOCKADE",
  "SERT_BLOCKADE",
  "SERT_MODULATION",
  "GABAA_POTENTIATION",
  "NMDA_INHIBITION",
  "MESOLIMBIC_INDIRECT",
  "CB1_AGONISM",
  "CB1_PRESYNAPTIC_INDIRECT",
  "CB1_GABAergic",
  "nAChR_STIMULATION",
  "nAChR_MESOLIMBIC",
  "ADENOSINE_RECEPTOR_BLOCKADE",
  "ADENOSINE_DOPAMINE_CROSSTALK",
] as const;

export function isExploreEduSheetId(id: string): id is ExploreEduSheetId {
  return (exploreEduSheetIds as readonly string[]).includes(id);
}

export function hasExploreEduNtSheet(
  id: EducationalNeurotransmitter,
): id is (typeof exploreEduNtSheets)[number] {
  return (exploreEduNtSheets as readonly string[]).includes(id);
}

export function isPublishedExploreProcess(id: string): id is (typeof publishedExploreProcessSheets)[number] {
  return (publishedExploreProcessSheets as readonly string[]).includes(id);
}

export function exploreEduRelatedKey(id: ExploreEduSheetId): "toReceptors" | "toDopamine" {
  return exploreEduRelatedSheet[id] === "receptors" ? "toReceptors" : "toDopamine";
}
