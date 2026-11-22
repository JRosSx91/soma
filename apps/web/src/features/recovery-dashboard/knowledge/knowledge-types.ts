/**
 * GAM-03B runtime data contract.
 *
 * This module intentionally contains no catalog data. Public data must be
 * supplied from an explicitly reviewed runtime source, never from docs/design.
 */

export const KNOWLEDGE_EDITORIAL_STATUSES = [
  "candidate",
  "source_mapped",
  "scientific_review",
  "bilingual_editorial_review",
  "approved",
  "published",
  "deprecated",
] as const;

export type KnowledgeEditorialStatus =
  (typeof KNOWLEDGE_EDITORIAL_STATUSES)[number];

export const KNOWLEDGE_PREDICATES = [
  "is_a",
  "part_of",
  "located_in",
  "inheres_in",
  "occurs_in",
  "participates_in",
  "capable_of",
  "has_role",
  "regulates",
  "positively_regulates",
  "negatively_regulates",
  "transforms_into",
  "causally_upstream_of",
  "related_to",
] as const;

export type KnowledgePredicate = (typeof KNOWLEDGE_PREDICATES)[number];

export const KNOWLEDGE_PREREQUISITE_STRENGTHS = [
  "recommended",
  "important",
] as const;

export type KnowledgePrerequisiteStrength =
  (typeof KNOWLEDGE_PREREQUISITE_STRENGTHS)[number];

export type KnowledgeConceptId = `soma:K${string}`;
export type KnowledgeRelationId = `soma:R${string}`;
export type KnowledgePrerequisiteId = `soma:P${string}`;

export interface BilingualText {
  es: string;
  en: string;
}

export interface KnowledgeBinding {
  surface: string;
  id: string;
}

export interface KnowledgeReference {
  id: string;
  title: string;
  publisher: string;
  url: string;
}

export interface KnowledgeIllustrationHint {
  kind: string;
  assetGroup: string;
}

export interface KnowledgeConcept {
  id: KnowledgeConceptId;
  labels: BilingualText;
  definition: BilingualText;
  /** Reviewed long-form copy. Required by the publication exporter. */
  explanation?: BilingualText;
  example?: BilingualText;
  references?: readonly KnowledgeReference[];
  clarifications?: readonly BilingualText[];
  illustration?: KnowledgeIllustrationHint;
  ontologyType: string;
  families: readonly string[];
  scale: string;
  strata: readonly string[];
  editorialStatus: KnowledgeEditorialStatus;
  bindings: readonly KnowledgeBinding[];
}

export interface KnowledgeRelation {
  id: KnowledgeRelationId;
  subject: KnowledgeConceptId;
  predicate: KnowledgePredicate;
  object: KnowledgeConceptId;
  editorialStatus: KnowledgeEditorialStatus;
}

/**
 * Pedagogical guidance. It is not a scientific edge and never gates content.
 * Its own editorial state prevents a candidate path leaking into public data.
 */
export interface KnowledgePrerequisite {
  id: KnowledgePrerequisiteId;
  prerequisite: KnowledgeConceptId;
  concept: KnowledgeConceptId;
  strength: KnowledgePrerequisiteStrength;
  rationale: BilingualText;
  editorialStatus: KnowledgeEditorialStatus;
}

export interface KnowledgePrerequisitePolicy {
  blocksAccess: false;
  grantsXp: false;
  incomingAreCumulative: false;
}

export interface KnowledgeCatalog {
  concepts: readonly KnowledgeConcept[];
  relations: readonly KnowledgeRelation[];
  prerequisites: readonly KnowledgePrerequisite[];
  prerequisitePolicy: KnowledgePrerequisitePolicy;
}

export interface PublicKnowledgeCatalog extends KnowledgeCatalog {
  concepts: readonly (KnowledgeConcept & { editorialStatus: "published" })[];
  relations: readonly (KnowledgeRelation & { editorialStatus: "published" })[];
  prerequisites: readonly (KnowledgePrerequisite & {
    editorialStatus: "published";
  })[];
}

export interface KnowledgeCatalogIndexes {
  conceptsById: ReadonlyMap<KnowledgeConceptId, KnowledgeConcept>;
  relationsById: ReadonlyMap<KnowledgeRelationId, KnowledgeRelation>;
  incomingByConceptId: ReadonlyMap<
    KnowledgeConceptId,
    readonly KnowledgeRelation[]
  >;
  outgoingByConceptId: ReadonlyMap<
    KnowledgeConceptId,
    readonly KnowledgeRelation[]
  >;
  prerequisitesByConceptId: ReadonlyMap<
    KnowledgeConceptId,
    readonly KnowledgePrerequisite[]
  >;
  bindingsByConceptId: ReadonlyMap<
    KnowledgeConceptId,
    readonly KnowledgeBinding[]
  >;
}

export type KnowledgeTraversalDirection = "outgoing" | "incoming";

/** The predicate always retains its authored subject -> object semantics. */
export interface KnowledgeRelationTraversal {
  relation: KnowledgeRelation;
  from: KnowledgeConceptId;
  to: KnowledgeConceptId;
  direction: KnowledgeTraversalDirection;
}

export interface KnowledgeNeighborhood {
  rootId: KnowledgeConceptId;
  concepts: readonly KnowledgeConcept[];
  relations: readonly KnowledgeRelation[];
  discoveries: readonly KnowledgeRelationTraversal[];
  maxDepth: number;
  maxNodes: number;
  truncated: boolean;
}
