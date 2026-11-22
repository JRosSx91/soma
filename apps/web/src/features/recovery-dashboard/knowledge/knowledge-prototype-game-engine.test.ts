import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
  KNOWLEDGE_PROTOTYPE_NODES,
  validatePrototypeChapterGraph,
} from "./knowledge-prototype-fixture.js";
import {
  PROTOTYPE_BALANCE_ID,
  PROTOTYPE_CHAPTER_DISCOVERY_SPARK_TOTAL,
  PROTOTYPE_DISCOVERY_COST_SPARKS,
  PROTOTYPE_SAVE_KEY,
  PROTOTYPE_TAP_EVENTS_PER_SECOND,
  prototypeConceptId,
} from "./knowledge-prototype-game-config.js";
import {
  canPurchaseDiscovery,
  createInitialPrototypeGameState,
  currentTapYieldSparks,
  derivePrototypeGameView,
  discoveryCost,
  formatSparkMilli,
  nextDiscovery,
  productionMilliPerSecond,
  projectPrototypeNodes,
  prototypeStateFromDocument,
  prototypeStateToDocument,
  reducePrototypeGame,
  resolveVisibility,
  type PrototypeGameState,
} from "./knowledge-prototype-game-engine.js";
import { clearPrototypeEconomy, loadPrototypeEconomy, savePrototypeEconomy } from "./knowledge-prototype-save.js";
import { isBackgroundTapKey, keyboardTapTargetsBackground, pointerDragCancelsTap } from "./knowledge-prototype-tap.js";

const ion = prototypeConceptId(2);
const membrane = prototypeConceptId(4);
const neuron = prototypeConceptId(7);
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

function withSparks(state: PrototypeGameState, sparks: bigint) {
  return { ...state, sparksMilli: sparks };
}

test("the bench starts discovered on charge, with its generator and an empty balance", () => {
  const state = createInitialPrototypeGameState(1_000);
  const nodes = projectPrototypeNodes(state);
  assert.equal(nodes.filter((node) => node.state === "discovered").length, 1);
  assert.equal(resolveVisibility(ion, new Set(state.discoveredIds)), "available");
  assert.equal(resolveVisibility(membrane, new Set([prototypeConceptId(1)])), "hidden");
  assert.equal(state.sparksMilli, 0n);
  assert.equal(productionMilliPerSecond(state), 8n);
  assert.equal(currentTapYieldSparks(state), 1);
  assert.equal(nextDiscovery(state).conceptId, ion);
  assert.equal(nextDiscovery(state).costSparks, 12);
});

test("repeated taps pay the current yield and the 12 per second cap keeps uneven human taps", () => {
  const silent = {
    ...createInitialPrototypeGameState(5_000),
    discoveredIds: [],
  };
  const first = reducePrototypeGame(silent, { type: "tap", now: 5_000, count: 1 });
  assert.equal(first.creditedTaps, 1);
  assert.equal(first.state.sparksMilli, 1_000n);
  const burst = reducePrototypeGame(first.state, { type: "tap", now: 5_000, count: 11 });
  assert.equal(burst.creditedTaps, 11);
  assert.equal(burst.state.sparksMilli, 12_000n);
  const capped = reducePrototypeGame(burst.state, { type: "tap", now: 5_400, count: 1 });
  assert.equal(capped.error, "rate_limited");
  assert.equal(capped.creditedTaps, 0);
  assert.equal(capped.state.sparksMilli, 12_000n);
  const nextSecond = reducePrototypeGame(capped.state, { type: "tap", now: 6_000, count: 1 });
  assert.equal(nextSecond.creditedTaps, 1);
  assert.equal(nextSecond.state.sparksMilli, 13_000n);

  let human = { ...createInitialPrototypeGameState(0), discoveredIds: [] };
  for (let index = 0; index < 6; index += 1) {
    const tapped = reducePrototypeGame(human, { type: "tap", now: index * 166, count: 1 });
    assert.equal(tapped.error, undefined, `human tap ${index}`);
    human = tapped.state;
  }
  assert.equal(human.sparksMilli, 6_000n);
  assert.equal(PROTOTYPE_TAP_EVENTS_PER_SECOND, 12);
});

test("navigation gestures and controls are not rewarded taps", () => {
  assert.equal(pointerDragCancelsTap(3, 4), false);
  assert.equal(pointerDragCancelsTap(8, 0), false);
  assert.equal(pointerDragCancelsTap(9, 0), true);
  assert.equal(isBackgroundTapKey(" "), true);
  assert.equal(isBackgroundTapKey("Enter"), true);
  assert.equal(isBackgroundTapKey("ArrowDown"), false);
  const surface = {};
  const control = {};
  assert.equal(keyboardTapTargetsBackground(surface, surface), true);
  assert.equal(keyboardTapTargetsBackground(control, surface), false);
  const tree = readFileSync(new URL("./KnowledgePrototypeTree.tsx", import.meta.url), "utf8");
  assert.match(tree, /pointer-events-auto/);
  assert.match(tree, /data-prototype-map-ignore/);
  assert.match(tree, /pointerDragCancelsTap/);
  assert.doesNotMatch(tree, /setPointerCapture/);
  assert.doesNotMatch(tree, /Analizar|manual_analyze/);
});

test("discoveries spend the provisional price once and respect playable dependencies", () => {
  const state = withSparks(createInitialPrototypeGameState(0), 500_000n);
  const locked = reducePrototypeGame(state, { type: "discover", conceptId: membrane, now: 10 });
  assert.equal(locked.error, "discovery_locked");
  assert.equal(locked.state.sparksMilli, 500_000n);
  const bought = reducePrototypeGame(state, { type: "discover", conceptId: ion, now: 10 });
  assert.equal(bought.error, undefined);
  assert.equal(bought.state.sparksMilli, 488_000n);
  const twice = reducePrototypeGame(bought.state, { type: "discover", conceptId: ion, now: 11 });
  assert.equal(twice.error, "already_discovered");
  assert.equal(twice.state.sparksMilli, bought.state.sparksMilli);
  const poor = reducePrototypeGame(createInitialPrototypeGameState(0), { type: "discover", conceptId: ion, now: 12 });
  assert.equal(poor.error, "insufficient_sparks");
  assert.equal(poor.state.sparksMilli, 0n);
  assert.equal(canPurchaseDiscovery(withSparks(state, 12_000n), ion), true);
  assert.equal(canPurchaseDiscovery(state, neuron), false);
  assert.equal(discoveryCost(ion), 12);
});

test("manual power and generator levels settle the previous rate before they change", () => {
  let state = createInitialPrototypeGameState(0);
  state = reducePrototypeGame(state, { type: "tick", now: HOUR_MS }).state;
  assert.equal(state.sparksMilli, 28_800n);
  state = withSparks(state, 80_000n);
  const manual = reducePrototypeGame(state, { type: "buy_manual", now: HOUR_MS });
  assert.equal(manual.error, undefined);
  assert.equal(currentTapYieldSparks(manual.state), 2);
  assert.equal(manual.state.sparksMilli, 40_000n);
  const hourAfterManual = reducePrototypeGame(manual.state, { type: "tick", now: HOUR_MS * 2 });
  assert.equal(hourAfterManual.state.sparksMilli, 40_000n + 28_800n);

  const upgraded = reducePrototypeGame(withSparks(hourAfterManual.state, 100_000n), {
    type: "buy_generator",
    generatorId: "bench-charge",
    now: HOUR_MS * 2,
  });
  assert.equal(upgraded.error, undefined);
  assert.equal(upgraded.state.generatorLevels["bench-charge"], 2);
  assert.equal(upgraded.state.sparksMilli, 60_000n);
  const hourAtNextRate = reducePrototypeGame(upgraded.state, { type: "tick", now: HOUR_MS * 3 });
  assert.equal(hourAtNextRate.state.sparksMilli, 60_000n + 14n * 3_600n);
  const lockedGenerator = reducePrototypeGame(state, { type: "buy_generator", generatorId: "bench-channel", now: HOUR_MS });
  assert.equal(lockedGenerator.error, "upgrade_locked");
  const repeat = reducePrototypeGame(
    { ...upgraded.state, sparksMilli: 1_000_000n, generatorLevels: { ...upgraded.state.generatorLevels, "bench-charge": 5 } },
    { type: "buy_generator", generatorId: "bench-charge", now: HOUR_MS * 2 },
  );
  assert.equal(repeat.error, "upgrade_maxed");
});

test("the neuron stand-in opens the next tap range and does not change offline production", () => {
  let state = withSparks(createInitialPrototypeGameState(0), 200_000n);
  state = reducePrototypeGame(state, { type: "buy_manual", now: 1 }).state;
  state = reducePrototypeGame(state, { type: "buy_manual", now: 2 }).state;
  assert.equal(currentTapYieldSparks(state), 3);
  const locked = reducePrototypeGame(state, { type: "buy_manual", now: 3 });
  assert.equal(locked.error, "upgrade_locked");
  state = {
    ...locked.state,
    sparksMilli: 1_000_000n,
    discoveredIds: [...locked.state.discoveredIds, neuron],
    generatorLevels: { ...locked.state.generatorLevels, "bench-neuron": 1 },
  };
  const rateBefore = productionMilliPerSecond(state);
  const opened = reducePrototypeGame(state, { type: "buy_manual", now: 4 });
  assert.equal(opened.error, undefined);
  assert.equal(currentTapYieldSparks(opened.state), 5);
  assert.equal(productionMilliPerSecond(opened.state), rateBefore);
  const before = opened.state.sparksMilli;
  const produced = reducePrototypeGame(opened.state, { type: "tick", now: 4 + HOUR_MS });
  assert.equal(produced.state.sparksMilli - before, rateBefore * 3_600n);
});

test("offline production is exact for an hour, a day and thirty days, and a repeated settlement adds nothing", () => {
  const start = createInitialPrototypeGameState(0);
  const hour = reducePrototypeGame(start, { type: "tick", now: HOUR_MS }).state;
  assert.equal(hour.sparksMilli, 28_800n);
  assert.equal(formatSparkMilli(hour.sparksMilli), "28.8");
  const day = reducePrototypeGame(start, { type: "tick", now: DAY_MS }).state;
  assert.equal(day.sparksMilli, 691_200n);
  assert.equal(formatSparkMilli(day.sparksMilli), "691.2");
  const month = reducePrototypeGame(start, { type: "tick", now: 30 * DAY_MS }).state;
  assert.equal(month.sparksMilli, 20_736_000n);
  const repeat = reducePrototypeGame(month, { type: "tick", now: 30 * DAY_MS }).state;
  assert.equal(repeat.sparksMilli, month.sparksMilli);
  assert.equal(repeat.lastSettledAt, month.lastSettledAt);
});

test("a backward clock credits nothing and does not move the settlement mark", () => {
  const settled = reducePrototypeGame(createInitialPrototypeGameState(0), { type: "tick", now: DAY_MS }).state;
  const rewound = reducePrototypeGame(settled, { type: "tick", now: HOUR_MS });
  assert.equal(rewound.state.sparksMilli, settled.sparksMilli);
  assert.equal(rewound.state.lastSettledAt, settled.lastSettledAt);
  const tapped = reducePrototypeGame(settled, { type: "tap", now: HOUR_MS, count: 4 });
  assert.equal(tapped.error, "clock_regressed");
  assert.equal(tapped.state.sparksMilli, settled.sparksMilli);
  assert.equal(tapped.state.lastSettledAt, settled.lastSettledAt);
});

test("the milli-spark ledger stays exact past the safe integer boundary", () => {
  const elapsed = Number.MAX_SAFE_INTEGER;
  const product = 8n * BigInt(elapsed);
  assert.ok(product > BigInt(Number.MAX_SAFE_INTEGER));
  const settled = reducePrototypeGame(createInitialPrototypeGameState(0), { type: "tick", now: elapsed }).state;
  assert.equal(settled.sparksMilli, product / 1000n);
  assert.equal(formatSparkMilli(settled.sparksMilli), expectedToDisplay(product / 1000n));
});

test("a saved bench reloads the same levels and then credits only the new absence", () => {
  const storage = new MemoryStorage();
  const previous = globalThis.localStorage;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  try {
    clearPrototypeEconomy();
    const started = createInitialPrototypeGameState(1_000);
    const played = reducePrototypeGame(withSparks(started, 50_000n), { type: "buy_manual", now: 1_000 }).state;
    savePrototypeEconomy(played);
    const loaded = loadPrototypeEconomy();
    assert.ok(loaded);
    assert.equal(loaded.sparksMilli, played.sparksMilli);
    assert.equal(loaded.manualStep, 1);
    assert.equal(loaded.generatorLevels["bench-charge"], 1);
    assert.deepEqual(loaded.discoveredIds, played.discoveredIds);
    const resumed = reducePrototypeGame(loaded, { type: "tick", now: 1_000 + HOUR_MS }).state;
    assert.equal(resumed.sparksMilli, played.sparksMilli + 28_800n);
    const document = prototypeStateToDocument(played);
    assert.equal(prototypeStateFromDocument({ ...document, version: 0 }), null);
    assert.equal(prototypeStateFromDocument({ ...document, balanceId: "other" }), null);
    assert.equal(prototypeStateFromDocument("{"), null);
    storage.setItem(PROTOTYPE_SAVE_KEY, "{");
    assert.equal(loadPrototypeEconomy(), null);
    clearPrototypeEconomy();
    assert.equal(storage.getItem(PROTOTYPE_SAVE_KEY), null);
    assert.equal(PROTOTYPE_BALANCE_ID, "b2-econ-01d-provisional-19");
  } finally {
    if (previous === undefined) {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    } else {
      Object.defineProperty(globalThis, "localStorage", { configurable: true, value: previous });
    }
  }
});

test("the nineteen-node graph stays acyclic and every node can be bought when the balance allows it", () => {
  const validation = validatePrototypeChapterGraph();
  assert.equal(validation.ordering.length, 19);
  assert.equal(validation.edgeCount, KNOWLEDGE_PROTOTYPE_DEPENDENCIES.length);
  assert.equal(PROTOTYPE_DISCOVERY_COST_SPARKS.length, 19);
  assert.equal(PROTOTYPE_CHAPTER_DISCOVERY_SPARK_TOTAL, 29_812);
  let state = withSparks(createInitialPrototypeGameState(0), 100_000_000n);
  let guard = 0;
  while (state.discoveredIds.length < 19 && guard < 40) {
    const discovered = new Set(state.discoveredIds);
    const next = KNOWLEDGE_PROTOTYPE_NODES.find((node) => resolveVisibility(node.id, discovered) === "available");
    assert.ok(next, "the bench deadlocked before 19 discoveries");
    const result = reducePrototypeGame(state, { type: "discover", conceptId: next.id, now: guard + 1 });
    assert.equal(result.error, undefined);
    state = result.state;
    guard += 1;
  }
  assert.equal(state.discoveredIds.length, 19);
  assert.equal(derivePrototypeGameView(state).nextDiscovery.status, "complete");
});

test("the prototype economy does not touch XP, recovery, missions or the network", () => {
  const sources = [
    "./knowledge-prototype-game-engine.ts",
    "./knowledge-prototype-game-config.ts",
    "./knowledge-prototype-save.ts",
    "./useKnowledgePrototypeGame.ts",
    "../pages/KnowledgePrototypePage.tsx",
  ].map((name) => readFileSync(new URL(name, import.meta.url), "utf8")).join("\n");
  for (const forbidden of ["apiRequest", "fetch(", "awardXp", "abstinen", "MissionCompletion", "medal", "/me/"]) {
    assert.equal(sources.includes(forbidden), false, forbidden);
  }
  const save = readFileSync(new URL("./knowledge-prototype-save.ts", import.meta.url), "utf8");
  assert.match(save, /PROTOTYPE_SAVE_KEY/);
  assert.equal(PROTOTYPE_SAVE_KEY, "soma.dev.knowledge-prototype.economy.v1");
  const engine = readFileSync(new URL("./knowledge-prototype-game-engine.ts", import.meta.url), "utf8");
  assert.equal(engine.includes("localStorage"), false);
});

function expectedToDisplay(milli: bigint) {
  const whole = milli / 1000n;
  const fraction = (milli % 1000n).toString().padStart(3, "0").replace(/0+$/, "");
  return fraction.length > 0 ? `${whole.toString()}.${fraction}` : whole.toString();
}

class MemoryStorage implements Storage {
  private readonly items = new Map<string, string>();
  get length() {
    return this.items.size;
  }
  clear() {
    this.items.clear();
  }
  getItem(key: string) {
    return this.items.get(key) ?? null;
  }
  key(index: number) {
    return [...this.items.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.items.delete(key);
  }
  setItem(key: string, value: string) {
    this.items.set(key, value);
  }
}
