import assert from "node:assert/strict";
import { test } from "node:test";
import { projectPublishedKnowledge } from "./knowledge-catalog.ts";
import {
  buildKnowledgeMapModel,
  KNOWLEDGE_MAP_VIEWBOX,
} from "./knowledge-map-model.ts";
import type {
  KnowledgeCatalog,
  KnowledgeConcept,
  KnowledgeConceptId,
  KnowledgeRelation,
} from "./knowledge-types.ts";

function concept(index: number): KnowledgeConcept {
  const id = `soma:K${String(index).padStart(6, "0")}` as KnowledgeConceptId;
  return {
    id,
    labels: { es: `Concepto ${index}`, en: `Concept ${index}` },
    definition: { es: "Fixture sintética.", en: "Synthetic fixture." },
    ontologyType: "process",
    families: ["physiology"],
    scale: "cellular",
    strata: ["S9"],
    editorialStatus: "published",
    bindings: [],
  };
}

function relation(
  index: number,
  subject: KnowledgeConceptId,
  object: KnowledgeConceptId,
  predicate: KnowledgeRelation["predicate"] = "related_to",
): KnowledgeRelation {
  return {
    id: `soma:R${String(index).padStart(6, "0")}`,
    subject,
    predicate,
    object,
    editorialStatus: "published",
  };
}

function catalog(
  concepts: readonly KnowledgeConcept[],
  relations: readonly KnowledgeRelation[],
) {
  const source: KnowledgeCatalog = {
    concepts,
    relations,
    prerequisites: [],
    prerequisitePolicy: {
      blocksAccess: false,
      grantsXp: false,
      incomingAreCumulative: false,
    },
  };
  return projectPublishedKnowledge(source);
}

test("one and two hops reuse the neighborhood model without a global graph", () => {
  const concepts = [1, 2, 3, 4].map(concept);
  const relations = [
    relation(1, concepts[0]!.id, concepts[1]!.id, "is_a"),
    relation(2, concepts[2]!.id, concepts[0]!.id, "part_of"),
    relation(3, concepts[1]!.id, concepts[3]!.id, "related_to"),
  ];
  const source = catalog(concepts, relations);
  const oneHop = buildKnowledgeMapModel(source, concepts[0]!.id, 1);
  const twoHops = buildKnowledgeMapModel(source, concepts[0]!.id, 2);
  assert.deepEqual(
    oneHop.nodes.map((node) => node.concept.id).sort(),
    concepts.slice(0, 3).map((item) => item.id).sort(),
  );
  assert.equal(twoHops.nodes.length, 4);
  assert.equal(oneHop.nodes.find((node) => node.central)?.concept.id, concepts[0]!.id);
  assert.equal(oneHop.nodes.find((node) => node.central)?.depth, 0);
  assert.equal(twoHops.nodes.find((node) => node.concept.id === concepts[3]!.id)?.depth, 2);
});

test("incoming, outgoing and context edges preserve authored direction", () => {
  const concepts = [1, 2, 3, 4].map(concept);
  const relations = [
    relation(1, concepts[0]!.id, concepts[1]!.id, "is_a"),
    relation(2, concepts[2]!.id, concepts[0]!.id, "part_of"),
    relation(3, concepts[1]!.id, concepts[3]!.id, "causally_upstream_of"),
  ];
  const model = buildKnowledgeMapModel(catalog(concepts, relations), concepts[0]!.id, 2);
  assert.deepEqual(model.edges.map((edge) => edge.kind), ["outgoing", "incoming", "context"]);
  assert.deepEqual(
    model.edges.map((edge) => [edge.relation.subject, edge.relation.predicate, edge.relation.object]),
    relations.map((edge) => [edge.subject, edge.predicate, edge.object]),
  );
});

test("the layout is stable and deterministic", () => {
  const concepts = [1, 2, 3, 4, 5, 6].map(concept);
  const relations = concepts
    .slice(1)
    .map((item, index) => relation(index + 1, concepts[0]!.id, item.id));
  const source = catalog([...concepts].reverse(), [...relations].reverse());
  const first = buildKnowledgeMapModel(source, concepts[0]!.id, 1);
  const second = buildKnowledgeMapModel(source, concepts[0]!.id, 1);
  assert.deepEqual(first, second);
  assert.equal(new Set(first.nodes.map((node) => `${node.x}:${node.y}`)).size, first.nodes.length);
  assert.ok(first.nodes.every((node) => node.x >= 0 && node.x <= KNOWLEDGE_MAP_VIEWBOX.width));
  assert.ok(first.nodes.every((node) => node.y >= 0 && node.y <= KNOWLEDGE_MAP_VIEWBOX.height));
});

test("the visual model inherits the explicit 25-node cap and truncation", () => {
  const concepts = Array.from({ length: 30 }, (_, index) => concept(index + 1));
  const relations = concepts
    .slice(1)
    .map((item, index) => relation(index + 1, concepts[0]!.id, item.id));
  const model = buildKnowledgeMapModel(catalog(concepts, relations), concepts[0]!.id, 1);
  assert.equal(model.nodes.length, 25);
  assert.equal(model.maxNodes, 25);
  assert.equal(model.truncated, true);
});

test("empty relations keep a central node and no invented connection", () => {
  const root = concept(1);
  const model = buildKnowledgeMapModel(catalog([root], []), root.id, 2);
  assert.equal(model.nodes.length, 1);
  assert.equal(model.nodes[0]?.central, true);
  assert.deepEqual(model.edges, []);
  assert.equal(model.truncated, false);
});

test("cycles and repeated endpoints terminate and offset parallel edges", () => {
  const concepts = [1, 2, 3].map(concept);
  const relations = [
    relation(1, concepts[0]!.id, concepts[1]!.id),
    relation(2, concepts[1]!.id, concepts[0]!.id),
    relation(3, concepts[0]!.id, concepts[1]!.id, "participates_in"),
    relation(4, concepts[1]!.id, concepts[2]!.id),
    relation(5, concepts[2]!.id, concepts[0]!.id),
  ];
  const model = buildKnowledgeMapModel(catalog(concepts, relations), concepts[0]!.id, 2);
  assert.equal(model.nodes.length, 3);
  assert.equal(model.edges.length, 5);
  const parallel = model.edges.filter(
    (edge) =>
      edge.relation.subject === concepts[0]!.id &&
      edge.relation.object === concepts[1]!.id,
  );
  assert.equal(parallel.length, 2);
  assert.notDeepEqual(
    [parallel[0]?.labelX, parallel[0]?.labelY],
    [parallel[1]?.labelX, parallel[1]?.labelY],
  );
});
