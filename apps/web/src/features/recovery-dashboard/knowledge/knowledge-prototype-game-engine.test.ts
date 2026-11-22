import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
  KNOWLEDGE_PROTOTYPE_NODES,
  KNOWLEDGE_PROTOTYPE_SPINE_IDS,
  validatePrototypeChapterGraph,
} from "./knowledge-prototype-fixture.js";
import {
  canPurchaseDiscovery,
  canPurchaseUpgrade,
  createInitialPrototypeGameState,
  discoveryCost,
  formatPrototypeProductionPerSecond,
  formatPrototypeSparksDisplay,
  productionMilliPerMinute,
  productionPerMinute,
  projectPrototypeNodes,
  reducePrototypeGame,
  derivePrototypeGameView,
  resolveVisibility,
  sparksWhole,
} from "./knowledge-prototype-game-engine.js";
import { PROTOTYPE_CHAPTER_DISCOVERY_SPARK_TOTAL } from "./knowledge-prototype-game-config.js";

const first = KNOWLEDGE_PROTOTYPE_NODES[0]!.id;
const ion = KNOWLEDGE_PROTOTYPE_NODES[1]!.id;
const gradient = KNOWLEDGE_PROTOTYPE_NODES[2]!.id;
const membrane = KNOWLEDGE_PROTOTYPE_NODES[3]!.id;
const neuron = KNOWLEDGE_PROTOTYPE_NODES[6]!.id;

test("initial demo begins with a single discovered concept and no persistence hooks", () => {
  const sources = [
    "./knowledge-prototype-game-engine.ts",
    "./useKnowledgePrototypeGame.ts",
    "../pages/KnowledgePrototypePage.tsx",
  ].map((name) => readFileSync(new URL(name, import.meta.url), "utf8")).join("\n");
  for (const forbidden of ["localStorage", "sessionStorage", "indexedDB", "fetch(", "apiRequest"]) {
    assert.equal(sources.includes(forbidden), false, forbidden);
  }
  const state = createInitialPrototypeGameState(1_000);
  const nodes = projectPrototypeNodes(state);
  assert.equal(nodes.filter((node) => node.state === "discovered").length, 1);
  assert.equal(nodes[0]!.state, "discovered");
  assert.equal(resolveVisibility(ion, new Set([first])), "available");
  assert.equal(resolveVisibility(gradient, new Set([first])), "hidden");
  assert.equal(resolveVisibility(gradient, new Set([first, ion])), "available");
  assert.equal(resolveVisibility(membrane, new Set([first])), "hidden");
  const solution = KNOWLEDGE_PROTOTYPE_NODES[7]!.id;
  assert.equal(resolveVisibility(solution, new Set([first, ion, gradient])), "hidden");
  assert.equal(resolveVisibility(solution, new Set([first, ion, gradient, membrane])), "available");
});

test("manual analyze respects two actions per second and spends no discovery currency", () => {
  let state = createInitialPrototypeGameState(0);
  const t0 = 10_000;
  state = reducePrototypeGame(state, { type: "manual_analyze", now: t0 }).state;
  assert.equal(sparksWhole(state), 23);
  state = reducePrototypeGame(state, { type: "manual_analyze", now: t0 + 400 }).state;
  assert.equal(sparksWhole(state), 24);
  const limited = reducePrototypeGame(state, { type: "manual_analyze", now: t0 + 700 });
  assert.equal(limited.error, "rate_limited");
  assert.equal(sparksWhole(limited.state), 24);
  state = reducePrototypeGame(state, { type: "manual_analyze", now: t0 + 1_100 }).state;
  assert.equal(sparksWhole(state), 25);
});

test("upgrades deduct exact spark costs and auto production depends on elapsed time", () => {
  let state = createInitialPrototypeGameState(0);
  state = { ...state, sparksMilli: 200_000 };
  const bought = reducePrototypeGame(state, { type: "buy_upgrade", upgradeId: "auto-burette", now: 0 });
  assert.equal(bought.error, undefined);
  assert.equal(bought.state.upgradeLevels["auto-burette"], 1);
  assert.equal(bought.state.sparksMilli, 162_000);
  assert.ok(productionMilliPerMinute(bought.state) >= 6_000);
  const beforeTick = bought.state.sparksMilli;
  const ticked = reducePrototypeGame(bought.state, { type: "tick", now: 60_000 });
  assert.ok(ticked.state.sparksMilli > beforeTick);
  assert.ok(productionPerMinute(ticked.state) >= 6);
  const repeat = reducePrototypeGame(ticked.state, { type: "buy_upgrade", upgradeId: "auto-burette", now: 60_000 });
  assert.equal(repeat.error, "upgrade_maxed");
});

test("discoveries require dependencies, exact costs and cannot be purchased twice", () => {
  let state = createInitialPrototypeGameState(0);
  state = { ...state, sparksMilli: 500_000 };
  const locked = reducePrototypeGame(state, { type: "discover", conceptId: membrane, now: 0 });
  assert.equal(locked.error, "discovery_locked");
  const ionResult = reducePrototypeGame(state, { type: "discover", conceptId: ion, now: 0 });
  assert.equal(ionResult.error, undefined);
  const twice = reducePrototypeGame(ionResult.state, { type: "discover", conceptId: ion, now: 1 });
  assert.equal(twice.error, "already_discovered");
  const gradientResult = reducePrototypeGame(ionResult.state, { type: "discover", conceptId: gradient, now: 2 });
  assert.equal(gradientResult.error, undefined);
  const membraneOk = reducePrototypeGame(gradientResult.state, { type: "discover", conceptId: membrane, now: 3 });
  assert.equal(membraneOk.error, undefined);
  assert.ok(membraneOk.state.discoveredIds.includes(membrane));
});

test("reset restores the initial chapter slice", () => {
  let state = createInitialPrototypeGameState(0);
  state = reducePrototypeGame({ ...state, sparksMilli: 900_000 }, { type: "discover", conceptId: ion, now: 0 }).state;
  const reset = reducePrototypeGame(state, { type: "reset", now: 1 }).state;
  assert.deepEqual(reset.discoveredIds, [first]);
  assert.equal(sparksWhole(reset), 22);
});

test("chapter fixture exposes nineteen acyclic reachable discoveries", () => {
  const validation = validatePrototypeChapterGraph();
  assert.equal(validation.ordering.length, 19);
  assert.equal(validation.edgeCount, KNOWLEDGE_PROTOTYPE_DEPENDENCIES.length);
  assert.equal(PROTOTYPE_CHAPTER_DISCOVERY_SPARK_TOTAL, 724);
});

test("automated playthrough can discover all nineteen concepts without deadlock", () => {
  let state = createInitialPrototypeGameState(0);
  let now = 0;
  const guardLimit = 120_000;
  let ticks = 0;
  let manuals = 0;
  let discoveries = 0;
  let upgradesBought = 0;

  while (ticks < guardLimit) {
    const view = derivePrototypeGameView(state);
    if (view.discoveredCount === KNOWLEDGE_PROTOTYPE_NODES.length) break;

    const affordableUpgrade = view.upgradeLevels["auto-burette"] === 0
      ? "auto-burette"
      : view.upgradeLevels["manual-lens"] < 2
        ? "manual-lens"
        : view.upgradeLevels["auto-calibration"] < 2
          ? "auto-calibration"
          : null;
    if (affordableUpgrade && canPurchaseUpgrade(state, affordableUpgrade)) {
      const bought = reducePrototypeGame(state, { type: "buy_upgrade", upgradeId: affordableUpgrade, now });
      if (!bought.error) {
        state = bought.state;
        upgradesBought += 1;
        continue;
      }
    }

    const discovered = new Set(state.discoveredIds);
  const spineNext = KNOWLEDGE_PROTOTYPE_SPINE_IDS.find(
      (id) => resolveVisibility(id, discovered) === "available" && canPurchaseDiscovery(state, id),
    );
    const nextId =
      spineNext ??
      KNOWLEDGE_PROTOTYPE_NODES.find(
        (node) => resolveVisibility(node.id, discovered) === "available" && canPurchaseDiscovery(state, node.id),
      )?.id;
    const next = nextId ? KNOWLEDGE_PROTOTYPE_NODES.find((node) => node.id === nextId) : undefined;
    if (next && canPurchaseDiscovery(state, next.id)) {
      const discovered = reducePrototypeGame(state, { type: "discover", conceptId: next.id, now });
      if (!discovered.error) {
        state = discovered.state;
        discoveries += 1;
        continue;
      }
    }

    const manual = reducePrototypeGame(state, { type: "manual_analyze", now });
    if (!manual.error) {
      state = manual.state;
      manuals += 1;
      now += 500;
      continue;
    }

    now += 5_000;
    state = reducePrototypeGame(state, { type: "tick", now }).state;
    ticks += 1;
  }

  const finalView = derivePrototypeGameView(state);
  assert.equal(finalView.discoveredCount, KNOWLEDGE_PROTOTYPE_NODES.length);
  assert.ok(discoveries >= 18);
  assert.ok(manuals > 0 || ticks > 0);
  assert.ok(now < guardLimit * 5_000, `playthrough exceeded simulated time (${now}ms)`);
  assert.ok(upgradesBought >= 1);
});

test("visible sparks show accrued fractions while purchases use whole units", () => {
  assert.equal(formatPrototypeSparksDisplay(18_000), "18");
  assert.equal(formatPrototypeSparksDisplay(18_560), "18.6");
  assert.equal(formatPrototypeProductionPerSecond(6_000), "0.10");
  assert.equal(formatPrototypeProductionPerSecond(12_000), "0.20");
  let state = createInitialPrototypeGameState(0);
  state = { ...state, productionCarryMilli: 58_000 };
  const before = state.sparksMilli;
  const ticked = reducePrototypeGame(state, { type: "tick", now: 1_000 });
  assert.ok(ticked.state.productionCarryMilli > 0);
  assert.ok(ticked.state.sparksMilli > before);
});

test("production and affordability helpers stay finite", () => {
  const state = createInitialPrototypeGameState(0);
  assert.ok(Number.isFinite(productionPerMinute(state)));
  assert.ok(Number.isFinite(discoveryCost(ion)));
  assert.equal(canPurchaseDiscovery({ ...state, sparksMilli: 1_000_000 }, ion), true);
  assert.equal(canPurchaseUpgrade({ ...state, sparksMilli: 1_000_000 }, "manual-lens"), true);
  assert.ok(KNOWLEDGE_PROTOTYPE_DEPENDENCIES.length > 0);
  assert.equal(canPurchaseDiscovery(state, neuron), false);
});