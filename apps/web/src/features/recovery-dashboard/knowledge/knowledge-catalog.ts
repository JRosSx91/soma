import {
  KNOWLEDGE_EDITORIAL_STATUSES,
  KNOWLEDGE_PREDICATES,
  KNOWLEDGE_PREREQUISITE_STRENGTHS,
  type BilingualText,
  type KnowledgeBinding,
  type KnowledgeCatalog,
  type KnowledgeCatalogIndexes,
  type KnowledgeConcept,
  type KnowledgeConceptId,
  type KnowledgeEditorialStatus,
  type KnowledgeIllustrationHint,
  type KnowledgeNeighborhood,
  type KnowledgePredicate,
  type KnowledgePrerequisite,
  type KnowledgePrerequisiteId,
  type KnowledgeRelation,
  type KnowledgeRelationId,
  type KnowledgeRelationTraversal,
  type KnowledgeReference,
  type PublicKnowledgeCatalog,
} from "./knowledge-types.js";

const CONCEPT_ID = /^soma:K\d{6}$/;
const RELATION_ID = /^soma:R\d{6}$/;
const PREREQUISITE_ID = /^soma:P\d{6}$/;
const PUBLIC_NEIGHBORHOOD_NODE_LIMIT = 25;

export const knowledgeCatalogIssueCodes = [
  "invalid_catalog",
  "invalid_id",
  "duplicate_id",
  "missing_field",
  "missing_translation",
  "unknown_editorial_status",
  "unknown_predicate",
  "unknown_prerequisite_strength",
  "missing_reference",
  "invalid_url",
  "invalid_prerequisite_policy",
] as const;

export type KnowledgeCatalogIssueCode =
  (typeof knowledgeCatalogIssueCodes)[number];

export interface KnowledgeCatalogIssue {
  code: KnowledgeCatalogIssueCode;
  path: string;
  detail: string;
}

export type KnowledgeCatalogParseResult =
  | { ok: true; catalog: KnowledgeCatalog }
  | { ok: false; issues: readonly KnowledgeCatalogIssue[] };

export function parseKnowledgeCatalog(raw: unknown): KnowledgeCatalogParseResult {
  const issues: KnowledgeCatalogIssue[] = [];
  if (!isRecord(raw)) {
    return {
      ok: false,
      issues: [issue("invalid_catalog", "$", "Catalog must be an object.")],
    };
  }

  const rawConcepts = readArray(raw, "concepts", issues);
  const rawRelations = readArray(raw, "relations", issues);
  const rawPrerequisites = readArray(raw, "prerequisites", issues);
  const concepts = rawConcepts.flatMap((value, index) => {
    const parsed = parseConcept(value, `concepts[${index}]`, issues);
    return parsed ? [parsed] : [];
  });
  const relations = rawRelations.flatMap((value, index) => {
    const parsed = parseRelation(value, `relations[${index}]`, issues);
    return parsed ? [parsed] : [];
  });
  const prerequisites = rawPrerequisites.flatMap((value, index) => {
    const parsed = parsePrerequisite(
      value,
      `prerequisites[${index}]`,
      issues,
    );
    return parsed ? [parsed] : [];
  });

  collectDuplicateIds(concepts, "concepts", issues);
  collectDuplicateIds(relations, "relations", issues);
  collectDuplicateIds(prerequisites, "prerequisites", issues);

  const conceptIds = new Set(concepts.map((concept) => concept.id));
  for (const relation of relations) {
    collectMissingReference(
      conceptIds,
      relation.subject,
      `relations.${relation.id}.subject`,
      issues,
    );
    collectMissingReference(
      conceptIds,
      relation.object,
      `relations.${relation.id}.object`,
      issues,
    );
  }
  for (const prerequisite of prerequisites) {
    collectMissingReference(
      conceptIds,
      prerequisite.prerequisite,
      `prerequisites.${prerequisite.id}.prerequisite`,
      issues,
    );
    collectMissingReference(
      conceptIds,
      prerequisite.concept,
      `prerequisites.${prerequisite.id}.concept`,
      issues,
    );
  }

  const prerequisitePolicy = parsePrerequisitePolicy(
    raw.prerequisitePolicy,
    issues,
  );
  if (issues.length > 0 || !prerequisitePolicy) {
    return { ok: false, issues };
  }
  return {
    ok: true,
    catalog: { concepts, relations, prerequisites, prerequisitePolicy },
  };
}

/**
 * Produces the only shape that public consumers should receive.
 * Hidden endpoints, candidate paths, and their bindings never cross this boundary.
 */
export function projectPublishedKnowledge(
  catalog: KnowledgeCatalog,
): PublicKnowledgeCatalog {
  const concepts = catalog.concepts.filter(
    (concept): concept is KnowledgeConcept & { editorialStatus: "published" } =>
      concept.editorialStatus === "published",
  );
  const visibleIds = new Set(concepts.map((concept) => concept.id));
  const relations = catalog.relations.filter(
    (relation): relation is KnowledgeRelation & {
      editorialStatus: "published";
    } =>
      relation.editorialStatus === "published" &&
      visibleIds.has(relation.subject) &&
      visibleIds.has(relation.object),
  );
  const prerequisites = catalog.prerequisites.filter(
    (prerequisite): prerequisite is KnowledgePrerequisite & {
      editorialStatus: "published";
    } =>
      prerequisite.editorialStatus === "published" &&
      visibleIds.has(prerequisite.prerequisite) &&
      visibleIds.has(prerequisite.concept),
  );
  return {
    concepts,
    relations,
    prerequisites,
    prerequisitePolicy: {
      blocksAccess: false,
      grantsXp: false,
      incomingAreCumulative: false,
    },
  };
}

export function createKnowledgeCatalogIndexes(
  catalog: KnowledgeCatalog,
): KnowledgeCatalogIndexes {
  const conceptsById = new Map(
    catalog.concepts.map((concept) => [concept.id, concept] as const),
  );
  const relationsById = new Map(
    catalog.relations.map((relation) => [relation.id, relation] as const),
  );
  const incomingByConceptId = groupRelations(
    catalog.concepts,
    catalog.relations,
    "object",
  );
  const outgoingByConceptId = groupRelations(
    catalog.concepts,
    catalog.relations,
    "subject",
  );
  const prerequisitesByConceptId = new Map<
    KnowledgeConceptId,
    KnowledgePrerequisite[]
  >(catalog.concepts.map((concept) => [concept.id, []]));
  for (const prerequisite of [...catalog.prerequisites].sort(byId)) {
    prerequisitesByConceptId.get(prerequisite.concept)?.push(prerequisite);
  }
  const bindingsByConceptId = new Map<KnowledgeConceptId, KnowledgeBinding[]>(
    catalog.concepts.map((concept) => [concept.id, [...concept.bindings]]),
  );
  return {
    conceptsById,
    relationsById,
    incomingByConceptId,
    outgoingByConceptId,
    prerequisitesByConceptId,
    bindingsByConceptId,
  };
}

export function outgoingRelations(
  indexes: KnowledgeCatalogIndexes,
  conceptId: KnowledgeConceptId,
): readonly KnowledgeRelation[] {
  return indexes.outgoingByConceptId.get(conceptId) ?? [];
}

export function incomingRelations(
  indexes: KnowledgeCatalogIndexes,
  conceptId: KnowledgeConceptId,
): readonly KnowledgeRelation[] {
  return indexes.incomingByConceptId.get(conceptId) ?? [];
}

export interface KnowledgeNeighborhoodOptions {
  maxDepth: 1 | 2;
  maxNodes?: number;
}

export function buildKnowledgeNeighborhood(
  catalog: KnowledgeCatalog,
  rootId: KnowledgeConceptId,
  options: KnowledgeNeighborhoodOptions,
): KnowledgeNeighborhood {
  const requestedLimit = options.maxNodes ?? PUBLIC_NEIGHBORHOOD_NODE_LIMIT;
  const maxNodes = Math.max(
    1,
    Math.min(PUBLIC_NEIGHBORHOOD_NODE_LIMIT, Math.floor(requestedLimit)),
  );
  const indexes = createKnowledgeCatalogIndexes(catalog);
  if (!indexes.conceptsById.has(rootId)) {
    return {
      rootId,
      concepts: [],
      relations: [],
      discoveries: [],
      maxDepth: options.maxDepth,
      maxNodes,
      truncated: false,
    };
  }

  const visited = new Set<KnowledgeConceptId>([rootId]);
  const queue: { id: KnowledgeConceptId; depth: number }[] = [
    { id: rootId, depth: 0 },
  ];
  const discoveries: KnowledgeRelationTraversal[] = [];
  let truncated = false;

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    if (!current || current.depth >= options.maxDepth) continue;
    for (const traversal of traversalsFrom(indexes, current.id)) {
      if (visited.has(traversal.to)) continue;
      if (visited.size >= maxNodes) {
        truncated = true;
        continue;
      }
      visited.add(traversal.to);
      discoveries.push(traversal);
      queue.push({ id: traversal.to, depth: current.depth + 1 });
    }
  }

  const concepts = [...visited]
    .map((id) => indexes.conceptsById.get(id))
    .filter((concept): concept is KnowledgeConcept => Boolean(concept))
    .sort(byId);
  const relations = catalog.relations
    .filter(
      (relation) =>
        visited.has(relation.subject) && visited.has(relation.object),
    )
    .sort(byId);
  return {
    rootId,
    concepts,
    relations,
    discoveries,
    maxDepth: options.maxDepth,
    maxNodes,
    truncated,
  };
}

function traversalsFrom(
  indexes: KnowledgeCatalogIndexes,
  from: KnowledgeConceptId,
): KnowledgeRelationTraversal[] {
  const outgoing = outgoingRelations(indexes, from).map((relation) => ({
    relation,
    from,
    to: relation.object,
    direction: "outgoing" as const,
  }));
  const incoming = incomingRelations(indexes, from).map((relation) => ({
    relation,
    from,
    to: relation.subject,
    direction: "incoming" as const,
  }));
  return [...outgoing, ...incoming].sort(
    (left, right) =>
      left.relation.id.localeCompare(right.relation.id) ||
      left.direction.localeCompare(right.direction),
  );
}

function parseConcept(
  raw: unknown,
  path: string,
  issues: KnowledgeCatalogIssue[],
): KnowledgeConcept | null {
  if (!isRecord(raw)) {
    issues.push(issue("missing_field", path, "Concept must be an object."));
    return null;
  }
  const id = readCanonicalId(raw.id, CONCEPT_ID, path, issues);
  const labels = readBilingual(raw.labels, `${path}.labels`, issues);
  const definition = readBilingual(
    raw.definition,
    `${path}.definition`,
    issues,
  );
  const explanation = readOptionalBilingual(
    raw.explanation,
    `${path}.explanation`,
    issues,
  );
  const example = readOptionalBilingual(raw.example, `${path}.example`, issues);
  const references = readReferences(raw.references, `${path}.references`, issues);
  const clarifications = readClarifications(
    raw.clarifications,
    `${path}.clarifications`,
    issues,
  );
  const illustration = readIllustration(
    raw.illustration,
    `${path}.illustration`,
    issues,
  );
  const ontologyType = readString(raw.ontologyType, `${path}.ontologyType`, issues);
  const families = readStringArray(raw.families, `${path}.families`, issues);
  const scale = readString(raw.scale, `${path}.scale`, issues);
  const strata = readStringArray(raw.strata, `${path}.strata`, issues);
  const editorialStatus = readEditorialStatus(
    raw.editorialStatus,
    `${path}.editorialStatus`,
    issues,
  );
  const bindings = readBindings(raw.bindings, `${path}.bindings`, issues);
  if (
    !id ||
    !labels ||
    !definition ||
    explanation === null ||
    example === null ||
    references === null ||
    clarifications === null ||
    illustration === null ||
    !ontologyType ||
    !families ||
    !scale ||
    !strata ||
    !editorialStatus ||
    !bindings
  ) {
    return null;
  }
  return {
    id: id as KnowledgeConceptId,
    labels,
    definition,
    ...(explanation ? { explanation } : {}),
    ...(example ? { example } : {}),
    ...(references.length > 0 ? { references } : {}),
    ...(clarifications.length > 0 ? { clarifications } : {}),
    ...(illustration ? { illustration } : {}),
    ontologyType,
    families,
    scale,
    strata,
    editorialStatus,
    bindings,
  };
}

function parseRelation(
  raw: unknown,
  path: string,
  issues: KnowledgeCatalogIssue[],
): KnowledgeRelation | null {
  if (!isRecord(raw)) {
    issues.push(issue("missing_field", path, "Relation must be an object."));
    return null;
  }
  const id = readCanonicalId(raw.id, RELATION_ID, path, issues);
  const subject = readCanonicalId(raw.subject, CONCEPT_ID, `${path}.subject`, issues);
  const object = readCanonicalId(raw.object, CONCEPT_ID, `${path}.object`, issues);
  const predicate = readPredicate(raw.predicate, `${path}.predicate`, issues);
  const editorialStatus = readEditorialStatus(
    raw.editorialStatus,
    `${path}.editorialStatus`,
    issues,
  );
  if (!id || !subject || !object || !predicate || !editorialStatus) return null;
  return {
    id: id as KnowledgeRelationId,
    subject: subject as KnowledgeConceptId,
    object: object as KnowledgeConceptId,
    predicate,
    editorialStatus,
  };
}

function parsePrerequisite(
  raw: unknown,
  path: string,
  issues: KnowledgeCatalogIssue[],
): KnowledgePrerequisite | null {
  if (!isRecord(raw)) {
    issues.push(
      issue("missing_field", path, "Prerequisite must be an object."),
    );
    return null;
  }
  const id = readCanonicalId(raw.id, PREREQUISITE_ID, path, issues);
  const prerequisite = readCanonicalId(
    raw.prerequisite,
    CONCEPT_ID,
    `${path}.prerequisite`,
    issues,
  );
  const concept = readCanonicalId(
    raw.concept,
    CONCEPT_ID,
    `${path}.concept`,
    issues,
  );
  const rationale = readBilingual(raw.rationale, `${path}.rationale`, issues);
  const editorialStatus = readEditorialStatus(
    raw.editorialStatus,
    `${path}.editorialStatus`,
    issues,
  );
  const strength = includesString(
    KNOWLEDGE_PREREQUISITE_STRENGTHS,
    raw.strength,
  )
    ? raw.strength
    : null;
  if (!strength) {
    issues.push(
      issue(
        "unknown_prerequisite_strength",
        `${path}.strength`,
        `Unknown prerequisite strength "${String(raw.strength)}".`,
      ),
    );
  }
  if (
    !id ||
    !prerequisite ||
    !concept ||
    !rationale ||
    !editorialStatus ||
    !strength
  ) {
    return null;
  }
  return {
    id: id as KnowledgePrerequisiteId,
    prerequisite: prerequisite as KnowledgeConceptId,
    concept: concept as KnowledgeConceptId,
    rationale,
    editorialStatus,
    strength,
  };
}

function parsePrerequisitePolicy(
  raw: unknown,
  issues: KnowledgeCatalogIssue[],
): KnowledgeCatalog["prerequisitePolicy"] | null {
  if (
    !isRecord(raw) ||
    raw.blocksAccess !== false ||
    raw.grantsXp !== false ||
    raw.incomingAreCumulative !== false
  ) {
    issues.push(
      issue(
        "invalid_prerequisite_policy",
        "prerequisitePolicy",
        "Prerequisites must be non-blocking, grant no XP, and remain independent recommendations.",
      ),
    );
    return null;
  }
  return {
    blocksAccess: false,
    grantsXp: false,
    incomingAreCumulative: false,
  };
}

function readBilingual(
  raw: unknown,
  path: string,
  issues: KnowledgeCatalogIssue[],
): BilingualText | null {
  if (!isRecord(raw)) {
    issues.push(issue("missing_field", path, "Bilingual text is required."));
    return null;
  }
  let valid = true;
  for (const locale of ["es", "en"] as const) {
    if (typeof raw[locale] !== "string" || !raw[locale].trim()) {
      issues.push(
        issue(
          "missing_translation",
          `${path}.${locale}`,
          `Non-empty ${locale.toUpperCase()} copy is required.`,
        ),
      );
      valid = false;
    }
  }
  return valid ? { es: raw.es as string, en: raw.en as string } : null;
}

function readOptionalBilingual(
  raw: unknown,
  path: string,
  issues: KnowledgeCatalogIssue[],
): BilingualText | undefined | null {
  if (raw === undefined) return undefined;
  return readBilingual(raw, path, issues);
}

function readReferences(
  raw: unknown,
  path: string,
  issues: KnowledgeCatalogIssue[],
): KnowledgeReference[] | null {
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) {
    issues.push(issue("missing_field", path, "References must be an array."));
    return null;
  }
  const references: KnowledgeReference[] = [];
  const ids = new Set<string>();
  for (const [index, value] of raw.entries()) {
    if (!isRecord(value)) {
      issues.push(issue("missing_field", `${path}[${index}]`, "Reference must be an object."));
      continue;
    }
    const id = readString(value.id, `${path}[${index}].id`, issues);
    const title = readString(value.title, `${path}[${index}].title`, issues);
    const publisher = readString(
      value.publisher,
      `${path}[${index}].publisher`,
      issues,
    );
    const url = readPublicUrl(value.url, `${path}[${index}].url`, issues);
    if (!id || !title || !publisher || !url) continue;
    if (ids.has(id)) {
      issues.push(issue("duplicate_id", `${path}[${index}].id`, `Duplicate reference id "${id}".`));
      continue;
    }
    ids.add(id);
    references.push({ id, title, publisher, url });
  }
  return references;
}

function readClarifications(
  raw: unknown,
  path: string,
  issues: KnowledgeCatalogIssue[],
): BilingualText[] | null {
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) {
    issues.push(issue("missing_field", path, "Clarifications must be an array."));
    return null;
  }
  return raw.flatMap((value, index) => {
    const parsed = readBilingual(value, `${path}[${index}]`, issues);
    return parsed ? [parsed] : [];
  });
}

function readIllustration(
  raw: unknown,
  path: string,
  issues: KnowledgeCatalogIssue[],
): KnowledgeIllustrationHint | undefined | null {
  if (raw === undefined) return undefined;
  if (!isRecord(raw)) {
    issues.push(issue("missing_field", path, "Illustration hint must be an object."));
    return null;
  }
  const kind = readString(raw.kind, `${path}.kind`, issues);
  const assetGroup = readString(raw.assetGroup, `${path}.assetGroup`, issues);
  return kind && assetGroup ? { kind, assetGroup } : null;
}

function readPublicUrl(
  raw: unknown,
  path: string,
  issues: KnowledgeCatalogIssue[],
): string | null {
  if (typeof raw !== "string" || !raw.trim()) {
    issues.push(issue("missing_field", path, "A public URL is required."));
    return null;
  }
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error();
    return parsed.toString();
  } catch {
    issues.push(issue("invalid_url", path, `Invalid public URL "${raw}".`));
    return null;
  }
}

function readBindings(
  raw: unknown,
  path: string,
  issues: KnowledgeCatalogIssue[],
): KnowledgeBinding[] | null {
  if (!Array.isArray(raw)) {
    issues.push(issue("missing_field", path, "Bindings must be an array."));
    return null;
  }
  const bindings: KnowledgeBinding[] = [];
  for (const [index, value] of raw.entries()) {
    if (!isRecord(value)) {
      issues.push(
        issue("missing_field", `${path}[${index}]`, "Binding must be an object."),
      );
      continue;
    }
    const surface = readString(value.surface, `${path}[${index}].surface`, issues);
    const id = readString(value.id, `${path}[${index}].id`, issues);
    if (surface && id) bindings.push({ surface, id });
  }
  return bindings;
}

function readPredicate(
  raw: unknown,
  path: string,
  issues: KnowledgeCatalogIssue[],
): KnowledgePredicate | null {
  if (includesString(KNOWLEDGE_PREDICATES, raw)) return raw;
  issues.push(
    issue(
      "unknown_predicate",
      path,
      `Unknown scientific predicate "${String(raw)}".`,
    ),
  );
  return null;
}

function readEditorialStatus(
  raw: unknown,
  path: string,
  issues: KnowledgeCatalogIssue[],
): KnowledgeEditorialStatus | null {
  if (includesString(KNOWLEDGE_EDITORIAL_STATUSES, raw)) return raw;
  issues.push(
    issue(
      "unknown_editorial_status",
      path,
      `Unknown editorial status "${String(raw)}".`,
    ),
  );
  return null;
}

function readCanonicalId(
  raw: unknown,
  pattern: RegExp,
  path: string,
  issues: KnowledgeCatalogIssue[],
): string | null {
  if (typeof raw === "string" && pattern.test(raw)) return raw;
  issues.push(
    issue("invalid_id", path, `Invalid canonical identifier "${String(raw)}".`),
  );
  return null;
}

function readString(
  raw: unknown,
  path: string,
  issues: KnowledgeCatalogIssue[],
): string | null {
  if (typeof raw === "string" && raw.trim()) return raw;
  issues.push(issue("missing_field", path, "A non-empty string is required."));
  return null;
}

function readStringArray(
  raw: unknown,
  path: string,
  issues: KnowledgeCatalogIssue[],
): string[] | null {
  if (
    Array.isArray(raw) &&
    raw.length > 0 &&
    raw.every((value) => typeof value === "string" && value.trim())
  ) {
    return [...raw];
  }
  issues.push(
    issue("missing_field", path, "A non-empty string array is required."),
  );
  return null;
}

function readArray(
  raw: Record<string, unknown>,
  key: string,
  issues: KnowledgeCatalogIssue[],
): unknown[] {
  if (Array.isArray(raw[key])) return raw[key];
  issues.push(issue("missing_field", key, `${key} must be an array.`));
  return [];
}

function collectDuplicateIds<T extends { id: string }>(
  records: readonly T[],
  path: string,
  issues: KnowledgeCatalogIssue[],
): void {
  const seen = new Set<string>();
  for (const record of records) {
    if (seen.has(record.id)) {
      issues.push(
        issue("duplicate_id", `${path}.${record.id}`, `Duplicate id "${record.id}".`),
      );
    }
    seen.add(record.id);
  }
}

function collectMissingReference(
  ids: ReadonlySet<KnowledgeConceptId>,
  target: KnowledgeConceptId,
  path: string,
  issues: KnowledgeCatalogIssue[],
): void {
  if (!ids.has(target)) {
    issues.push(
      issue("missing_reference", path, `Unknown concept reference "${target}".`),
    );
  }
}

function groupRelations(
  concepts: readonly KnowledgeConcept[],
  relations: readonly KnowledgeRelation[],
  key: "subject" | "object",
): Map<KnowledgeConceptId, KnowledgeRelation[]> {
  const grouped = new Map<KnowledgeConceptId, KnowledgeRelation[]>(
    concepts.map((concept) => [concept.id, []]),
  );
  for (const relation of [...relations].sort(byId)) {
    grouped.get(relation[key])?.push(relation);
  }
  return grouped;
}

function issue(
  code: KnowledgeCatalogIssueCode,
  path: string,
  detail: string,
): KnowledgeCatalogIssue {
  return { code, path, detail };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function includesString<T extends string>(
  values: readonly T[],
  value: unknown,
): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function byId<T extends { id: string }>(left: T, right: T): number {
  return left.id.localeCompare(right.id);
}
