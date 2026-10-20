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
 * Contextual matching requires a substance and a narrative phase. Organ may
 * be omitted: then only `scope: "substance_phase"` items apply. Organ-scoped
 * items need a matching organ id. Persistent safety matching requires only a
 * substance and ignores phase and organ.
 *
 * The published catalog stays empty until advice is explicitly authored.
 */

export const adviceCategories = ["safety", "self_care", "seek_help"] as const;
export type AdviceCategory = (typeof adviceCategories)[number];

export const adviceScopes = ["substance_phase", "organ"] as const;
export type AdviceScope = (typeof adviceScopes)[number];

/**
 * Where a publishable item may appear. Independent of `category`.
 * Omitted on older items: treated as `contextual`.
 */
export const adviceAlertSurfaces = ["contextual", "persistent_safety"] as const;
export type AdviceAlertSurface = (typeof adviceAlertSurfaces)[number];

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

/** Organ argument for contextual resolvers. Blank strings count as no selection. */
export type AdviceOrganQuery = string | null | undefined;

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

export type SubstancePhaseAdviceItem =
  | (EducationalAdviceFields & {
      scope: "substance_phase";
      /** Omitted values resolve as contextual. */
      alertSurface?: "contextual";
    })
  | (EducationalAdviceFields & {
      scope: "substance_phase";
      alertSurface: "persistent_safety";
    });

export type OrganAdviceItem = EducationalAdviceFields & {
  scope: "organ";
  organIds: NonEmptyReadonly<OrganId>;
  /** Organ-scoped items cannot be persistent safety alerts. */
  alertSurface?: "contextual";
};

export type EducationalAdviceItem = SubstancePhaseAdviceItem | OrganAdviceItem;

export type PersistentSafetyAdviceItem = Extract<
  SubstancePhaseAdviceItem,
  { alertSurface: "persistent_safety" }
>;

export interface EducationalAdviceResolution {
  /** Null when Consejos is resolved without an organ selection. */
  organId: string | null;
  substanceId: string;
  phase: string;
  items: readonly EducationalAdviceItem[];
  /** True when no matching publishable item exists. Not an advice category. */
  empty: boolean;
}

export interface PersistentSafetyAdviceResolution {
  substanceId: string;
  items: readonly EducationalAdviceItem[];
  empty: boolean;
}

/**
 * Clinical/bibliographic gate for user-facing Consejos.
 * Independent of public copy. Both review and a verified reference are required.
 * Public ES/EN copy is enforced only when assembling `publishedAdviceCatalog`.
 */
export function isAdvicePublishable(item: EducationalAdviceItem): boolean {
  return (
    item.personalized === false &&
    item.editorialStatus === "clinically_reviewed" &&
    item.reference.status === "verified"
  );
}

/**
 * Missing `alertSurface` is contextual. Organ-scoped items are always contextual,
 * even if a runtime payload wrongly sets `persistent_safety`.
 * Never derived from `category`.
 */
export function resolveAdviceAlertSurface(item: EducationalAdviceItem): AdviceAlertSurface {
  if (item.scope !== "substance_phase") return "contextual";
  return item.alertSurface === "persistent_safety" ? "persistent_safety" : "contextual";
}

export function isPersistentSafetyAdvice(item: EducationalAdviceItem): item is PersistentSafetyAdviceItem {
  return item.scope === "substance_phase" && item.alertSurface === "persistent_safety";
}

/** Publishable substances present in a catalog, in first-seen order. */
export function publishedAdviceSubstanceIds(
  catalog: readonly EducationalAdviceItem[] = publishedAdviceCatalog,
): SubstanceId[] {
  const seen = new Set<SubstanceId>();
  const ids: SubstanceId[] = [];
  for (const item of catalog) {
    if (!isAdvicePublishable(item)) continue;
    for (const substanceId of item.substanceIds) {
      if (seen.has(substanceId)) continue;
      seen.add(substanceId);
      ids.push(substanceId);
    }
  }
  return ids;
}

/**
 * Public copy requirement for the published catalog.
 * Both locales are required. There is no language fallback.
 * Enforced by `assemblePublishedAdviceCatalog`, not by the resolvers.
 */
export const adviceI18nPublicationContract = {
  keys: ["titleKey", "bodyKey"] as const,
  locales: ["en", "es"] as const,
  fallback: null,
  enforcedWhen: "published-catalog-assembly",
} as const;

export interface AdvicePublicCopyBundles {
  en: unknown;
  es: unknown;
}

/** Empty public copy. Not the editorial sidecar. */
export const publishedAdviceCopyBundles: AdvicePublicCopyBundles = { en: {}, es: {} };

/** Candidates must pass `assemblePublishedAdviceCatalog` before users see them. */
export const publishedAdviceCandidates: readonly EducationalAdviceItem[] = [];

export function lookupAdviceCopyLeaf(tree: unknown, key: string): string | null {
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

export function hasCompletePublicAdviceCopy(
  item: EducationalAdviceItem,
  bundles: AdvicePublicCopyBundles,
): boolean {
  for (const locale of adviceI18nPublicationContract.locales) {
    const title = lookupAdviceCopyLeaf(bundles[locale], item.titleKey);
    const body = lookupAdviceCopyLeaf(bundles[locale], item.bodyKey);
    if (!title || !body) return false;
  }
  return true;
}

export function isAdviceReadyForPublishedCatalog(
  item: EducationalAdviceItem,
  bundles: AdvicePublicCopyBundles,
): boolean {
  return isAdvicePublishable(item) && hasCompletePublicAdviceCopy(item, bundles);
}

/**
 * Assembly barrier for the user-facing catalog.
 * Resolver tests may still inject catalogs without these bundles.
 */
export function assemblePublishedAdviceCatalog(
  candidates: readonly EducationalAdviceItem[],
  bundles: AdvicePublicCopyBundles,
): readonly EducationalAdviceItem[] {
  const seen = new Set<string>();
  const items: EducationalAdviceItem[] = [];
  for (const item of candidates) {
    if (!item.id || seen.has(item.id)) continue;
    if (!isAdviceReadyForPublishedCatalog(item, bundles)) continue;
    seen.add(item.id);
    items.push(item);
  }
  return items;
}

/** Production catalog: assembled from candidates + public copy. Currently empty. */
export const publishedAdviceCatalog: readonly EducationalAdviceItem[] =
  assemblePublishedAdviceCatalog(publishedAdviceCandidates, publishedAdviceCopyBundles);

/**
 * Applicability only: substance, phase, and explicit organ scope.
 * Does not apply the publication policy. Not for user-facing Consejos.
 */
export function matchApplicableAdvice(
  organId: AdviceOrganQuery,
  substanceId: string,
  phase: string,
  catalog: readonly EducationalAdviceItem[] = publishedAdviceCatalog,
): EducationalAdviceResolution {
  return resolveAdvice(organId, substanceId, phase, catalog, false);
}

/**
 * Public consumer: applicable contextual items that are eligible for publication.
 * Persistent items may also appear here when their phases match; use
 * `partitionAdviceSurfaces` so the future UI does not render the same id twice.
 */
export function resolveEducationalAdvice(
  organId: AdviceOrganQuery,
  substanceId: string,
  phase: string,
  catalog: readonly EducationalAdviceItem[] = publishedAdviceCatalog,
): EducationalAdviceResolution {
  return resolveAdvice(organId, substanceId, phase, catalog, true);
}

/**
 * Public consumer: publishable persistent-safety items for a substance.
 * Ignores phase and organ. Does not read the editorial sidecar.
 */
export function resolvePersistentSafetyAdvice(
  substanceId: string,
  catalog: readonly EducationalAdviceItem[] = publishedAdviceCatalog,
): PersistentSafetyAdviceResolution {
  const normalizedSubstance = normalizeRequiredId(substanceId);
  if (!normalizedSubstance) {
    return { substanceId: substanceId.trim(), items: [], empty: true };
  }

  const seen = new Set<string>();
  const items: EducationalAdviceItem[] = [];

  for (const item of catalog) {
    if (!item.id || seen.has(item.id)) continue;
    if (!isPersistentSafetyAdvice(item)) continue;
    if (!includesString(item.substanceIds, normalizedSubstance)) continue;
    if (!isAdvicePublishable(item)) continue;

    seen.add(item.id);
    items.push(item);
  }

  return { substanceId: normalizedSubstance, items, empty: items.length === 0 };
}

/**
 * Future UI helper: keep persistent items, then contextual items whose ids
 * were not already shown in the persistent band.
 */
export function partitionAdviceSurfaces(
  persistent: readonly EducationalAdviceItem[],
  contextual: readonly EducationalAdviceItem[],
): {
  persistent: readonly EducationalAdviceItem[];
  contextual: readonly EducationalAdviceItem[];
} {
  const persistentIds = new Set<string>();
  const persistentItems: EducationalAdviceItem[] = [];
  for (const item of persistent) {
    if (!item.id || persistentIds.has(item.id)) continue;
    persistentIds.add(item.id);
    persistentItems.push(item);
  }

  const contextualItems: EducationalAdviceItem[] = [];
  const contextualIds = new Set<string>();
  for (const item of contextual) {
    if (!item.id || persistentIds.has(item.id) || contextualIds.has(item.id)) continue;
    contextualIds.add(item.id);
    contextualItems.push(item);
  }

  return { persistent: persistentItems, contextual: contextualItems };
}

function resolveAdvice(
  organId: AdviceOrganQuery,
  substanceId: string,
  phase: string,
  catalog: readonly EducationalAdviceItem[],
  requirePublishable: boolean,
): EducationalAdviceResolution {
  const normalizedOrganId = normalizeOrganId(organId);
  const normalizedSubstance = normalizeRequiredId(substanceId);
  const query = {
    organId: normalizedOrganId,
    substanceId: normalizedSubstance ?? substanceId.trim(),
    phase,
  };

  if (!normalizedSubstance || !isNarrativePhase(phase)) {
    return { ...query, items: [], empty: true };
  }

  const seen = new Set<string>();
  const items: EducationalAdviceItem[] = [];

  for (const item of catalog) {
    if (!item.id || seen.has(item.id)) continue;
    if (!matchesSubstanceAndPhase(item, normalizedSubstance, phase)) continue;
    if (!matchesScope(item, normalizedOrganId)) continue;
    if (requirePublishable && !isAdvicePublishable(item)) continue;

    seen.add(item.id);
    items.push(item);
  }

  return { ...query, items, empty: items.length === 0 };
}

function normalizeOrganId(organId: AdviceOrganQuery): string | null {
  if (organId == null) return null;
  const trimmed = organId.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function normalizeRequiredId(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
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

function matchesScope(item: EducationalAdviceItem, organId: string | null): boolean {
  if (item.scope === "substance_phase") {
    return true;
  }
  if (organId === null) {
    return false;
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
  persistentRequiresSubstancePhase: _Assert<
    PersistentSafetyAdviceItem["scope"] extends "substance_phase" ? true : false
  >;
  organAlertSurfaceIsContextual: _Assert<
    OrganAdviceItem["alertSurface"] extends "contextual" | undefined ? true : false
  >;
};
