import type { SubstanceId } from "@soma/shared-types";
import type {
  AdviceCategory,
  EducationalAdviceItem,
  NonEmptyReadonly,
} from "./advice-catalog.ts";
import type { NarrativePhase } from "./narrative-catalog.ts";

/**
 * Editorial sidecar for unpublished advice drafts.
 *
 * This module is not imported by `advice-catalog.ts`, the public resolver,
 * or atlas UI. Records here are never a default catalog for Consejos.
 *
 * Copy lives in `advice-drafts.en.json` / `advice-drafts.es.json` (not runtime i18n).
 * Keys: `draft.advice.<itemId>.title` | `.body`, plus `draft.advice.meta.preliminaryPhases`.
 * `titleKey` / `bodyKey` are those paths, never the clinical prose.
 *
 * sourceHint is stored as a pending bibliographic hint, never as a verified reference.
 */

export interface DraftAdviceReferenceDetails {
  url?: string;
  title?: string;
  institution?: string;
  /** ISO date (YYYY-MM-DD). Editorial access metadata, not evidence. */
  accessedAt?: string;
}

export const advicePresentationPriorities = ["routine", "emphasized"] as const;
export type AdvicePresentationPriority = (typeof advicePresentationPriorities)[number];

export interface DraftAdviceRecord {
  item: EducationalAdviceItem;
  referenceDetails?: DraftAdviceReferenceDetails;
  applicabilityNotesKey?: string;
  audienceLimitationsKey?: string;
  presentationPriority?: AdvicePresentationPriority;
}

export const draftAdviceI18nKeyPrefix = "draft.advice";
export const PRELIMINARY_PHASES_KEY = `${draftAdviceI18nKeyPrefix}.meta.preliminaryPhases`;

/**
 * Editorial shortlist for a later priority discussion.
 * Does not change `category` or `presentationPriority`.
 * `seek_help` is not treated as an emergency by this list.
 */
export const draftsForFuturePriorityReview = [
  "alcohol.withdrawal.emergency",
  "alcohol.overdose.emergency",
  "cocaine.intoxication.chest_pain",
  "cocaine.intoxication.neurological",
  "cocaine.withdrawal.mood",
] as const;

function substancePhaseDraft(
  id: string,
  category: AdviceCategory,
  substanceId: SubstanceId,
  phases: NonEmptyReadonly<NarrativePhase>,
  sourceHint: string,
  referenceDetails?: DraftAdviceReferenceDetails,
): DraftAdviceRecord {
  return {
    item: {
      id,
      category,
      scope: "substance_phase",
      substanceIds: [substanceId],
      phases,
      titleKey: `${draftAdviceI18nKeyPrefix}.${id}.title`,
      bodyKey: `${draftAdviceI18nKeyPrefix}.${id}.body`,
      reference: { source: sourceHint, status: "pending" },
      editorialStatus: "pending_clinical_review",
      personalized: false,
    },
    applicabilityNotesKey: PRELIMINARY_PHASES_KEY,
    presentationPriority: "routine",
    ...(referenceDetails ? { referenceDetails } : {}),
  };
}

/** Date of the 9B.5/9B.6 source fetches in this project, not a publication date. */
const CONSULTED = "2026-10-21";

const niceCg100 = {
  title: "Alcohol-use disorders: diagnosis and management of physical complications — Recommendations",
  url: "https://www.nice.org.uk/guidance/cg100/chapter/recommendations",
  institution: "NICE",
  accessedAt: CONSULTED,
} as const;

const niaaaOverdose = {
  title: "Understanding the Dangers of Alcohol Overdose",
  url: "https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/understanding-dangers-of-alcohol-overdose",
  institution: "NIAAA",
  accessedAt: CONSULTED,
} as const;

const niaaaInteractions = {
  title: "Alcohol-Medication Interactions: Potentially Dangerous Mixes",
  url: "https://www.niaaa.nih.gov/health-professionals-communities/core-resource-on-alcohol/alcohol-medication-interactions-potentially-dangerous-mixes",
  institution: "NIAAA",
  accessedAt: CONSULTED,
} as const;

const whoTobacco2024 = {
  title: "WHO clinical treatment guideline for tobacco cessation in adults",
  url: "https://www.who.int/publications/i/item/9789240096431",
  institution: "World Health Organization",
  accessedAt: CONSULTED,
} as const;

const cdcWithdrawal = {
  title: "7 Common Withdrawal Symptoms",
  url: "https://www.cdc.gov/tobacco/campaign/tips/quit-smoking/7-common-withdrawal-symptoms/index.html",
  institution: "CDC",
  accessedAt: CONSULTED,
} as const;

const nidaCannabis = {
  title: "Cannabis (Marijuana)",
  url: "https://nida.nih.gov/research-topics/cannabis-marijuana",
  institution: "NIDA",
  accessedAt: CONSULTED,
} as const;

const asamStud = {
  title: "The ASAM/AAAP Clinical Practice Guideline on the Management of Stimulant Use Disorder",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11105801/",
  institution: "ASAM/AAAP",
  accessedAt: CONSULTED,
} as const;

const vanAmsterdam2024 = {
  title: "Cardiovascular Risks of Simultaneous Use of Alcohol and Cocaine—A Systematic Review",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10935323/",
  institution: "Journal of Clinical Medicine",
  accessedAt: CONSULTED,
} as const;

const fdaCaffeine = {
  title: "Spilling the Beans: How Much Caffeine is Too Much?",
  url: "https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much",
  institution: "FDA",
  accessedAt: CONSULTED,
} as const;

const medlineCaffeine = {
  title: "Caffeine",
  url: "https://medlineplus.gov/caffeine.html",
  institution: "MedlinePlus",
  accessedAt: CONSULTED,
} as const;

/** Unpublished editorial lane. Not for `resolveEducationalAdvice`. */
export const draftAdviceCatalog: readonly DraftAdviceRecord[] = [
  substancePhaseDraft(
    "alcohol.withdrawal.assessment",
    "safety",
    "alcohol",
    ["during_use", "acute_withdrawal"],
    "NICE CG100",
    niceCg100,
  ),
  substancePhaseDraft(
    "alcohol.withdrawal.emergency",
    "seek_help",
    "alcohol",
    ["acute_withdrawal", "post_acute"],
    "NICE CG100",
    niceCg100,
  ),
  substancePhaseDraft(
    "alcohol.overdose.emergency",
    "seek_help",
    "alcohol",
    ["during_use"],
    "NIAAA",
    niaaaOverdose,
  ),
  substancePhaseDraft(
    "alcohol.interactions.sedatives",
    "safety",
    "alcohol",
    ["during_use"],
    "NIAAA",
    niaaaInteractions,
  ),
  substancePhaseDraft(
    "alcohol.withdrawal.nutrition",
    "seek_help",
    "alcohol",
    ["during_use", "acute_withdrawal"],
    "NICE CG100",
    niceCg100,
  ),
  substancePhaseDraft(
    "nicotine.cessation.support",
    "seek_help",
    "nicotine",
    ["during_use", "acute_withdrawal", "post_acute", "normalizing"],
    "WHO 2024",
    whoTobacco2024,
  ),
  substancePhaseDraft(
    "nicotine.withdrawal.cravings",
    "self_care",
    "nicotine",
    ["acute_withdrawal", "post_acute"],
    "CDC",
    cdcWithdrawal,
  ),
  substancePhaseDraft(
    "nicotine.withdrawal.sleep",
    "self_care",
    "nicotine",
    ["acute_withdrawal", "post_acute"],
    "CDC",
    cdcWithdrawal,
  ),
  substancePhaseDraft(
    "nicotine.withdrawal.mood",
    "seek_help",
    "nicotine",
    ["acute_withdrawal", "post_acute"],
    "CDC",
    cdcWithdrawal,
  ),
  substancePhaseDraft(
    "nicotine.cessation.triggers",
    "self_care",
    "nicotine",
    ["during_use", "acute_withdrawal", "post_acute", "normalizing"],
    "CDC",
    cdcWithdrawal,
  ),
  substancePhaseDraft(
    "cannabis.withdrawal.symptoms",
    "safety",
    "cannabis",
    ["acute_withdrawal", "post_acute"],
    "NIDA",
    nidaCannabis,
  ),
  substancePhaseDraft(
    "cannabis.recovery.support",
    "seek_help",
    "cannabis",
    ["during_use", "acute_withdrawal", "post_acute", "normalizing"],
    "NIDA",
    nidaCannabis,
  ),
  substancePhaseDraft(
    "cannabis.withdrawal.sleep",
    "self_care",
    "cannabis",
    ["acute_withdrawal", "post_acute"],
    "NIDA",
    nidaCannabis,
  ),
  substancePhaseDraft(
    "cannabis.withdrawal.mood",
    "seek_help",
    "cannabis",
    ["acute_withdrawal", "post_acute"],
    "NIDA",
    nidaCannabis,
  ),
  substancePhaseDraft(
    "cannabis.mental_health.support",
    "seek_help",
    "cannabis",
    ["during_use", "acute_withdrawal", "post_acute", "normalizing"],
    "NIDA",
    nidaCannabis,
  ),
  substancePhaseDraft(
    "cocaine.intoxication.chest_pain",
    "seek_help",
    "cocaine",
    ["during_use"],
    "ASAM/AAAP",
    asamStud,
  ),
  substancePhaseDraft(
    "cocaine.intoxication.neurological",
    "seek_help",
    "cocaine",
    ["during_use"],
    "ASAM/AAAP",
    asamStud,
  ),
  substancePhaseDraft(
    "cocaine.alcohol.interaction",
    "safety",
    "cocaine",
    ["during_use"],
    "van Amsterdam et al. J Clin Med. 2024;13(5):1475",
    vanAmsterdam2024,
  ),
  substancePhaseDraft(
    "cocaine.recovery.behavioral_support",
    "seek_help",
    "cocaine",
    ["during_use", "acute_withdrawal", "post_acute", "normalizing"],
    "ASAM/AAAP",
    asamStud,
  ),
  substancePhaseDraft(
    "cocaine.withdrawal.mood",
    "seek_help",
    "cocaine",
    ["acute_withdrawal", "post_acute"],
    "ASAM/AAAP",
    asamStud,
  ),
  substancePhaseDraft(
    "caffeine.intake.sensitivity",
    "safety",
    "caffeine",
    ["during_use"],
    "FDA",
    fdaCaffeine,
  ),
  substancePhaseDraft(
    "caffeine.withdrawal.gradual_reduction",
    "self_care",
    "caffeine",
    ["during_use", "acute_withdrawal"],
    "FDA",
    fdaCaffeine,
  ),
  substancePhaseDraft(
    "caffeine.withdrawal.headache",
    "safety",
    "caffeine",
    ["acute_withdrawal", "post_acute"],
    "MedlinePlus",
    medlineCaffeine,
  ),
  substancePhaseDraft(
    "caffeine.sleep.anxiety",
    "self_care",
    "caffeine",
    ["during_use", "acute_withdrawal", "post_acute", "normalizing"],
    "FDA",
    fdaCaffeine,
  ),
  substancePhaseDraft(
    "caffeine.medication.interactions",
    "seek_help",
    "caffeine",
    ["during_use"],
    "MedlinePlus",
    medlineCaffeine,
  ),
];
