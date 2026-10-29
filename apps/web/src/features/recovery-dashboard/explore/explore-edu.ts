import type { EducationalNeurotransmitter } from "../anatomy/neurotransmitter-education.js";
import type { ExploreProcessTopic } from "./explore-art.js";

export const exploreEduProcessSheets = [
  "receptors",
  "tolerance",
  "dependence",
  "neuroadaptation",
  "metabolism",
] as const satisfies readonly ExploreProcessTopic[];

export const exploreEduSheetIds = [
  "dopamine",
  "serotonin",
  "gaba",
  "glutamate",
  "norepinephrine",
  "acetylcholine",
  "endocannabinoid",
  "endorphin",
  "adenosine",
  "receptors",
  "tolerance",
  "dependence",
  "neuroadaptation",
  "metabolism",
] as const;
export type ExploreEduSheetId = (typeof exploreEduSheetIds)[number];

export const exploreEduNtSheets = [
  "dopamine",
  "serotonin",
  "gaba",
  "glutamate",
  "norepinephrine",
  "acetylcholine",
  "endocannabinoid",
  "endorphin",
  "adenosine",
] as const satisfies readonly EducationalNeurotransmitter[];

export const publishedExploreEduNtSheets = [
  "dopamine",
  "serotonin",
  "gaba",
  "glutamate",
  "norepinephrine",
  "acetylcholine",
  "endocannabinoid",
  "endorphin",
  "adenosine",
] as const satisfies readonly (typeof exploreEduNtSheets)[number][];
export const publishedExploreProcessSheets = [
  "receptors",
  "tolerance",
  "dependence",
  "neuroadaptation",
  "metabolism",
] as const satisfies readonly ExploreProcessTopic[];
export const publishedExploreEduSheets = [
  ...publishedExploreEduNtSheets,
  ...publishedExploreProcessSheets,
] as const satisfies readonly ExploreEduSheetId[];

const ntSectionIds = [
  "what",
  "how",
  "purpose",
  "pathways",
  "drugs",
  "repeated",
  "stopping",
  "caveats",
] as const;

const processKeySectionIds = [
  "what",
  "how",
  "kinds",
  "where",
  "substances",
  "connections",
  "stopping",
  "caveats",
] as const;

export const exploreEduSectionIds = {
  dopamine: ntSectionIds,
  serotonin: ntSectionIds,
  gaba: ntSectionIds,
  glutamate: ntSectionIds,
  norepinephrine: ntSectionIds,
  acetylcholine: ntSectionIds,
  endocannabinoid: ntSectionIds,
  endorphin: ntSectionIds,
  adenosine: ntSectionIds,
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
  tolerance: processKeySectionIds,
  dependence: processKeySectionIds,
  neuroadaptation: processKeySectionIds,
  metabolism: processKeySectionIds,
} as const;

export type ExploreEduSectionId<S extends ExploreEduSheetId> =
  (typeof exploreEduSectionIds)[S][number];

export const exploreEduRelatedSheet = {
  dopamine: "receptors",
  receptors: "dopamine",
  serotonin: "receptors",
  gaba: "receptors",
  glutamate: "receptors",
  norepinephrine: "dopamine",
  acetylcholine: "receptors",
  endocannabinoid: "receptors",
  endorphin: "receptors",
  adenosine: "receptors",
  tolerance: "neuroadaptation",
  dependence: "tolerance",
  neuroadaptation: "receptors",
  metabolism: "tolerance",
} as const satisfies Record<ExploreEduSheetId, ExploreEduSheetId>;

export const exploreEduRelatedI18nKey = {
  dopamine: "toDopamine",
  receptors: "toReceptors",
  serotonin: "toSerotonin",
  gaba: "toGaba",
  glutamate: "toGlutamate",
  norepinephrine: "toNorepinephrine",
  acetylcholine: "toAcetylcholine",
  endocannabinoid: "toEndocannabinoid",
  endorphin: "toEndorphin",
  adenosine: "toAdenosine",
  tolerance: "toTolerance",
  dependence: "toDependence",
  neuroadaptation: "toNeuroadaptation",
  metabolism: "toMetabolism",
} as const satisfies Record<ExploreEduSheetId, string>;

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

export function isExploreEduNtSheetId(
  id: string,
): id is (typeof exploreEduNtSheets)[number] {
  return (exploreEduNtSheets as readonly string[]).includes(id);
}

export function hasExploreEduNtSheet(
  id: EducationalNeurotransmitter,
): id is (typeof exploreEduNtSheets)[number] {
  return isExploreEduNtSheetId(id);
}

export function isPublishedExploreEduNtSheet(
  id: string,
): id is (typeof publishedExploreEduNtSheets)[number] {
  return (publishedExploreEduNtSheets as readonly string[]).includes(id);
}

export function isPublishedExploreProcess(id: string): id is (typeof publishedExploreProcessSheets)[number] {
  return (publishedExploreProcessSheets as readonly string[]).includes(id);
}

export function isPublishedExploreEduSheet(id: string): id is (typeof publishedExploreEduSheets)[number] {
  return (publishedExploreEduSheets as readonly string[]).includes(id);
}

export function exploreEduRelatedKey(id: ExploreEduSheetId): (typeof exploreEduRelatedI18nKey)[ExploreEduSheetId] {
  return exploreEduRelatedI18nKey[exploreEduRelatedSheet[id]];
}
