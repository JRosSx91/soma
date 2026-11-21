import assert from "node:assert/strict";
import { test } from "node:test";
import { projectPublishedKnowledge } from "./knowledge-catalog.ts";
import {
  EMPTY_KNOWLEDGE_FILTERS,
  filterKnowledgeConcepts,
  KNOWLEDGE_CONCEPT_QUERY_KEY,
  knowledgeFilterOptions,
  resolveKnowledgeConceptParam,
  sanitizeKnowledgeSearchParams,
  writeKnowledgeConceptSearchParams,
} from "./knowledge-browser-model.ts";
import type {
  KnowledgeCatalog,
  KnowledgeConcept,
  KnowledgeConceptId,
} from "./knowledge-types.ts";

function concept(
  id: KnowledgeConceptId,
  es: string,
  en: string,
  options: Partial<KnowledgeConcept> = {},
): KnowledgeConcept {
  return {
    id,
    labels: { es, en },
    definition: {
      es: `Definición educativa de ${es}`,
      en: `Educational definition of ${en}`,
    },
    ontologyType: "process",
    families: ["physiology"],
    scale: "cellular",
    strata: ["S9"],
    editorialStatus: "published",
    bindings: [],
    ...options,
  };
}

function publicCatalog(concepts: readonly KnowledgeConcept[]) {
  const source: KnowledgeCatalog = {
    concepts,
    relations: [],
    prerequisites: [],
    prerequisitePolicy: {
      blocksAccess: false,
      grantsXp: false,
      incomingAreCumulative: false,
    },
  };
  return projectPublishedKnowledge(source);
}

const membrane = concept(
  "soma:K000001",
  "Membrana biológica",
  "Biological membrane",
  { families: ["cell_biology", "biochemistry"], strata: ["S6"] },
);
const signaling = concept(
  "soma:K000002",
  "Señalización neuronal",
  "Neuronal signalling",
  { families: ["physiology"], strata: ["S9"] },
);
const catalog = publicCatalog([signaling, membrane]);

test("search matches ES and EN labels and definitions without accents", () => {
  for (const query of ["membrana", "membrane", "biologica", "educational"] as const) {
    const results = filterKnowledgeConcepts(
      catalog,
      { ...EMPTY_KNOWLEDGE_FILTERS, query },
      "es",
    );
    assert.equal(results.some((item) => item.id === membrane.id), true, query);
  }
});

test("family, stratum and ontology filters compose without synthetic categories", () => {
  const results = filterKnowledgeConcepts(
    catalog,
    {
      query: "",
      family: "cell_biology",
      stratum: "S6",
      ontologyType: "process",
    },
    "en",
  );
  assert.deepEqual(results.map((item) => item.id), [membrane.id]);
  assert.deepEqual(knowledgeFilterOptions(catalog), {
    families: ["biochemistry", "cell_biology", "physiology"],
    strata: ["S6", "S9"],
    ontologyTypes: ["process"],
  });
});

test("results sort by the active language and then stable id", () => {
  assert.deepEqual(
    filterKnowledgeConcepts(catalog, EMPTY_KNOWLEDGE_FILTERS, "es").map(
      (item) => item.labels.es,
    ),
    ["Membrana biológica", "Señalización neuronal"],
  );
  assert.deepEqual(
    filterKnowledgeConcepts(catalog, EMPTY_KNOWLEDGE_FILTERS, "en").map(
      (item) => item.labels.en,
    ),
    ["Biological membrane", "Neuronal signalling"],
  );
});

test("deep links resolve published ids and reject absent or malformed ids", () => {
  assert.equal(resolveKnowledgeConceptParam(catalog, membrane.id), membrane.id);
  assert.equal(resolveKnowledgeConceptParam(catalog, "soma:K999999"), null);
  assert.equal(resolveKnowledgeConceptParam(catalog, "candidate"), null);
  assert.equal(resolveKnowledgeConceptParam(catalog, null), null);

  const current = new URLSearchParams("keep=1&concept=soma%3AK999999");
  const opened = writeKnowledgeConceptSearchParams(current, membrane.id, catalog);
  assert.equal(opened.get(KNOWLEDGE_CONCEPT_QUERY_KEY), membrane.id);
  assert.equal(opened.has("keep"), false);
  const closed = writeKnowledgeConceptSearchParams(opened, null, catalog);
  assert.equal(closed.has(KNOWLEDGE_CONCEPT_QUERY_KEY), false);
  assert.equal([...closed].length, 0);
});

test("route query sanitization whitelists only a published concept", () => {
  const valid = sanitizeKnowledgeSearchParams(
    new URLSearchParams(
      `source=legacy&concept=${encodeURIComponent(membrane.id)}&xp=999`,
    ),
    catalog,
  );
  assert.equal(valid.toString(), `concept=${encodeURIComponent(membrane.id)}`);

  const invalid = sanitizeKnowledgeSearchParams(
    new URLSearchParams("concept=soma%3AK999999&token=secret"),
    catalog,
  );
  assert.equal(invalid.toString(), "");
});

test("candidate concepts are absent before browser filtering", () => {
  const candidate = concept("soma:K000003", "Candidato", "Candidate", {
    editorialStatus: "candidate",
  });
  const projected = publicCatalog([membrane, candidate]);
  assert.deepEqual(projected.concepts.map((item) => item.id), [membrane.id]);
  assert.equal(
    filterKnowledgeConcepts(
      projected,
      { ...EMPTY_KNOWLEDGE_FILTERS, query: "candidate" },
      "en",
    ).length,
    0,
  );
});
