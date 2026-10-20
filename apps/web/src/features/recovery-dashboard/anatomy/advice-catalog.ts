import type { OrganId, SubstanceId } from "@soma/shared-types";
import { narrativePhases, type NarrativePhase } from "./narrative-catalog.ts";

/**
 * Educational advice catalog for the atlas Consejos tab.
 *
 * This module is a typed contract and a pure resolver. It does not author
 * clinical recommendations, reuse neurotransmitter-phase copy, or read
 * narratives, recovery curves, or achievements.
 *
 * Matching (applicability) and publication eligibility are separate.
 * The public resolver only returns items that pass both.
 *
 * Future UI: Consejos will reuse the same substance and phase choices as
 * Effects, even when this catalog has no item for that combination.
 * Selectors are not implemented here.
 *
 * The published catalog stays empty until advice is explicitly authored.
 */

export const adviceCategories = ["safety", "self_care", "seek_help"] as const;
export type AdviceCategory = (typeof adviceCategories)[number];

export const adviceScopes = ["substance_phase", "organ"] as const;
export type AdviceScope = (typeof adviceScopes)[number];

/**
 * Bibliographic status of this item's own reference.
 * Independent of recovery-curve confidence and of clinical review.
 * Never inferred from author/year.
 */
export const adviceReferenceStatuses = [
  "verified",
  "unverified",
  "pending",
  "insufficient",
] as const;
export type AdviceReferenceStatus = (typeof adviceReferenceStatuses)[number];

/**
 * Editorial/clinical review of the copy.
 * Independent of bibliographic verification.
 */
export const adviceEditorialStatuses = [
  "draft",
  "pending_clinical_review",
  "clinically_reviewed",
] as const;
export type AdviceEditorialStatus = (typeof adviceEditorialStatuses)[number];

export type NonEmptyReadonly<T> = readonly [T, ...T[]];

export interface AdviceReference {
  /** Citation as recorded. Empty when no bibliographic source is identified. */
  source: string;
  status: AdviceReferenceStatus;
}

interface EducationalAdviceFields {
  id: string;
  category: AdviceCategory;
  substanceIds: NonEmptyReadonly<SubstanceId>;
  phases: NonEmptyReadonly<NarrativePhase>;
  titleKey: string;
  bodyKey: string;
  reference: AdviceReference;
  editorialStatus: AdviceEditorialStatus;
  personalized: false;
}

export type SubstancePhaseAdviceItem = EducationalAdviceFields & {
  scope: "substance_phase";
};

export type OrganAdviceItem = EducationalAdviceFields & {
  scope: "organ";
  organIds: NonEmptyReadonly<OrganId>;
};

export type EducationalAdviceItem = SubstancePhaseAdviceItem | OrganAdviceItem;

export interface EducationalAdviceResolution {
  organId: string;
  substanceId: string;
  phase: string;
  items: readonly EducationalAdviceItem[];
  /** True when no matching publishable item exists. Not an advice category. */
  empty: boolean;
}

/**
 * Publication gate for user-facing Consejos.
 * Bibliographic verification and clinical review are independent and both required.
 * i18n key presence in EN/ES is deferred until UI integration; see
 * `adviceI18nPublicationContract`.
 */
export function isAdvicePublishable(item: EducationalAdviceItem): boolean {
  return (
    item.personalized === false &&
    item.editorialStatus === "clinically_reviewed" &&
    item.reference.status === "verified"
  );
}

/** Translation check reserved for UI integration. Not enforced in this resolver. */
export const adviceI18nPublicationContract = {
  keys: ["titleKey", "bodyKey"],
  locales: ["en", "es"],
  fallback: "en",
  enforcedWhen: "ui-integration",
} as const;

/** Production catalog: no authored advice yet. */
export const publishedAdviceCatalog: readonly EducationalAdviceItem[] = [];

/**
 * Applicability only: substance, phase, and explicit organ scope.
 * Does not apply the publication policy. Not for user-facing Consejos.
 */
export function matchApplicableAdvice(
  organId: string,
  substanceId: string,
  phase: string,
  catalog: readonly EducationalAdviceItem[] = publishedAdviceCatalog,
): EducationalAdviceResolution {
  return resolveAdvice(organId, substanceId, phase, catalog, false);
}

/**
 * Public consumer: applicable items that are eligible for publication.
 */
export function resolveEducationalAdvice(
  organId: string,
  substanceId: string,
  phase: string,
  catalog: readonly EducationalAdviceItem[] = publishedAdviceCatalog,
): EducationalAdviceResolution {
  return resolveAdvice(organId, substanceId, phase, catalog, true);
}

function resolveAdvice(
  organId: string,
  substanceId: string,
  phase: string,
  catalog: readonly EducationalAdviceItem[],
  requirePublishable: boolean,
): EducationalAdviceResolution {
  const query = { organId, substanceId, phase };
  if (!isUsableQuery(organId, substanceId, phase)) {
    return { ...query, items: [], empty: true };
  }

  const seen = new Set<string>();
  const items: EducationalAdviceItem[] = [];

  for (const item of catalog) {
    if (!item.id || seen.has(item.id)) continue;
    if (!matchesSubstanceAndPhase(item, substanceId, phase)) continue;
    if (!matchesScope(item, organId)) continue;
    if (requirePublishable && !isAdvicePublishable(item)) continue;

    seen.add(item.id);
    items.push(item);
  }

  return { ...query, items, empty: items.length === 0 };
}

function isUsableQuery(organId: string, substanceId: string, phase: string): boolean {
  return organId.trim().length > 0 && substanceId.trim().length > 0 && isNarrativePhase(phase);
}

function isNarrativePhase(phase: string): phase is NarrativePhase {
  return includesString(narrativePhases, phase);
}

function matchesSubstanceAndPhase(
  item: EducationalAdviceItem,
  substanceId: string,
  phase: string,
): boolean {
  return includesString(item.substanceIds, substanceId) && includesString(item.phases, phase);
}

function matchesScope(item: EducationalAdviceItem, organId: string): boolean {
  if (item.scope === "substance_phase") {
    return true;
  }
  return includesString(item.organIds, organId);
}

function includesString(values: readonly string[], value: string): boolean {
  return values.includes(value);
}

type _Assert<T extends true> = T;

/** Compile-time checks for the discriminated advice contract. */
export type AdviceCatalogTypeChecks = {
  organIdsNonEmpty: _Assert<
    OrganAdviceItem["organIds"] extends readonly [OrganId, ...OrganId[]] ? true : false
  >;
  substanceIdsNonEmpty: _Assert<
    EducationalAdviceItem["substanceIds"] extends readonly [SubstanceId, ...SubstanceId[]]
      ? true
      : false
  >;
  phasesNonEmpty: _Assert<
    EducationalAdviceItem["phases"] extends readonly [NarrativePhase, ...NarrativePhase[]]
      ? true
      : false
  >;
  generalHasNoOrganIds: _Assert<
    keyof SubstancePhaseAdviceItem & "organIds" extends never ? true : false
  >;
  organRequiresOrganIds: _Assert<
    OrganAdviceItem extends { organIds: NonEmptyReadonly<OrganId> } ? true : false
  >;
};
