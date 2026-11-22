import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildKnowledgeNeighborhood,
  createKnowledgeCatalogIndexes,
  incomingRelations,
  outgoingRelations,
  parseKnowledgeCatalog,
  projectPublishedKnowledge,
} from "./knowledge-catalog.ts";
import type {
  KnowledgeCatalog,
  KnowledgeConcept,
  KnowledgeConceptId,
  KnowledgePrerequisite,
  KnowledgeRelation,
} from "./knowledge-types.ts";

const POLICY = {
  blocksAccess: false,
  grantsXp: false,
  incomingAreCumulative: false,
} as const;

function concept(
  id: KnowledgeConceptId,
  editorialStatus: KnowledgeConcept["editorialStatus"] = "published",
): KnowledgeConcept {
  return {
    id,
    labels: { es: `ES ${id}`, en: `EN ${id}` },
    definition: { es: `Definición ${id}`, en: `Definition ${id}` },
    ontologyType: "process",
    families: ["physiology"],
    scale: "cellular",
    strata: ["S9"],
    editorialStatus,
    bindings: [],
  };
}

function relation(
  sequence: number,
  subject: KnowledgeConceptId,
  object: KnowledgeConceptId,
  predicate: KnowledgeRelation["predicate"] = "related_to",
  editorialStatus: KnowledgeRelation["editorialStatus"] = "published",
): KnowledgeRelation {
  return {
    id: `soma:R${String(sequence).padStart(6, "0")}`,
    subject,
    predicate,
    object,
    editorialStatus,
  };
}

function prerequisite(
  prerequisiteId: KnowledgeConceptId,
  conceptId: KnowledgeConceptId,
): KnowledgePrerequisite {
  return {
    id: "soma:P000001",
    prerequisite: prerequisiteId,
    concept: conceptId,
    strength: "recommended",
    rationale: { es: "Ayuda a comprender.", en: "Helps understanding." },
    editorialStatus: "published",
  };
}

function catalog(
  concepts: readonly KnowledgeConcept[],
  relations: readonly KnowledgeRelation[] = [],
  prerequisites: readonly KnowledgePrerequisite[] = [],
): KnowledgeCatalog {
  return { concepts, relations, prerequisites, prerequisitePolicy: POLICY };
}

function issueCodes(raw: unknown): string[] {
  const result = parseKnowledgeCatalog(raw);
  assert.equal(result.ok, false);
  return result.ok ? [] : result.issues.map((entry) => entry.code);
}

test("validation rejects duplicate ids and missing references", () => {
  const first = concept("soma:K000001");
  const raw = catalog(
    [first, { ...first }],
    [relation(1, first.id, "soma:K999999")],
  );
  const codes = issueCodes(raw);
  assert.ok(codes.includes("duplicate_id"));
  assert.ok(codes.includes("missing_reference"));
});

test("validation rejects missing required fields and incomplete ES/EN copy", () => {
  const rawConcept = {
    ...concept("soma:K000001"),
    labels: { es: "Carga", en: "" },
    definition: { es: "", en: "Charge." },
    families: [],
  };
  const codes = issueCodes(catalog([rawConcept as KnowledgeConcept]));
  assert.ok(codes.includes("missing_translation"));
  assert.ok(codes.includes("missing_field"));
});

test("validation accepts complete educational fields and rejects unsafe source URLs", () => {
  const complete = {
    ...concept("soma:K000001"),
    explanation: { es: "Explicación ampliada.", en: "Expanded explanation." },
    example: { es: "Ejemplo.", en: "Example." },
    references: [
      {
        id: "SRC-1",
        title: "Fuente sintética",
        publisher: "Editorial sintética",
        url: "https://example.test/source",
      },
    ],
    clarifications: [{ es: "Aclaración.", en: "Clarification." }],
    illustration: { kind: "process_diagram", assetGroup: "synthetic" },
  };
  const parsed = parseKnowledgeCatalog(catalog([complete]));
  assert.equal(parsed.ok, true);

  const unsafe = {
    ...complete,
    references: [{ ...complete.references[0], url: "file:///private/source" }],
  };
  assert.ok(issueCodes(catalog([unsafe])).includes("invalid_url"));
});

test("validation rejects unknown scientific predicates", () => {
  const one = concept("soma:K000001");
  const two = concept("soma:K000002");
  const rawRelation = {
    ...relation(1, one.id, two.id),
    predicate: "looks_like",
  };
  const codes = issueCodes(
    catalog([one, two], [rawRelation as unknown as KnowledgeRelation]),
  );
  assert.ok(codes.includes("unknown_predicate"));
});

test("public projection excludes candidate concepts and candidate edges", () => {
  const published = concept("soma:K000001");
  const candidate = concept("soma:K000002", "candidate");
  const projected = projectPublishedKnowledge(
    catalog(
      [published, candidate],
      [relation(1, published.id, candidate.id)],
      [prerequisite(published.id, candidate.id)],
    ),
  );
  assert.deepEqual(projected.concepts.map((item) => item.id), [published.id]);
  assert.deepEqual(projected.relations, []);
  assert.deepEqual(projected.prerequisites, []);
});

test("relations never expose a hidden endpoint", () => {
  const one = concept("soma:K000001");
  const hidden = concept("soma:K000002", "approved");
  const projected = projectPublishedKnowledge(
    catalog([one, hidden], [relation(1, hidden.id, one.id, "part_of")]),
  );
  assert.equal(projected.concepts.length, 1);
  assert.equal(projected.relations.length, 0);
});

test("an all-candidate source projects to a valid empty public catalog", () => {
  const candidate = concept("soma:K000001", "candidate");
  const projected = projectPublishedKnowledge(catalog([candidate]));
  assert.deepEqual(projected.concepts, []);
  assert.deepEqual(projected.relations, []);
  assert.deepEqual(projected.prerequisites, []);
  assert.deepEqual(projected.prerequisitePolicy, POLICY);
});

test("incoming traversal preserves authored subject, object and predicate", () => {
  const part = concept("soma:K000001");
  const whole = concept("soma:K000002");
  const edge = relation(1, part.id, whole.id, "part_of");
  const source = catalog([part, whole], [edge]);
  const indexes = createKnowledgeCatalogIndexes(source);
  assert.deepEqual(outgoingRelations(indexes, part.id), [edge]);
  assert.deepEqual(incomingRelations(indexes, whole.id), [edge]);

  const neighborhood = buildKnowledgeNeighborhood(source, whole.id, {
    maxDepth: 1,
  });
  assert.deepEqual(neighborhood.discoveries, [
    {
      relation: edge,
      from: whole.id,
      to: part.id,
      direction: "incoming",
    },
  ]);
  assert.equal(neighborhood.discoveries[0]?.relation.predicate, "part_of");
  assert.equal(neighborhood.discoveries[0]?.relation.subject, part.id);
});

test("one-hop and two-hop neighborhoods have distinct deterministic reach", () => {
  const concepts = [1, 2, 3, 4].map((number) =>
    concept(`soma:K${String(number).padStart(6, "0")}`),
  );
  const edges = [
    relation(2, concepts[1]!.id, concepts[2]!.id, "is_a"),
    relation(1, concepts[0]!.id, concepts[1]!.id, "related_to"),
    relation(3, concepts[2]!.id, concepts[3]!.id, "located_in"),
  ];
  const source = catalog(concepts, edges);
  const oneHop = buildKnowledgeNeighborhood(source, concepts[0]!.id, {
    maxDepth: 1,
  });
  const twoHop = buildKnowledgeNeighborhood(source, concepts[0]!.id, {
    maxDepth: 2,
  });
  assert.deepEqual(
    oneHop.concepts.map((item) => item.id),
    concepts.slice(0, 2).map((item) => item.id),
  );
  assert.deepEqual(
    twoHop.concepts.map((item) => item.id),
    concepts.slice(0, 3).map((item) => item.id),
  );
});

test("neighborhoods cap at 25 nodes and report deterministic truncation", () => {
  const concepts = Array.from({ length: 30 }, (_, index) =>
    concept(`soma:K${String(index + 1).padStart(6, "0")}`),
  );
  const edges = concepts
    .slice(1)
    .map((item, index) => relation(29 - index, concepts[0]!.id, item.id));
  const neighborhood = buildKnowledgeNeighborhood(
    catalog(concepts, edges),
    concepts[0]!.id,
    { maxDepth: 1, maxNodes: 100 },
  );
  assert.equal(neighborhood.maxNodes, 25);
  assert.equal(neighborhood.concepts.length, 25);
  assert.equal(neighborhood.truncated, true);
  assert.deepEqual(
    neighborhood.discoveries.map((item) => item.relation.id),
    Array.from(
      { length: 24 },
      (_, index) => `soma:R${String(index + 1).padStart(6, "0")}`,
    ),
  );
});

test("cycles and repeated endpoints do not cause infinite traversal", () => {
  const one = concept("soma:K000001");
  const two = concept("soma:K000002");
  const three = concept("soma:K000003");
  const neighborhood = buildKnowledgeNeighborhood(
    catalog(
      [one, two, three],
      [
        relation(1, one.id, two.id),
        relation(2, two.id, one.id),
        relation(3, one.id, two.id),
        relation(4, two.id, three.id),
        relation(5, three.id, one.id),
      ],
    ),
    one.id,
    { maxDepth: 2 },
  );
  assert.equal(neighborhood.concepts.length, 3);
  assert.equal(neighborhood.relations.length, 5);
  assert.equal(new Set(neighborhood.concepts.map((item) => item.id)).size, 3);
});

test("pedagogical prerequisites remain separate, non-blocking recommendations", () => {
  const one = concept("soma:K000001");
  const two = concept("soma:K000002");
  const three = concept("soma:K000003");
  const guidance = [
    prerequisite(one.id, three.id),
    { ...prerequisite(two.id, three.id), id: "soma:P000002" as const },
  ];
  const source = catalog([one, two, three], [], guidance);
  const indexes = createKnowledgeCatalogIndexes(source);
  assert.deepEqual(indexes.prerequisitesByConceptId.get(three.id), guidance);
  assert.deepEqual(outgoingRelations(indexes, one.id), []);
  assert.equal(source.prerequisitePolicy.blocksAccess, false);
  assert.equal(source.prerequisitePolicy.grantsXp, false);
  assert.equal(source.prerequisitePolicy.incomingAreCumulative, false);
});

test("a complete synthetic catalog parses without consulting scientific docs", () => {
  const one = concept("soma:K000001");
  const two = concept("soma:K000002");
  const result = parseKnowledgeCatalog(
    catalog(
      [one, two],
      [relation(1, one.id, two.id, "causally_upstream_of")],
      [prerequisite(one.id, two.id)],
    ),
  );
  assert.equal(result.ok, true);
});
