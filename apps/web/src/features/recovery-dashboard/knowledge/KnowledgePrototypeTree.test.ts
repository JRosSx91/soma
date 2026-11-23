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
import { ShellLayoutProvider } from "../context/ShellLayoutProvider.js";
import { KnowledgePrototypePage, PrototypePlayableRequirements } from "../pages/KnowledgePrototypePage.js";
import { KnowledgePrototypeTree } from "./KnowledgePrototypeTree.js";
import { buildPrototypeLayout } from "./knowledge-prototype-layout.js";
import { buildRenderedConnections, verticalFlowPath } from "./knowledge-prototype-connections.js";
import { buildStratumZones, PROTOTYPE_STRATUM_ORDER, referenceLayoutNodes } from "./knowledge-prototype-strata.js";
import { KNOWLEDGE_PROTOTYPE_COPY } from "./knowledge-prototype-copy.js";
import {
  KNOWLEDGE_PROTOTYPE_CATALOG,
  KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
  KNOWLEDGE_PROTOTYPE_NODES,
  KNOWLEDGE_PROTOTYPE_SPINE_IDS,
  KNOWLEDGE_PROTOTYPE_SCENARIOS,
  prototypeCatalogForScenario,
  prototypeNodesForScenario,
  type KnowledgePrototypeScenario,
} from "./knowledge-prototype-fixture.js";
import { PUBLIC_KNOWLEDGE_CATALOG } from "./public-knowledge-catalog.js";

const MOBILE_METRICS = {
  width: 360,
  top: 84,
  rowGap: 198,
  sideMargin: 72,
  cardHalfHeight: 88,
};

async function instanceFor(lng: "es" | "en") {
  const instance = i18n.createInstance();
  await instance.use(initReactI18next).init({
    lng,
    resources: {
      es: { common: esCommon, knowledge: esKnowledge },
      en: { common: enCommon, knowledge: enKnowledge },
    },
    interpolation: { escapeValue: false },
  });
  return instance;
}

async function renderPage(lng: "es" | "en", query = "") {
  const instance = await instanceFor(lng);
  return renderToStaticMarkup(
    createElement(I18nextProvider, { i18n: instance },
      createElement(MemoryRouter, { initialEntries: [`/preview/dev/knowledge-prototype${query}`] },
        createElement(ShellBaseProvider, { base: "/preview" },
          createElement(ShellLayoutProvider, null, createElement(KnowledgePrototypePage)),
        ),
      ),
    ),
  );
}

async function renderTree(
  lng: "es" | "en",
  scenario: KnowledgePrototypeScenario,
  selectedId: (typeof KNOWLEDGE_PROTOTYPE_NODES)[number]["id"] | null = null,
) {
  const instance = await instanceFor(lng);
  return renderToStaticMarkup(
    createElement(I18nextProvider, { i18n: instance },
      createElement(KnowledgePrototypeTree, {
        catalog: KNOWLEDGE_PROTOTYPE_CATALOG,
        nodes: prototypeNodesForScenario(scenario),
        dependencies: KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
        language: lng,
        selectedId,
        onSelect: () => undefined,
      }),
    ),
  );
}

test("playable prototype exposes spark rates and isolated QA scenarios", async () => {
  const markup = await renderPage("es");
  assert.ok(markup.includes('data-knowledge-prototype="game-02d"'));
  assert.ok(markup.includes('data-prototype-layout-organic="true"'));
  assert.ok(markup.includes('data-prototype-map-tap-surface="true"'));
  assert.ok(markup.includes('data-prototype-map-connections="true"'));
  assert.ok(markup.includes('data-prototype-background="strata"'));
  assert.ok(markup.includes('data-prototype-layout="vertical"'));
  assert.ok(markup.includes("Centro de Expedición"));
  assert.ok(markup.includes("Chispas de Curiosidad"));
  assert.ok(markup.includes("Por toque"));
  assert.equal(markup.includes("Analizar"), false);
  assert.ok(markup.includes('data-dev-qa-scenarios="true"'));
  assert.equal(markup.includes("DEMO"), false);
  assert.equal(markup.includes("Prueba el futuro mapa científico."), false);
});

test("three ephemeral scenarios cover discovered, available, researching, hinted and hidden", () => {
  assert.deepEqual(Object.keys(KNOWLEDGE_PROTOTYPE_SCENARIOS), ["start", "middle", "advanced", "complete"]);
  const states = new Set(
    Object.values(KNOWLEDGE_PROTOTYPE_SCENARIOS).flatMap((scenario) =>
      Object.values(scenario.states).map((item) => item.state),
    ),
  );
  assert.deepEqual([...states].sort(), ["available", "discovered", "hidden", "hinted", "researching"]);
  assert.equal(prototypeNodesForScenario("middle").find((node) => node.state === "researching")?.progress, 58);
});

test("development-only copy keeps equivalent ES and EN contracts", () => {
  assert.deepEqual(
    Object.keys(KNOWLEDGE_PROTOTYPE_COPY.es).sort(),
    Object.keys(KNOWLEDGE_PROTOTYPE_COPY.en).sort(),
  );
  assert.deepEqual(
    Object.keys(KNOWLEDGE_PROTOTYPE_COPY.es.resources).sort(),
    Object.keys(KNOWLEDGE_PROTOTYPE_COPY.en.resources).sort(),
  );
  assert.deepEqual(
    Object.keys(KNOWLEDGE_PROTOTYPE_COPY.es.states).sort(),
    Object.keys(KNOWLEDGE_PROTOTYPE_COPY.en.states).sort(),
  );
});

test("hinted and hidden discoveries do not leak identity or expose a detail control", async () => {
  const markup = await renderTree("es", "middle");
  const hinted = KNOWLEDGE_PROTOTYPE_NODES[7]!;
  const hidden = KNOWLEDGE_PROTOTYPE_NODES[8]!;
  assert.ok(markup.includes("Descubrimiento desconocido"));
  assert.ok(markup.includes('data-prototype-mystery="true"'));
  assert.equal(markup.includes(KNOWLEDGE_PROTOTYPE_CATALOG.concepts[7]!.labels.es), false);
  assert.equal(markup.includes(KNOWLEDGE_PROTOTYPE_CATALOG.concepts[8]!.labels.es), false);
  assert.equal(markup.includes(hinted.id), false);
  assert.equal(markup.includes(hidden.id), false);
  assert.equal(markup.includes('data-prototype-state="hidden"'), false);
});

test("connections stop at hidden nodes and fade towards hinted discoveries", async () => {
  const start = await renderTree("en", "start");
  assert.ok(start.includes('data-prototype-connection-layer="game"'));
  assert.equal((start.match(/data-prototype-connection="scientific"/g) ?? []).length, 0);
  assert.ok((start.match(/data-prototype-connection="game"/g) ?? []).length >= 2);
  assert.ok(start.includes('data-prototype-node-variant="compact"'));
  assert.equal(start.includes("PLACEHOLDER VISUAL"), false);
  assert.equal(start.includes("VISUAL PLACEHOLDER"), false);
  const middle = await renderTree("en", "middle");
  assert.ok(middle.includes('data-prototype-connection-id="proto-j-6-26"'));
  assert.ok(middle.includes('data-prototype-fades="true"'));
  const door = KNOWLEDGE_PROTOTYPE_NODES[25]!.id;
  const atDoor = await renderTree("en", "middle", door);
  assert.ok(atDoor.includes('data-prototype-fades="true"'));
  const space = KNOWLEDGE_PROTOTYPE_NODES[1]!.id;
  const atSpace = await renderTree("en", "middle", space);
  assert.ok(atSpace.includes('data-prototype-shared-pair="true"'));
  const advanced = await renderTree("en", "advanced");
  const advancedNodes = prototypeNodesForScenario("advanced");
  const advancedVisible = new Set(advancedNodes.filter((node) => node.state !== "hidden").map((node) => node.id));
  const advancedRelations = KNOWLEDGE_PROTOTYPE_CATALOG.relations.filter(
    (item) => advancedVisible.has(item.subject) && advancedVisible.has(item.object),
  ).length;
  const advancedDependencies = KNOWLEDGE_PROTOTYPE_DEPENDENCIES.filter(
    (item) => advancedVisible.has(item.from) && advancedVisible.has(item.to),
  ).length;
  const mobileAt = advanced.indexOf('data-prototype-canvas="mobile"');
  const desktopMarkup = advanced.slice(0, mobileAt);
  const mobileMarkup = advanced.slice(mobileAt);
  assert.equal((desktopMarkup.match(/data-prototype-connection="scientific"/g) ?? []).length, 0);
  assert.ok((desktopMarkup.match(/data-prototype-connection="game"/g) ?? []).length > 0);
  assert.ok((desktopMarkup.match(/data-prototype-connection="game"/g) ?? []).length < advancedDependencies);
  assert.ok((mobileMarkup.match(/data-prototype-connection="game"/g) ?? []).length < advancedDependencies);
  assert.ok(mobileMarkup.includes('data-prototype-cluster-tabs="true"'));
  const focused = await renderTree("en", "advanced", KNOWLEDGE_PROTOTYPE_NODES[0]!.id);
  assert.ok(advancedRelations > 0);
  assert.equal((focused.match(/data-prototype-connection="scientific"/g) ?? []).length, 0);
  assert.ok(focused.includes('data-prototype-connection-emphasis="focus"'));
  assert.ok(focused.includes('data-prototype-camera-viewport="true"'));
  assert.ok(focused.includes('data-prototype-camera-home="true"'));
  assert.equal(start.includes("marker-end"), false);
  assert.equal(start.includes("prototype-game-arrow"), false);
  assert.ok(start.includes('data-prototype-connection-form="thread"'));
  assert.equal(start.includes("Open card"), false);
  for (const id of ["proto-j-1-2", "proto-j-1-3", "proto-j-2-5", "proto-j-3-5", "proto-j-2-10", "proto-j-3-10", "proto-j-6-26", "proto-j-19-26"]) {
    assert.ok(desktopMarkup.includes(`data-prototype-connection-id="${id}"`), id);
    assert.ok(desktopMarkup.includes(`data-prototype-connection-id="${id}" data-prototype-connection-role="trunk"`), id);
  }
  assert.ok(desktopMarkup.includes('data-prototype-connection-id="proto-j-23-26" data-prototype-connection-role="trunk"'));
  assert.ok(desktopMarkup.includes('data-prototype-connection-id="proto-j-2-23" data-prototype-connection-role="trunk"'));
  assert.equal(desktopMarkup.includes('data-prototype-connection-id="proto-j-5-10"'), false);
  const atSpacetime = await renderTree("en", "advanced", KNOWLEDGE_PROTOTYPE_NODES[4]!.id);
  const spacetimeDesktop = atSpacetime.slice(0, atSpacetime.indexOf('data-prototype-canvas="mobile"'));
  assert.ok(spacetimeDesktop.includes('data-prototype-connection-id="proto-j-2-5" data-prototype-connection-role="trunk" data-prototype-connection-form="thread" data-prototype-connection-emphasis="focus"'));
  assert.ok(spacetimeDesktop.includes('data-prototype-connection-id="proto-j-1-2" data-prototype-connection-role="trunk" data-prototype-connection-form="thread" data-prototype-connection-emphasis="dim"'));
  assert.equal((spacetimeDesktop.match(/data-prototype-connection="scientific"/g) ?? []).length, 0);
});

test("the complete map draws every stratum concept and the door lists its three parents", async () => {
  const markup = await renderTree("es", "complete");
  const desktop = markup.slice(0, markup.indexOf('data-prototype-canvas="mobile"'));
  for (let sequence = 1; sequence <= 28; sequence += 1) {
    const code = `F00.${String(sequence).padStart(2, "0")}`;
    assert.ok(desktop.includes(`data-prototype-code="${code}"`), code);
  }
  assert.equal((desktop.match(/data-prototype-code=/g) ?? []).length, 28);
  assert.equal((desktop.match(/data-prototype-connection="scientific"/g) ?? []).length, 0);
  assert.equal(desktop.includes("marker-end"), false);
  assert.ok(desktop.includes('data-prototype-detail="mid"'));
});

test("the door sheet lists every playable parent on the full map", () => {
  const markup = renderToStaticMarkup(createElement(PrototypePlayableRequirements, { sequence: 26, language: "es" }));
  assert.ok(markup.includes("Requisitos de juego"));
  assert.ok(markup.includes('data-prototype-requirement="F00.06" data-prototype-requirement-on-map="true"'));
  assert.ok(markup.includes('data-prototype-requirement="F00.19" data-prototype-requirement-on-map="true"'));
  assert.ok(markup.includes('data-prototype-requirement="F00.23" data-prototype-requirement-on-map="true"'));
  assert.ok(markup.includes("Campo físico"));
  assert.equal(markup.includes("No está en esta variante del mapa"), false);
  assert.equal(markup.includes("Las uniones dibujadas no bastan"), false);
  const spacetime = renderToStaticMarkup(createElement(PrototypePlayableRequirements, { sequence: 5, language: "en" }));
  assert.ok(spacetime.includes('data-prototype-requirement="F00.02" data-prototype-requirement-on-map="true"'));
  assert.ok(spacetime.includes('data-prototype-requirement="F00.03" data-prototype-requirement-on-map="true"'));
  assert.equal(spacetime.includes("The drawn joins are not enough"), false);
});

test("stratum zones follow the synthetic pedagogical regions", async () => {
  const markup = await renderTree("es", "middle");
  for (const stratum of PROTOTYPE_STRATUM_ORDER) {
    assert.ok(markup.includes(`data-prototype-stratum="${stratum}"`), stratum);
  }
  const zones = buildStratumZones(
    { width: 1000, top: 124, rowGap: 238, sideMargin: 130, cardHalfHeight: 96 },
    420,
    1200,
  );
  assert.equal(zones.length, 4);
  assert.equal(zones[0]!.id, "cluster_start");
  assert.equal(zones.at(-1)!.id, "cluster_quantum");
  assert.ok(zones[0]!.y1 > zones[0]!.y0);
  assert.ok(zones[1]!.y0 < zones[1]!.y1);
  assert.equal(referenceLayoutNodes().length, 28);
});

test("paired scientific and game edges keep separate lanes on the same nodes", () => {
  const from = { x: 420, y: 120 };
  const to = { x: 560, y: 420 };
  const space = KNOWLEDGE_PROTOTYPE_NODES[1]!.id;
  const spacetime = KNOWLEDGE_PROTOTYPE_NODES[4]!.id;
  const positions = new Map([
    [space, from],
    [spacetime, to],
  ]);
  const sharedRelation = KNOWLEDGE_PROTOTYPE_CATALOG.relations.filter(
    (item) => item.subject === space && item.object === spacetime,
  );
  const sharedDependency = KNOWLEDGE_PROTOTYPE_DEPENDENCIES.filter(
    (item) => item.from === space && item.to === spacetime,
  );
  const connections = buildRenderedConnections(sharedRelation, sharedDependency, positions);
  assert.equal(connections.length, 2);
  const science = connections.find((item) => item.kind === "scientific");
  const game = connections.find((item) => item.kind === "game");
  assert.ok(science?.sharesPair);
  assert.ok(game?.sharesPair);
  assert.ok((science?.laneOffset ?? 0) < 0);
  assert.ok((game?.laneOffset ?? 0) > 0);
  const sciencePath = verticalFlowPath(
    positions.get(science!.from)!,
    positions.get(science!.to)!,
    96,
    science!.laneOffset,
    science!.id,
  );
  const gamePath = verticalFlowPath(
    positions.get(game!.from)!,
    positions.get(game!.to)!,
    96,
    game!.laneOffset,
    game!.id,
  );
  assert.notEqual(sciencePath, gamePath);
  assert.ok(sciencePath.startsWith("M ") && sciencePath.includes("C "));
});

test("spine serpentine keeps downward progression without rigid center column", () => {
  const nodes = referenceLayoutNodes();
  const desktop = buildPrototypeLayout(nodes, KNOWLEDGE_PROTOTYPE_DEPENDENCIES, {
    width: 1000,
    top: 92,
    rowGap: 200,
    sideMargin: 130,
    cardHalfHeight: 96,
  });
  const mobile = buildPrototypeLayout(nodes, KNOWLEDGE_PROTOTYPE_DEPENDENCIES, MOBILE_METRICS);
  const byId = new Map(desktop.nodes.map((item) => [item.node.id, item]));
  const earlyX = [0, 1, 2, 3].map((index) => byId.get(KNOWLEDGE_PROTOTYPE_NODES[index]!.id)!.x);
  assert.ok(new Set(earlyX.map((x) => Math.round(x / 10))).size >= 3);
  for (const variant of [desktop, mobile]) {
    for (let index = 1; index < KNOWLEDGE_PROTOTYPE_SPINE_IDS.length; index += 1) {
      const prev = variant.nodes.find((item) => item.node.id === KNOWLEDGE_PROTOTYPE_SPINE_IDS[index - 1]!);
      const next = variant.nodes.find((item) => item.node.id === KNOWLEDGE_PROTOTYPE_SPINE_IDS[index]!);
      assert.ok(prev && next);
      assert.ok(prev!.y < next!.y);
    }
  }
});

test("deterministic layout progresses downward and represents branch convergence", () => {
  const nodes = prototypeNodesForScenario("advanced");
  const layout = buildPrototypeLayout(nodes, KNOWLEDGE_PROTOTYPE_DEPENDENCIES, {
    width: 1000,
    top: 120,
    rowGap: 240,
    sideMargin: 130,
    cardHalfHeight: 96,
  });
  const byId = new Map(layout.nodes.map((item) => [item.node.id, item]));
  assert.ok(byId.get(KNOWLEDGE_PROTOTYPE_NODES[0]!.id)!.y < byId.get(KNOWLEDGE_PROTOTYPE_NODES[6]!.id)!.y);
  assert.ok(byId.get(KNOWLEDGE_PROTOTYPE_NODES[6]!.id)!.y < byId.get(KNOWLEDGE_PROTOTYPE_NODES[13]!.id)!.y);
  const universe = byId.get(KNOWLEDGE_PROTOTYPE_NODES[0]!.id)!;
  const time = byId.get(KNOWLEDGE_PROTOTYPE_NODES[2]!.id)!;
  assert.notEqual(Math.round(universe.x), Math.round(time.x));
  assert.ok(time.y > universe.y);
});

test("identified concepts still open the existing scientific detail sheet", async () => {
  const selected = KNOWLEDGE_PROTOTYPE_NODES[0]!;
  const markup = await renderPage("en", `?concept=${encodeURIComponent(selected.id)}`);
  assert.ok(markup.includes('role="dialog"'));
  assert.ok(markup.includes(`data-knowledge-concept="${selected.id}"`));
  assert.ok(markup.includes("not an authorized editorial publication"));
  assert.ok(markup.includes('data-knowledge-dev-fixture="true"'));
  assert.ok(markup.includes("F00.01"));
  assert.equal(markup.includes("dev_fixture"), false);
  assert.equal(markup.includes("DEV-S00"), false);
  assert.equal(markup.includes("quality_or_state"), false);
  assert.equal(KNOWLEDGE_PROTOTYPE_CATALOG.concepts.every((concept) => concept.editorialStatus === "candidate"), true);
  assert.equal(markup.includes('data-knowledge-map="contextual"'), false);
  assert.ok(markup.includes('data-prototype-sheet-tabs="true"'));
  assert.ok(markup.includes("Detalles") || markup.includes("Details"));
});

test("scenario projection never turns game state into a library access policy", () => {
  assert.equal(KNOWLEDGE_PROTOTYPE_CATALOG.concepts.length, 28);
  assert.equal(prototypeCatalogForScenario("start").concepts.length, 3);
  assert.equal(prototypeCatalogForScenario("middle").concepts.length, 12);
  assert.equal(prototypeCatalogForScenario("advanced").concepts.length, 20);
  assert.equal(KNOWLEDGE_PROTOTYPE_CATALOG.prerequisitePolicy.blocksAccess, false);
  assert.equal(KNOWLEDGE_PROTOTYPE_CATALOG.prerequisitePolicy.grantsXp, false);
});

test("prototype fixtures remain development-only and public runtime stays empty", () => {
  const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
  const fixture = readFileSync(new URL("./knowledge-prototype-fixture.ts", import.meta.url), "utf8");
  const publicCatalog = readFileSync(new URL("./public-knowledge-catalog.ts", import.meta.url), "utf8");
  assert.match(app, /import\.meta\.env\.DEV/);
  assert.match(app, /dev\/knowledge-prototype/);
  assert.match(app, /lazy\(\(\) =>/);
  assert.equal(fixture.includes("docs/design/gam-03b"), false);
  assert.equal(publicCatalog.includes("knowledge-prototype"), false);
  assert.equal(PUBLIC_KNOWLEDGE_CATALOG.concepts.length, 0);
  assert.equal(PUBLIC_KNOWLEDGE_CATALOG.relations.length, 0);
  assert.equal(PUBLIC_KNOWLEDGE_CATALOG.prerequisites.length, 0);
});

test("prototype source keeps persistence inside the dev save and away from XP", () => {
  const sources = [
    "./KnowledgePrototypeTree.tsx",
    "./knowledge-prototype-connections.ts",
    "./knowledge-prototype-strata.ts",
    "./knowledge-prototype-game-engine.ts",
    "./knowledge-prototype-fixture.ts",
    "../pages/KnowledgePrototypePage.tsx",
  ].map((name) => readFileSync(new URL(name, import.meta.url), "utf8")).join("\n");
  const hook = readFileSync(new URL("./useKnowledgePrototypeGame.ts", import.meta.url), "utf8");
  for (const forbidden of [
    "apiRequest",
    "fetch(",
    "localStorage",
    "sessionStorage",
    "setInterval",
    "setTimeout",
    "XpGrant",
    "MissionCompletion",
    "awardXp",
  ]) {
    assert.equal(sources.includes(forbidden), false, forbidden);
  }
  assert.equal(hook.includes("localStorage"), false);
  assert.ok(hook.includes("setInterval"), "dev tick stays in the hook");
  const save = readFileSync(new URL("./knowledge-prototype-save.ts", import.meta.url), "utf8");
  assert.match(save, /PROTOTYPE_SAVE_KEY/);
  assert.equal(save.includes("awardXp"), false);
});
