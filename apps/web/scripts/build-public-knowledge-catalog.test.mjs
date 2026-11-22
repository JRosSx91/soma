import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  createPublicKnowledgeCatalog,
  renderPublicKnowledgeModule,
  writePublicKnowledgeModule,
} from "./build-public-knowledge-catalog.mjs";

const POLICY = {
  blocksAccess: false,
  grantsXp: false,
  incomingAreCumulative: false,
};

function concept(id) {
  return {
    id,
    labels: { es: `ES ${id}`, en: `EN ${id}` },
    definition: { es: `Definición ${id}`, en: `Definition ${id}` },
    ontologyType: "process",
    families: ["physiology"],
    scale: "cellular",
    strata: ["S9"],
    editorialStatus: "candidate",
    references: ["REF"],
    bindings: [],
  };
}

function card(id) {
  return {
    id,
    title: { es: `Título ${id}`, en: `Title ${id}` },
    shortDefinition: { es: `Definición ${id}`, en: `Definition ${id}` },
    explanation: {
      es: `Explicación ampliada ${id}`,
      en: `Expanded explanation ${id}`,
    },
    example: { es: `Ejemplo ${id}`, en: `Example ${id}` },
    publicClarifications: [
      { es: `Aclaración ${id}`, en: `Clarification ${id}` },
    ],
    visualProposal: {
      kind: "process_diagram",
      assetGroup: "synthetic-fixture",
      description: "Internal description that must not be exported.",
    },
    sourceIds: ["SRC"],
    editorialAssessment: {
      notes: "Internal editorial note that must not be exported.",
    },
  };
}

function relation(id, subject, object, extra = {}) {
  return {
    id,
    subject,
    predicate: "related_to",
    object,
    references: ["REF"],
    editorialStatus: "candidate",
    ...extra,
  };
}

function review(id, includeInFirstRelease = true) {
  return { id, includeInFirstRelease, sourceIds: ["SRC"] };
}

function approvedManifest({ concepts = [], relations = [], prerequisites = [] } = {}) {
  const selected = concepts.length + relations.length + prerequisites.length;
  const decision = (kind) => ({
    decisionId: `synthetic-${kind}-decision`,
    approvedBy: "test-reviewer",
    approvedOn: "2026-11-21",
  });
  return {
    schemaVersion: 1,
    manifestId: "synthetic-test",
    authorization: selected
      ? {
          concepts: concepts.length ? decision("concepts") : null,
          relations: relations.length ? decision("relations") : null,
          prerequisites: prerequisites.length ? decision("prerequisites") : null,
        }
      : null,
    authorizedConceptIds: concepts,
    authorizedRelationIds: relations,
    authorizedPrerequisiteIds: prerequisites,
  };
}

function fixture() {
  const one = concept("soma:K000001");
  const two = concept("soma:K000002");
  const edge = relation("soma:R000001", one.id, two.id);
  return {
    conceptsCatalog: {
      sourceRegistry: { REF: "https://example.test/reference" },
      concepts: [one, two],
    },
    relationsCatalog: {
      allowedPredicates: ["related_to"],
      relations: [edge],
    },
    learningCatalog: {
      prerequisites: [
        {
          id: "soma:P000001",
          prerequisite: one.id,
          concept: two.id,
          strength: "recommended",
          rationale: { es: "Ayuda.", en: "Helps." },
        },
      ],
    },
    editorialBatch: {
      sources: [
        {
          id: "SRC",
          title: "Synthetic source",
          publisher: "Synthetic publisher",
          url: "https://example.test/source",
          scope: "Internal audit scope",
        },
      ],
      conceptCards: [card(one.id), card(two.id)],
      relationReviews: [review(edge.id)],
    },
    manifest: approvedManifest(),
  };
}

test("an empty manifest builds an empty safe catalog", () => {
  const catalog = createPublicKnowledgeCatalog(fixture());
  assert.deepEqual(catalog, {
    concepts: [],
    relations: [],
    prerequisites: [],
    prerequisitePolicy: POLICY,
  });
});

test("an explicitly authorized concept is sanitized and published", () => {
  const input = fixture();
  input.manifest = approvedManifest({ concepts: ["soma:K000001"] });
  const catalog = createPublicKnowledgeCatalog(input);
  assert.deepEqual(catalog.concepts.map((item) => item.id), ["soma:K000001"]);
  assert.equal(catalog.concepts[0].editorialStatus, "published");
  assert.equal(catalog.concepts[0].explanation.en, "Expanded explanation soma:K000001");
  assert.equal(catalog.concepts[0].example.es, "Ejemplo soma:K000001");
  assert.equal(catalog.concepts[0].references[0].publisher, "Synthetic publisher");
  assert.equal(catalog.concepts[0].clarifications.length, 1);
  assert.deepEqual(catalog.concepts[0].illustration, {
    kind: "process_diagram",
    assetGroup: "synthetic-fixture",
  });
  assert.equal("sourceIds" in catalog.concepts[0], false);
  assert.equal("editorialAssessment" in catalog.concepts[0], false);
  assert.equal("scope" in catalog.concepts[0].references[0], false);
  assert.equal("description" in catalog.concepts[0].illustration, false);
});

test("examples, clarifications and illustration hints remain optional", () => {
  const input = fixture();
  delete input.editorialBatch.conceptCards[1].example;
  delete input.editorialBatch.conceptCards[1].publicClarifications;
  delete input.editorialBatch.conceptCards[1].visualProposal;
  input.manifest = approvedManifest({ concepts: ["soma:K000002"] });
  const published = createPublicKnowledgeCatalog(input).concepts[0];
  assert.equal("example" in published, false);
  assert.equal("clarifications" in published, false);
  assert.equal("illustration" in published, false);
});

test("an existing but unauthorized concept is omitted", () => {
  const input = fixture();
  input.manifest = approvedManifest({ concepts: ["soma:K000001"] });
  const catalog = createPublicKnowledgeCatalog(input);
  assert.equal(catalog.concepts.some((item) => item.id === "soma:K000002"), false);
});

test("an approved relation is emitted only with both authorized endpoints", () => {
  const input = fixture();
  input.manifest = approvedManifest({
    concepts: ["soma:K000002", "soma:K000001"],
    relations: ["soma:R000001"],
  });
  const catalog = createPublicKnowledgeCatalog(input);
  assert.deepEqual(catalog.relations.map((item) => item.id), ["soma:R000001"]);
});

test("a relation with a hidden endpoint is rejected", () => {
  const input = fixture();
  input.manifest = approvedManifest({
    concepts: ["soma:K000001"],
    relations: ["soma:R000001"],
  });
  assert.throws(
    () => createPublicKnowledgeCatalog(input),
    /unauthorized object soma:K000002/,
  );
});

test("a scoped relation is rejected because runtime cannot preserve scope", () => {
  const input = fixture();
  input.relationsCatalog.relations[0].scope = "synthetic narrow scope";
  input.manifest = approvedManifest({
    concepts: ["soma:K000001", "soma:K000002"],
    relations: ["soma:R000001"],
  });
  assert.throws(() => createPublicKnowledgeCatalog(input), /depends on scope/);
});

test("incomplete ES/EN copy is rejected", () => {
  const input = fixture();
  input.editorialBatch.conceptCards[0].shortDefinition.en = "";
  input.manifest = approvedManifest({ concepts: ["soma:K000001"] });
  assert.throws(() => createPublicKnowledgeCatalog(input), /shortDefinition\.en/);

  const incompleteExplanation = fixture();
  incompleteExplanation.editorialBatch.conceptCards[0].explanation.es = "";
  incompleteExplanation.manifest = approvedManifest({ concepts: ["soma:K000001"] });
  assert.throws(
    () => createPublicKnowledgeCatalog(incompleteExplanation),
    /explanation\.es/,
  );
});

test("invalid or non-public reference URLs are rejected", () => {
  for (const url of ["not-a-url", "file:///private/source.pdf"]) {
    const input = fixture();
    input.editorialBatch.sources[0].url = url;
    input.manifest = approvedManifest({ concepts: ["soma:K000001"] });
    assert.throws(() => createPublicKnowledgeCatalog(input), /public URL|HTTP or HTTPS/);
  }
});

test("unknown source and entity references are rejected", () => {
  const unknownSource = fixture();
  unknownSource.conceptsCatalog.concepts[0].references = ["MISSING"];
  unknownSource.manifest = approvedManifest({ concepts: ["soma:K000001"] });
  assert.throws(() => createPublicKnowledgeCatalog(unknownSource), /unknown source/);

  const unknownEntity = fixture();
  unknownEntity.manifest = approvedManifest({ concepts: ["soma:K999999"] });
  assert.throws(() => createPublicKnowledgeCatalog(unknownEntity), /does not exist/);
});

test("duplicate ids in a manifest are rejected", () => {
  const input = fixture();
  input.manifest = approvedManifest({
    concepts: ["soma:K000001", "soma:K000001"],
  });
  assert.throws(() => createPublicKnowledgeCatalog(input), /duplicate ids/);
});

test("prerequisites remain non-blocking and grant no XP", () => {
  const input = fixture();
  input.manifest = approvedManifest({
    concepts: ["soma:K000001", "soma:K000002"],
    prerequisites: ["soma:P000001"],
  });
  const catalog = createPublicKnowledgeCatalog(input);
  assert.equal(catalog.prerequisites.length, 1);
  assert.deepEqual(catalog.prerequisitePolicy, POLICY);
});

test("candidate records not selected by the manifest cannot enter generated output", () => {
  const input = fixture();
  input.manifest = approvedManifest({ concepts: ["soma:K000001"] });
  const output = renderPublicKnowledgeModule(createPublicKnowledgeCatalog(input));
  assert.match(output, /soma:K000001/);
  assert.doesNotMatch(output, /soma:K000002/);
  assert.doesNotMatch(output, /editorialStatus": "candidate/);
  assert.doesNotMatch(output, /Internal editorial note/);
  assert.doesNotMatch(output, /Internal audit scope/);
});

test("failed generation leaves the previous artifact untouched", () => {
  const directory = mkdtempSync(join(tmpdir(), "soma-knowledge-"));
  const output = join(directory, "catalog.generated.ts");
  try {
    writeFileSync(output, "sentinel-old-catalog", "utf8");
    const input = fixture();
    input.editorialBatch.conceptCards[0].explanation.en = "";
    input.manifest = approvedManifest({ concepts: ["soma:K000001"] });
    assert.throws(() => writePublicKnowledgeModule(output, input), /explanation\.en/);
    assert.equal(readFileSync(output, "utf8"), "sentinel-old-catalog");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("output ordering and module rendering are deterministic", () => {
  const first = fixture();
  first.manifest = approvedManifest({
    concepts: ["soma:K000002", "soma:K000001"],
    relations: ["soma:R000001"],
  });
  const second = fixture();
  second.conceptsCatalog.concepts.reverse();
  second.editorialBatch.conceptCards.reverse();
  second.manifest = first.manifest;
  const firstOutput = renderPublicKnowledgeModule(createPublicKnowledgeCatalog(first));
  const secondOutput = renderPublicKnowledgeModule(createPublicKnowledgeCatalog(second));
  assert.equal(firstOutput, secondOutput);
});
