import type { InterfaceLanguage } from "../../../i18n/interface-languages.js";
import type {
  KnowledgeConcept,
  KnowledgeConceptId,
  PublicKnowledgeCatalog,
} from "./knowledge-types.js";

export const KNOWLEDGE_CONCEPT_QUERY_KEY = "concept";
export const KNOWLEDGE_FILTER_ALL = "all";

export interface KnowledgeBrowserFilters {
  query: string;
  family: string;
  stratum: string;
  ontologyType: string;
}

export interface KnowledgeFilterOptions {
  families: readonly string[];
  strata: readonly string[];
  ontologyTypes: readonly string[];
}

export const EMPTY_KNOWLEDGE_FILTERS: KnowledgeBrowserFilters = {
  query: "",
  family: KNOWLEDGE_FILTER_ALL,
  stratum: KNOWLEDGE_FILTER_ALL,
  ontologyType: KNOWLEDGE_FILTER_ALL,
};

export function knowledgeFilterOptions(
  catalog: PublicKnowledgeCatalog,
): KnowledgeFilterOptions {
  return {
    families: uniqueSorted(catalog.concepts.flatMap((item) => item.families)),
    strata: uniqueSorted(catalog.concepts.flatMap((item) => item.strata)),
    ontologyTypes: uniqueSorted(
      catalog.concepts.map((item) => item.ontologyType),
    ),
  };
}

export function filterKnowledgeConcepts(
  catalog: PublicKnowledgeCatalog,
  filters: KnowledgeBrowserFilters,
  language: InterfaceLanguage,
): readonly KnowledgeConcept[] {
  const normalizedQuery = normalizeSearch(filters.query);
  return catalog.concepts
    .filter(
      (concept) =>
        matchesFacet(filters.family, concept.families) &&
        matchesFacet(filters.stratum, concept.strata) &&
        matchesFacet(filters.ontologyType, [concept.ontologyType]) &&
        (!normalizedQuery ||
          knowledgeSearchTerms(concept).some((term) =>
            normalizeSearch(term).includes(normalizedQuery),
          )),
    )
    .sort(
      (left, right) =>
        left.labels[language].localeCompare(right.labels[language], language) ||
        left.id.localeCompare(right.id),
    );
}

/** Searches both reviewed languages regardless of the active interface. */
export function knowledgeSearchTerms(
  concept: KnowledgeConcept,
): readonly string[] {
  return [
    concept.labels.es,
    concept.labels.en,
    concept.definition.es,
    concept.definition.en,
    concept.ontologyType,
    ...concept.families,
    ...concept.strata,
  ];
}

export function resolveKnowledgeConceptParam(
  catalog: PublicKnowledgeCatalog,
  value: string | null | undefined,
): KnowledgeConceptId | null {
  if (!value || !/^soma:K\d{6}$/.test(value)) return null;
  return catalog.concepts.some((concept) => concept.id === value)
    ? (value as KnowledgeConceptId)
    : null;
}

export function writeKnowledgeConceptSearchParams(
  _current: URLSearchParams,
  conceptId: KnowledgeConceptId | null,
  catalog: PublicKnowledgeCatalog,
): URLSearchParams {
  const next = new URLSearchParams();
  if (conceptId && resolveKnowledgeConceptParam(catalog, conceptId)) {
    next.set(KNOWLEDGE_CONCEPT_QUERY_KEY, conceptId);
  }
  return next;
}

/**
 * Public knowledge routes accept only one non-sensitive query parameter.
 * EXP-04 will use the same whitelist when moving provisional deep links to
 * the canonical `/expedition` route.
 */
export function sanitizeKnowledgeSearchParams(
  current: URLSearchParams,
  catalog: PublicKnowledgeCatalog,
): URLSearchParams {
  return writeKnowledgeConceptSearchParams(
    current,
    resolveKnowledgeConceptParam(
      catalog,
      current.get(KNOWLEDGE_CONCEPT_QUERY_KEY),
    ),
    catalog,
  );
}

function matchesFacet(selected: string, values: readonly string[]): boolean {
  return selected === KNOWLEDGE_FILTER_ALL || values.includes(selected);
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase();
}
