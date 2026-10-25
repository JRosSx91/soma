import type { SubstanceId } from "@soma/shared-types";
import { narrativePhases, type NarrativePhase } from "./narrative-catalog.ts";

/**
 * Educational withdrawal-symptom catalog for a later Explorar surface.
 *
 * Candidates are authored here. The public catalog is assembled separately
 * and stays empty until clinical review and public copy are explicit.
 * This module does not author organ narratives, achievements, Consejos
 * drafts, recovery curves, or `/me` state. It does not scan source prose
 * for keywords at runtime.
 */

export const withdrawalSymptomKinds = ["subjective", "warning"] as const;
export type WithdrawalSymptomKind = (typeof withdrawalSymptomKinds)[number];

export const withdrawalSymptomEditorialStatuses = [
  "draft",
  "pending_clinical_review",
  "clinically_reviewed",
] as const;
export type WithdrawalSymptomEditorialStatus = (typeof withdrawalSymptomEditorialStatuses)[number];

export const withdrawalSymptomClinicalReviews = ["pending", "reviewed"] as const;
export type WithdrawalSymptomClinicalReview = (typeof withdrawalSymptomClinicalReviews)[number];

export type NonEmptyReadonly<T> = readonly [T, ...T[]];

export const withdrawalSymptomSourceNamespace = "neurotransmitter-phases" as const;

export interface WithdrawalSymptomSourceRef {
  namespace: typeof withdrawalSymptomSourceNamespace;
  keys: NonEmptyReadonly<string>;
}

export interface EducationalWithdrawalSymptomItem {
  id: string;
  substanceId: SubstanceId;
  symptomId: string;
  phases: NonEmptyReadonly<NarrativePhase>;
  source: WithdrawalSymptomSourceRef;
  kind: WithdrawalSymptomKind;
  editorialStatus: WithdrawalSymptomEditorialStatus;
  clinicalReview: WithdrawalSymptomClinicalReview;
  nameKey: string;
  shortDescriptionKey: string;
}

export interface WithdrawalSymptomPublicCopyBundles {
  en: unknown;
  es: unknown;
}

export interface EducationalWithdrawalSymptomResolution {
  substanceId: string;
  phase: string;
  items: readonly EducationalWithdrawalSymptomItem[];
  empty: boolean;
}

export const withdrawalSymptomI18nPublicationContract = {
  keys: ["nameKey", "shortDescriptionKey"] as const,
  locales: ["en", "es"] as const,
  fallback: null,
  enforcedWhen: "published-catalog-assembly",
} as const;

const CANONICAL_SUBSTANCE_IDS: readonly SubstanceId[] = [
  "alcohol",
  "nicotine",
  "cannabis",
  "cocaine",
  "caffeine",
];

function candidate(
  substanceId: SubstanceId,
  symptomId: string,
  phases: NonEmptyReadonly<NarrativePhase>,
  sourceKeys: NonEmptyReadonly<string>,
  kind: WithdrawalSymptomKind = "subjective",
): EducationalWithdrawalSymptomItem {
  const id = `${substanceId}.${symptomId}`;
  return {
    id,
    substanceId,
    symptomId,
    phases,
    source: { namespace: withdrawalSymptomSourceNamespace, keys: sourceKeys },
    kind,
    editorialStatus: "pending_clinical_review",
    clinicalReview: "pending",
    nameKey: `${id}.name`,
    shortDescriptionKey: `${id}.shortDescription`,
  };
}

/**
 * Editorial candidates. Deduplicated across neurotransmitters of one
 * substance. Not shown by the public resolver.
 */
export const authoredWithdrawalSymptomCatalog: readonly EducationalWithdrawalSymptomItem[] = [
  candidate("alcohol", "anxiety", ["acute_withdrawal", "post_acute"], [
    "alcohol.gaba.acute_withdrawal",
    "alcohol.gaba.post_acute",
  ]),
  candidate("alcohol", "restlessness", ["acute_withdrawal"], [
    "alcohol.gaba.acute_withdrawal",
    "alcohol.glutamate.acute_withdrawal",
  ]),
  candidate("alcohol", "sleep_disturbance", ["acute_withdrawal", "post_acute"], [
    "alcohol.gaba.acute_withdrawal",
    "alcohol.gaba.post_acute",
  ]),
  candidate("alcohol", "tremor", ["acute_withdrawal"], ["alcohol.gaba.acute_withdrawal"]),
  candidate(
    "alcohol",
    "seizures",
    ["acute_withdrawal"],
    ["alcohol.gaba.acute_withdrawal", "alcohol.glutamate.acute_withdrawal"],
    "warning",
  ),
  candidate(
    "alcohol",
    "medical_care",
    ["acute_withdrawal"],
    ["alcohol.gaba.acute_withdrawal", "alcohol.glutamate.acute_withdrawal"],
    "warning",
  ),
  candidate("alcohol", "stimulus_hypersensitivity", ["acute_withdrawal"], [
    "alcohol.glutamate.acute_withdrawal",
  ]),
  candidate("alcohol", "racing_thoughts", ["acute_withdrawal"], [
    "alcohol.glutamate.acute_withdrawal",
  ]),
  candidate("alcohol", "low_mood", ["acute_withdrawal"], [
    "alcohol.dopamine.acute_withdrawal",
    "alcohol.serotonin.acute_withdrawal",
  ]),
  candidate("alcohol", "anhedonia", ["acute_withdrawal"], ["alcohol.dopamine.acute_withdrawal"]),
  candidate("alcohol", "irritability", ["acute_withdrawal", "post_acute"], [
    "alcohol.serotonin.acute_withdrawal",
    "alcohol.glutamate.post_acute",
  ]),
  candidate("alcohol", "appetite_changes", ["acute_withdrawal"], [
    "alcohol.serotonin.acute_withdrawal",
  ]),
  candidate("alcohol", "noise_sensitivity", ["post_acute"], ["alcohol.glutamate.post_acute"]),
  candidate("alcohol", "emotional_reactivity", ["post_acute"], ["alcohol.gaba.post_acute"]),

  candidate("cocaine", "anhedonia", ["acute_withdrawal", "post_acute"], [
    "cocaine.dopamine.acute_withdrawal",
    "cocaine.dopamine.post_acute",
  ]),
  candidate("cocaine", "fatigue", ["acute_withdrawal"], [
    "cocaine.dopamine.acute_withdrawal",
    "cocaine.norepinephrine.acute_withdrawal",
  ]),
  candidate("cocaine", "hypersomnia", ["acute_withdrawal"], ["cocaine.dopamine.acute_withdrawal"]),
  candidate("cocaine", "disrupted_sleep", ["acute_withdrawal", "post_acute"], [
    "cocaine.norepinephrine.acute_withdrawal",
    "cocaine.norepinephrine.post_acute",
  ]),
  candidate("cocaine", "craving", ["acute_withdrawal", "post_acute"], [
    "cocaine.dopamine.acute_withdrawal",
    "cocaine.dopamine.post_acute",
  ]),
  candidate("cocaine", "restlessness", ["acute_withdrawal"], [
    "cocaine.norepinephrine.acute_withdrawal",
  ]),
  candidate("cocaine", "dysphoria", ["acute_withdrawal"], ["cocaine.serotonin.acute_withdrawal"]),
  candidate("cocaine", "irritability", ["acute_withdrawal"], ["cocaine.serotonin.acute_withdrawal"]),
  candidate("cocaine", "emotional_reactivity", ["acute_withdrawal"], [
    "cocaine.serotonin.acute_withdrawal",
  ]),
  candidate("cocaine", "uneven_energy", ["post_acute"], ["cocaine.norepinephrine.post_acute"]),

  candidate("nicotine", "irritability", ["acute_withdrawal"], [
    "nicotine.acetylcholine.acute_withdrawal",
  ]),
  candidate("nicotine", "concentration_difficulty", ["acute_withdrawal", "post_acute"], [
    "nicotine.acetylcholine.acute_withdrawal",
    "nicotine.acetylcholine.post_acute",
  ]),
  candidate("nicotine", "restlessness", ["acute_withdrawal"], [
    "nicotine.acetylcholine.acute_withdrawal",
  ]),
  candidate("nicotine", "craving", ["acute_withdrawal", "post_acute"], [
    "nicotine.acetylcholine.acute_withdrawal",
    "nicotine.acetylcholine.post_acute",
  ]),
  candidate("nicotine", "low_mood", ["acute_withdrawal"], ["nicotine.dopamine.acute_withdrawal"]),
  candidate("nicotine", "anhedonia", ["acute_withdrawal"], ["nicotine.dopamine.acute_withdrawal"]),

  candidate("cannabis", "irritability", ["acute_withdrawal", "post_acute"], [
    "cannabis.endocannabinoid.acute_withdrawal",
    "cannabis.endocannabinoid.post_acute",
  ]),
  candidate("cannabis", "sleep_disturbance", ["acute_withdrawal", "post_acute"], [
    "cannabis.endocannabinoid.acute_withdrawal",
    "cannabis.endocannabinoid.post_acute",
  ]),
  candidate("cannabis", "vivid_dreams", ["acute_withdrawal"], [
    "cannabis.endocannabinoid.acute_withdrawal",
  ]),
  candidate("cannabis", "anxiety", ["acute_withdrawal", "post_acute"], [
    "cannabis.endocannabinoid.acute_withdrawal",
    "cannabis.endocannabinoid.post_acute",
  ]),
  candidate("cannabis", "decreased_appetite", ["acute_withdrawal"], [
    "cannabis.endocannabinoid.acute_withdrawal",
  ]),

  candidate("caffeine", "headache", ["acute_withdrawal", "post_acute"], [
    "caffeine.adenosine.acute_withdrawal",
    "caffeine.adenosine.post_acute",
  ]),
  candidate("caffeine", "fatigue", ["acute_withdrawal", "post_acute"], [
    "caffeine.adenosine.acute_withdrawal",
    "caffeine.adenosine.post_acute",
  ]),
  candidate("caffeine", "drowsiness", ["acute_withdrawal"], ["caffeine.adenosine.acute_withdrawal"]),
  candidate("caffeine", "concentration_difficulty", ["acute_withdrawal", "post_acute"], [
    "caffeine.adenosine.acute_withdrawal",
    "caffeine.adenosine.post_acute",
  ]),
  candidate("caffeine", "irritability", ["acute_withdrawal"], [
    "caffeine.adenosine.acute_withdrawal",
  ]),
];

export function isCanonicalWithdrawalSubstance(id: string): id is SubstanceId {
  return (CANONICAL_SUBSTANCE_IDS as readonly string[]).includes(id);
}

export function isWithdrawalSymptomPublishable(item: EducationalWithdrawalSymptomItem): boolean {
  if (item.editorialStatus !== "clinically_reviewed") return false;
  if (item.clinicalReview !== "reviewed") return false;
  if (item.kind === "warning" && item.clinicalReview !== "reviewed") return false;
  return true;
}

export function lookupWithdrawalSymptomCopyLeaf(tree: unknown, key: string): string | null {
  if (!key.trim() || key.includes(" ")) return null;
  let current: unknown = tree;
  for (const part of key.split(".")) {
    if (!part || !current || typeof current !== "object" || Array.isArray(current)) {
      return null;
    }
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current !== "string") return null;
  const value = current.trim();
  if (!value || value === key) return null;
  return value;
}

export function hasCompletePublicWithdrawalSymptomCopy(
  item: EducationalWithdrawalSymptomItem,
  bundles: WithdrawalSymptomPublicCopyBundles,
): boolean {
  for (const locale of withdrawalSymptomI18nPublicationContract.locales) {
    const name = lookupWithdrawalSymptomCopyLeaf(bundles[locale], item.nameKey);
    const description = lookupWithdrawalSymptomCopyLeaf(bundles[locale], item.shortDescriptionKey);
    if (!name || !description) return false;
  }
  return true;
}

export function isWithdrawalSymptomReadyForPublishedCatalog(
  item: EducationalWithdrawalSymptomItem,
  bundles: WithdrawalSymptomPublicCopyBundles,
): boolean {
  return isWithdrawalSymptomPublishable(item) && hasCompletePublicWithdrawalSymptomCopy(item, bundles);
}

export function assemblePublishedWithdrawalSymptomCatalog(
  candidates: readonly EducationalWithdrawalSymptomItem[],
  bundles: WithdrawalSymptomPublicCopyBundles,
): readonly EducationalWithdrawalSymptomItem[] {
  const seen = new Set<string>();
  const items: EducationalWithdrawalSymptomItem[] = [];
  for (const item of candidates) {
    if (!item.id || seen.has(item.id)) continue;
    if (!isWithdrawalSymptomReadyForPublishedCatalog(item, bundles)) continue;
    seen.add(item.id);
    items.push(item);
  }
  return items;
}

/** Empty public copy. Candidate sidecar JSON is not this bundle. */
export const publishedWithdrawalSymptomCopyBundles: WithdrawalSymptomPublicCopyBundles = {
  en: {},
  es: {},
};

export const publishedWithdrawalSymptomCatalog: readonly EducationalWithdrawalSymptomItem[] =
  assemblePublishedWithdrawalSymptomCatalog(
    authoredWithdrawalSymptomCatalog,
    publishedWithdrawalSymptomCopyBundles,
  );

function isNarrativePhase(phase: string): phase is NarrativePhase {
  return (narrativePhases as readonly string[]).includes(phase);
}

/**
 * Public resolver. Defaults to the assembled published catalog.
 * Pending review never survives, even if a caller injects authored rows.
 */
export function resolveEducationalWithdrawalSymptoms(
  substanceId: string,
  phase: string,
  catalog: readonly EducationalWithdrawalSymptomItem[] = publishedWithdrawalSymptomCatalog,
): EducationalWithdrawalSymptomResolution {
  if (!isCanonicalWithdrawalSubstance(substanceId) || !isNarrativePhase(phase)) {
    return { substanceId, phase, items: [], empty: true };
  }

  const items = catalog.filter(
    (item) =>
      isWithdrawalSymptomPublishable(item) &&
      item.substanceId === substanceId &&
      item.phases.includes(phase),
  );

  return { substanceId, phase, items, empty: items.length === 0 };
}
