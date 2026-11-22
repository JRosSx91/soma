import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import enCommon from "../../../i18n/locales/en/common.json" with { type: "json" };
import enKnowledge from "../../../i18n/locales/en/knowledge.json" with { type: "json" };
import esCommon from "../../../i18n/locales/es/common.json" with { type: "json" };
import esKnowledge from "../../../i18n/locales/es/knowledge.json" with { type: "json" };
import { ShellBaseProvider } from "../context/ShellBaseContext.js";
import type { ShellBase } from "../shell-base.js";
import { projectPublishedKnowledge } from "./knowledge-catalog.js";
import { KnowledgeBrowser } from "./KnowledgeBrowser.js";
import { PUBLIC_KNOWLEDGE_CATALOG } from "./public-knowledge-catalog.js";
import type { KnowledgeCatalog, KnowledgeConcept } from "./knowledge-types.js";

const one: KnowledgeConcept = {
  id: "soma:K000001",
  labels: { es: "Neurona sintética", en: "Synthetic neuron" },
  definition: {
    es: "Fixture explícita para probar la interfaz.",
    en: "Explicit fixture for interface testing.",
  },
  explanation: {
    es: "Explicación sintética suficientemente larga para comprobar una lectura cómoda y el ajuste de texto sin introducir contenido científico real.",
    en: "A sufficiently long synthetic explanation used to verify comfortable reading and text wrapping without introducing real scientific content.",
  },
  example: {
    es: "Ejemplo educativo sintético.",
    en: "Synthetic educational example.",
  },
  references: [
    {
      id: "SRC-SYNTHETIC",
      title: "Fuente sintética consultable",
      publisher: "Editorial de pruebas",
      url: "https://example.test/scientific-source",
    },
  ],
  clarifications: [
    {
      es: "Esta es una aclaración científica sintética.",
      en: "This is a synthetic scientific clarification.",
    },
  ],
  illustration: {
    kind: "process_diagram",
    assetGroup: "synthetic-fixture",
  },
  ontologyType: "cell_type",
  families: ["cell_biology", "physiology"],
  scale: "cellular",
  strata: ["S8"],
  editorialStatus: "published",
  bindings: [{ surface: "mission", id: "edu-dopamine-01" }],
};

const two: KnowledgeConcept = {
  ...one,
  id: "soma:K000002",
  labels: { es: "Sinapsis sintética", en: "Synthetic synapse" },
  definition: {
    es: "Segunda fixture sin contenido científico real.",
    en: "Second fixture without real scientific content.",
  },
  ontologyType: "cellular_component",
  bindings: [],
};

const source: KnowledgeCatalog = {
  concepts: [one, two],
  relations: [
    {
      id: "soma:R000001",
      subject: one.id,
      predicate: "related_to",
      object: two.id,
      editorialStatus: "published",
    },
  ],
  prerequisites: [
    {
      id: "soma:P000001",
      prerequisite: two.id,
      concept: one.id,
      strength: "recommended",
      rationale: {
        es: "Orden pedagógico sintético.",
        en: "Synthetic learning order.",
      },
      editorialStatus: "published",
    },
  ],
  prerequisitePolicy: {
    blocksAccess: false,
    grantsXp: false,
    incomingAreCumulative: false,
  },
};
const syntheticCatalog = projectPublishedKnowledge(source);

async function render(
  base: ShellBase,
  lng: "es" | "en",
  catalog = PUBLIC_KNOWLEDGE_CATALOG,
  query = "",
  route = `${base}/explore/knowledge`,
): Promise<string> {
  const instance = i18n.createInstance();
  await instance.use(initReactI18next).init({
    lng,
    resources: {
      es: { common: esCommon, knowledge: esKnowledge },
      en: { common: enCommon, knowledge: enKnowledge },
    },
    interpolation: { escapeValue: false },
  });
  return renderToStaticMarkup(
    createElement(
      I18nextProvider,
      { i18n: instance },
      createElement(
        MemoryRouter,
        { initialEntries: [`${route}${query}`] },
        createElement(
          ShellBaseProvider,
          { base, children: createElement(KnowledgeBrowser, { catalog }) },
        ),
      ),
    ),
  );
}

test("the public runtime catalog is empty and shows no candidate fallback", async () => {
  assert.equal(PUBLIC_KNOWLEDGE_CATALOG.concepts.length, 0);
  assert.equal(PUBLIC_KNOWLEDGE_CATALOG.relations.length, 0);
  assert.equal(PUBLIC_KNOWLEDGE_CATALOG.prerequisites.length, 0);
  const es = await render("/preview", "es");
  const en = await render("/app", "en");
  assert.ok(es.includes(esKnowledge.unavailableTitle));
  assert.ok(en.includes(enKnowledge.unavailableTitle));
  assert.equal(es.includes("soma:K"), false);
  assert.equal(en.includes("soma:K"), false);
});

test("synthetic published concepts render semantic controls and a deep-linked sheet", async () => {
  const markup = await render(
    "/preview",
    "es",
    syntheticCatalog,
    "?concept=soma%3AK000001",
  );
  assert.match(markup, /type="search"/);
  assert.equal((markup.match(/<select/g) ?? []).length, 3);
  assert.ok(markup.includes('aria-current="true"'));
  assert.ok(markup.includes('role="dialog"'));
  assert.ok(markup.includes('aria-modal="true"'));
  assert.ok(markup.includes("Neurona sintética"));
  assert.ok(markup.includes(esKnowledge.detail.outgoing));
  assert.ok(markup.includes(esKnowledge.detail.incoming));
  assert.ok(markup.includes(esKnowledge.detail.prerequisitesNotice));
  assert.ok(markup.includes(esKnowledge.detail.explanation));
  assert.ok(markup.includes(esKnowledge.detail.example));
  assert.ok(markup.includes(esKnowledge.detail.clarifications));
  assert.ok(markup.includes(esKnowledge.detail.sources));
  assert.ok(markup.includes(esKnowledge.detail.futureIllustration));
  assert.ok(markup.includes("Explicación sintética suficientemente larga"));
  assert.ok(markup.includes("Ejemplo educativo sintético"));
  assert.ok(markup.includes("Esta es una aclaración científica sintética"));
  assert.ok(markup.includes("https://example.test/scientific-source"));
  assert.ok(markup.includes('target="_blank"'));
  assert.ok(markup.includes('rel="noreferrer"'));
  assert.ok(markup.includes("Sinapsis sintética"));
  assert.ok(markup.includes('/preview/missions'));
  assert.ok(markup.includes('data-knowledge-map="contextual"'));
  assert.ok(markup.includes(esKnowledge.map.textAlternative));
  assert.ok(markup.includes(esKnowledge.predicates.related_to));
  assert.ok(markup.includes('marker-end="url(#'));
  assert.equal((markup.match(/name="knowledge-map-depth-/g) ?? []).length, 2);
});

test("optional educational sections do not render empty controls", async () => {
  const minimal: KnowledgeConcept = {
    id: "soma:K000003",
    labels: { es: "Concepto mínimo", en: "Minimal concept" },
    definition: { es: "Definición mínima.", en: "Minimal definition." },
    ontologyType: "process",
    families: ["physiology"],
    scale: "cellular",
    strata: ["S9"],
    editorialStatus: "published",
    bindings: [],
  };
  const minimalCatalog = projectPublishedKnowledge({
    concepts: [minimal],
    relations: [],
    prerequisites: [],
    prerequisitePolicy: source.prerequisitePolicy,
  });
  const markup = await render(
    "/preview",
    "es",
    minimalCatalog,
    "?concept=soma%3AK000003",
  );
  assert.equal(markup.includes(esKnowledge.detail.example), false);
  assert.equal(markup.includes(esKnowledge.detail.clarifications), false);
  assert.equal(markup.includes(esKnowledge.detail.sources), false);
  assert.equal(markup.includes(esKnowledge.detail.futureIllustration), false);
});

test("DEMO and LIVE related links remain inside their active shell base", async () => {
  for (const base of ["/preview", "/app"] as const) {
    const markup = await render(
      base,
      "en",
      syntheticCatalog,
      "?concept=soma%3AK000001",
    );
    assert.ok(markup.includes(`href="${base}/missions"`));
    const other = base === "/app" ? "/preview/" : "/app/";
    assert.equal(markup.includes(`href="${other}`), false);
  }
});

test("the provisional page already uses the future Expedition centre identity", async () => {
  const es = await render("/preview", "es");
  const en = await render("/app", "en");
  assert.ok(es.includes(esKnowledge.eyebrow));
  assert.ok(en.includes(enKnowledge.eyebrow));
  assert.equal(es.includes("Volver a Explorar"), false);
  assert.equal(en.includes("Back to Explore"), false);
});

test("future DEMO and LIVE canonical Expedition deep links render the same browser", async () => {
  for (const base of ["/preview", "/app"] as const) {
    const markup = await render(
      base,
      "en",
      syntheticCatalog,
      "?concept=soma%3AK000001",
      `${base}/expedition`,
    );
    assert.ok(markup.includes('data-knowledge-concept="soma:K000001"'));
    assert.ok(markup.includes(`href="${base}/missions"`));
    assert.equal(markup.includes("Back to Explore"), false);
  }
});

test("routes are shared without adding a sidebar, dock or main-menu entry", () => {
  const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
  const shell = readFileSync(new URL("../shell-base.ts", import.meta.url), "utf8");
  const shared = app.slice(app.indexOf("const soma2Pages"), app.indexOf("function App()"));
  assert.match(shared, /path="explore\/knowledge" element=\{<KnowledgePage \/>\}/);
  assert.match(shared, /path="expedition" element=\{<ExpeditionPage \/>\}/);
  assert.equal(shared.includes('path="expedition" element={<KnowledgePage />}'), false);
  assert.equal(shell.includes("/explore/knowledge"), false);
  assert.equal(shell.includes("knowledge"), false);
});

test("the browser uses native controls, focus styles and reduced-motion safeguards", () => {
  const browser = readFileSync(new URL("./KnowledgeBrowser.tsx", import.meta.url), "utf8");
  const map = readFileSync(new URL("./KnowledgeContextMap.tsx", import.meta.url), "utf8");
  assert.match(browser, /type="search"/);
  assert.match(browser, /<select/);
  assert.match(browser, /previewFocus/);
  assert.match(browser, /aria-live="polite"/);
  assert.match(browser, /aria-current=/);
  assert.match(browser, /motion-reduce:transition-none/);
  assert.match(browser, /DetailSheet/);
  assert.match(browser, /closest<HTMLElement>\("\[role='dialog'\]"\)\?\.focus\(\)/);
  assert.equal(browser.includes("overflow-x-auto"), false);
  assert.equal(browser.includes("localStorage"), false);
  assert.equal(browser.includes("fetch("), false);
  assert.match(map, /event\.key !== "Enter" && event\.key !== " "/);
  assert.match(map, /motion-reduce:transition-none/);
  assert.match(map, /lg:hidden/);
  assert.match(map, /lg:block/);
  assert.match(map, /textAlternative/);
  assert.equal(map.includes("overflow-x-auto"), false);
  assert.equal(map.includes("localStorage"), false);
});

test("runtime sources do not import scientific design JSON or candidate fallbacks", () => {
  for (const name of [
    "public-knowledge-catalog.ts",
    "knowledge-browser-model.ts",
    "KnowledgeBrowser.tsx",
    "KnowledgeContextMap.tsx",
    "knowledge-map-model.ts",
  ]) {
    const source = readFileSync(new URL(name, import.meta.url), "utf8");
    assert.equal(/from\s+["'][^"']+\.json["']/.test(source), false, name);
    assert.equal(source.includes("docs/design/gam-03b"), false, name);
    assert.equal(source.includes("soma:K0000"), false, name);
  }
});
