import type { SubstanceId } from "@soma/shared-types";
import { narrativePhases, type NarrativePhase } from "./narrative-catalog.ts";
import type { EducationalNeurotransmitter } from "./neurotransmitter-education.ts";

/**
 * Independent sidecar for educational neurotransmitter claim evidence.
 *
 * Separate from:
 * - Prisma neurotransmitter-profile citations and model-confidence enums
 * - organ-narrative and recovery-curve citations
 * - Consejos bibliographic records (Consejos publication gates are not reused)
 *
 * Two catalogs:
 * - `authoredEducationalNtEvidenceCatalog`: editorial history, including
 *   unsupported or unverified rows that must not reach the atlas.
 * - `publishedEducationalNtEvidenceCatalog`: derived projection of
 *   publishable rows only. Never authored by hand.
 *
 * Both stay empty until a later editorial ingest. Resolvers never invent
 * citations. This module does not estimate personal recovery or compose
 * `/me` state. 8N.6A bibliographic notes are not imported and are not
 * verifications. Seed model-confidence enums are never a publication signal.
 *
 * Clinical-review decision: only `claimKind: clinical_safety` requires
 * `clinicalReview: reviewed` to publish. Mechanism, acute effect,
 * neuroadaptation, and withdrawal-symptom rows describe educational
 * pharmacology or reported symptoms, not actionable medical instructions.
 * Bibliographic verification is not clinical validation. If a later ingest
 * turns a symptom row into user-facing medical advice, that row would
 * need a dedicated clinical gate — not this sidecar as written.
 */

export const educationalNtClaimKinds = [
  "mechanism",
  "acute_effect",
  "neuroadaptation",
  "withdrawal_symptom",
  "clinical_safety",
] as const;
export type EducationalNtClaimKind = (typeof educationalNtClaimKinds)[number];

export const educationalNtClaimSupports = [
  "supported",
  "partial",
  "unsupported",
  "unverified",
] as const;
export type EducationalNtClaimSupport = (typeof educationalNtClaimSupports)[number];

export const educationalNtClinicalReviews = ["not_applicable", "pending", "reviewed"] as const;
export type EducationalNtClinicalReview = (typeof educationalNtClinicalReviews)[number];

/**
 * Bibliographic identification of a work, independent of whether a Soma
 * sentence is supported by that work.
 */
export const educationalNtWorkIdentifications = ["identified", "absent"] as const;
export type EducationalNtWorkIdentification = (typeof educationalNtWorkIdentifications)[number];

/**
 * Verification of the citation string itself.
 * Independent of claim support and of clinical review.
 * Never inferred from author/year or seed confidence.
 */
export const educationalNtSourceStatuses = [
  "verified",
  "unverified",
  "pending",
  "insufficient",
] as const;
export type EducationalNtSourceStatus = (typeof educationalNtSourceStatuses)[number];

export const educationalNtEvidenceScopes = [
  "mechanism_only",
  "this_phase",
  "symptoms_not_receptors",
  "not_individual_timeline",
] as const;
export type EducationalNtEvidenceScope = (typeof educationalNtEvidenceScopes)[number];

export const educationalNtEvidenceIssueCodes = [
  "supported_without_verified_source",
  "partial_without_verified_source",
  "unsupported_without_verified_source",
  "absent_work_with_citation",
  "identified_work_without_citation",
  "absent_work_not_insufficient",
  "missing_reference_marked_false",
  "clinical_safety_not_applicable",
  "id_mismatch",
] as const;
export type EducationalNtEvidenceIssueCode = (typeof educationalNtEvidenceIssueCodes)[number];

export interface EducationalNtEvidenceIssue {
  code: EducationalNtEvidenceIssueCode;
  detail: string;
}

/** Token used in claim ids when the record is not phase-specific. */
export const educationalNtProfilePhaseToken = "profile";

export interface EducationalNtEvidenceReference {
  /** Citation as recorded. Empty when no work is documented. */
  source: string;
  identification: EducationalNtWorkIdentification;
  status: EducationalNtSourceStatus;
}

export interface EducationalNtEvidenceRecord {
  id: string;
  substanceId: SubstanceId;
  neurotransmitter: EducationalNeurotransmitter;
  mechanismKey: string;
  /** Null is a profile-level mechanism row, not evidence for every phase. */
  phase: NarrativePhase | null;
  claimKind: EducationalNtClaimKind;
  /** Distinguishes several claims in the same substance × NT × phase × kind. */
  slug: string;
  reference: EducationalNtEvidenceReference;
  claimSupport: EducationalNtClaimSupport;
  clinicalReview: EducationalNtClinicalReview;
  evidenceScope: EducationalNtEvidenceScope;
  /** Editorial limitation note. Empty when none. Not shown in the atlas yet. */
  limitations: string;
}

export interface EducationalNtEvidenceResolution {
  substanceId: string;
  neurotransmitter: string;
  phase: string;
  /** Profile-level mechanism rows only (`phase: null`, `mechanism_only`). */
  mechanismItems: readonly EducationalNtEvidenceRecord[];
  /** Rows whose `phase` equals the requested educational phase. */
  phaseItems: readonly EducationalNtEvidenceRecord[];
  /** True when both public lists are empty. Not a scientific finding. */
  empty: boolean;
}

export function educationalNtEvidenceId(input: {
  substanceId: string;
  neurotransmitter: string;
  phase: NarrativePhase | null;
  claimKind: EducationalNtClaimKind;
  slug: string;
}): string {
  const phaseToken = input.phase ?? educationalNtProfilePhaseToken;
  return `${input.substanceId}.${input.neurotransmitter}.${phaseToken}.${input.claimKind}.${input.slug}`;
}

function hasVerifiedIdentifiedSource(reference: EducationalNtEvidenceReference): boolean {
  return (
    reference.identification === "identified" &&
    reference.status === "verified" &&
    reference.source.trim().length > 0
  );
}

/**
 * Structural coherence of one sidecar row.
 * Absence of a source is documented non-evidence, not a false claim.
 */
export function educationalNtEvidenceIssues(
  item: EducationalNtEvidenceRecord,
): EducationalNtEvidenceIssue[] {
  const issues: EducationalNtEvidenceIssue[] = [];
  const expectedId = educationalNtEvidenceId(item);
  if (item.id !== expectedId) {
    issues.push({
      code: "id_mismatch",
      detail: `Expected id "${expectedId}".`,
    });
  }

  const source = item.reference.source.trim();
  if (item.reference.identification === "absent") {
    if (source) {
      issues.push({
        code: "absent_work_with_citation",
        detail: "An absent work cannot carry a citation string.",
      });
    }
    if (item.reference.status !== "insufficient") {
      issues.push({
        code: "absent_work_not_insufficient",
        detail: "No documented work is recorded as insufficient, not as a negative finding.",
      });
    }
    if (item.claimSupport === "unsupported") {
      issues.push({
        code: "missing_reference_marked_false",
        detail: "A missing reference is not evidence that the claim is false.",
      });
    }
  } else if (!source) {
    issues.push({
      code: "identified_work_without_citation",
      detail: "An identified work requires a non-empty citation.",
    });
  }

  if (item.claimSupport === "supported" && !hasVerifiedIdentifiedSource(item.reference)) {
    issues.push({
      code: "supported_without_verified_source",
      detail: "Supported claims require an identified, verified source.",
    });
  }
  if (item.claimSupport === "partial" && !hasVerifiedIdentifiedSource(item.reference)) {
    issues.push({
      code: "partial_without_verified_source",
      detail: "Partial support requires an identified, verified source.",
    });
  }
  if (item.claimSupport === "unsupported" && !hasVerifiedIdentifiedSource(item.reference)) {
    issues.push({
      code: "unsupported_without_verified_source",
      detail: "Unsupported requires an identified, verified source that was checked.",
    });
  }

  if (item.claimKind === "clinical_safety" && item.clinicalReview === "not_applicable") {
    issues.push({
      code: "clinical_safety_not_applicable",
      detail: "Clinical-safety claims cannot skip clinical review.",
    });
  }

  return issues;
}

export function isEducationalNtEvidenceConsistent(item: EducationalNtEvidenceRecord): boolean {
  return educationalNtEvidenceIssues(item).length === 0;
}

/**
 * Public-lane gate. Independent of the Consejos publication gate.
 * A reviewed clinical flag never substitutes bibliographic claim support.
 * `unsupported` and `unverified` stay editorial history only.
 */
export function isEducationalNtEvidencePublishable(item: EducationalNtEvidenceRecord): boolean {
  if (!isEducationalNtEvidenceConsistent(item)) return false;
  if (!hasVerifiedIdentifiedSource(item.reference)) return false;
  if (item.claimSupport !== "supported" && item.claimSupport !== "partial") return false;
  if (item.claimKind === "clinical_safety" && item.clinicalReview !== "reviewed") return false;
  return true;
}

/**
 * Authored evidence rows. Empty until an explicit editorial ingest.
 * May later hold unsupported history. Do not import this array from atlas UI.
 * Do not copy seed, narrative, or Consejos references into this list.
 */
export const authoredEducationalNtEvidenceCatalog: readonly EducationalNtEvidenceRecord[] = [];

/** Pure projection: publishable authored rows, in authored order. */
export function projectPublishedEducationalNtEvidence(
  authored: readonly EducationalNtEvidenceRecord[] = authoredEducationalNtEvidenceCatalog,
): readonly EducationalNtEvidenceRecord[] {
  return authored.filter((item) => isEducationalNtEvidencePublishable(item));
}

/**
 * Derived public catalog. Empty while the authored catalog is empty.
 * Not a second hand-maintained list.
 */
export const publishedEducationalNtEvidenceCatalog: readonly EducationalNtEvidenceRecord[] =
  projectPublishedEducationalNtEvidence();

function isNarrativePhase(value: string): value is NarrativePhase {
  return (narrativePhases as readonly string[]).includes(value);
}

function emptyResolution(
  substanceId: string,
  neurotransmitter: string,
  phase: string,
): EducationalNtEvidenceResolution {
  return {
    substanceId,
    neurotransmitter,
    phase,
    mechanismItems: [],
    phaseItems: [],
    empty: true,
  };
}

/**
 * Public resolution for one substance × transmitter × educational phase.
 * Mechanism rows never become phase evidence. Other phases are not inherited.
 * Unknown identities resolve empty. Non-publishable authored rows are omitted.
 * The catalog argument is never mutated.
 */
export function resolveEducationalNtEvidence(
  substanceId: string,
  neurotransmitter: string,
  phase: string,
  catalog: readonly EducationalNtEvidenceRecord[] = publishedEducationalNtEvidenceCatalog,
): EducationalNtEvidenceResolution {
  if (!substanceId || !neurotransmitter || !isNarrativePhase(phase)) {
    return emptyResolution(substanceId, neurotransmitter, phase);
  }

  const publicItems = catalog.filter(
    (item) =>
      isEducationalNtEvidencePublishable(item) &&
      item.substanceId === substanceId &&
      item.neurotransmitter === neurotransmitter,
  );

  const mechanismItems = publicItems.filter(
    (item) => item.phase === null && item.evidenceScope === "mechanism_only",
  );
  const phaseItems = publicItems.filter((item) => item.phase === phase);

  return {
    substanceId,
    neurotransmitter,
    phase,
    mechanismItems,
    phaseItems,
    empty: mechanismItems.length === 0 && phaseItems.length === 0,
  };
}
