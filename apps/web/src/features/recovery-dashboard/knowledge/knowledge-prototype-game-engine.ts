import {
  KNOWLEDGE_PROTOTYPE_CATALOG,
  KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
  KNOWLEDGE_PROTOTYPE_NODES,
  type KnowledgePrototypeScenarioNode,
  type KnowledgePrototypeState,
} from "./knowledge-prototype-fixture.js";
import type { KnowledgeConceptId, PublicKnowledgeCatalog } from "./knowledge-types.js";
import {
  PROTOTYPE_DISCOVERY_COSTS,
  PROTOTYPE_DISCOVERY_PRODUCTION_BONUS_MILLI,
  PROTOTYPE_INITIAL_DISCOVERED,
  PROTOTYPE_MANUAL_ACTIONS_PER_SECOND,
  PROTOTYPE_STARTING_SPARKS_MILLI,
  PROTOTYPE_UPGRADE_DEFINITIONS,
  SPARKS_MILLI_SCALE,
  upgradeCostAtLevel,
  upgradeDefinition,
  type PrototypeUpgradeId,
} from "./knowledge-prototype-game-config.js";

export interface PrototypeGameState {
  sparksMilli: number;
  productionCarryMilli: number;
  lastTickMs: number;
  manualTapMs: number[];
  upgradeLevels: Record<PrototypeUpgradeId, number>;
  discoveredIds: KnowledgeConceptId[];
  lastDiscoveryId: KnowledgeConceptId | null;
  discoveryPulse: number;
}

export type PrototypeGameAction =
  | { type: "tick"; now: number }
  | { type: "manual_analyze"; now: number }
  | { type: "buy_upgrade"; upgradeId: PrototypeUpgradeId; now: number }
  | { type: "discover"; conceptId: KnowledgeConceptId; now: number }
  | { type: "reset"; now: number }
  | { type: "clear_discovery_pulse" };

export type PrototypeGameError =
  | "rate_limited"
  | "insufficient_sparks"
  | "upgrade_maxed"
  | "upgrade_locked"
  | "already_discovered"
  | "discovery_locked"
  | "unknown_upgrade"
  | "unknown_concept";

export interface PrototypeGameResult {
  state: PrototypeGameState;
  error?: PrototypeGameError;
}

/** Spendable balance uses floor(milli/1000); the label may show one decimal from accrued fractions. */
export function formatPrototypeSparksDisplay(sparksMilli: number) {
  if (sparksMilli % SPARKS_MILLI_SCALE === 0) return String(sparksMilli / SPARKS_MILLI_SCALE);
  return (sparksMilli / SPARKS_MILLI_SCALE).toFixed(1);
}

export function formatPrototypeProductionPerSecond(milliPerMinute: number) {
  const milliPerSecond = milliPerMinute / 60;
  const sparksPerSecond = milliPerSecond / SPARKS_MILLI_SCALE;
  if (sparksPerSecond === 0) return "0";
  if (sparksPerSecond < 0.1) return sparksPerSecond.toFixed(3);
  if (sparksPerSecond < 1) return sparksPerSecond.toFixed(2);
  return sparksPerSecond.toFixed(1);
}

export interface PrototypeGameView {
  sparks: number;
  sparksDisplay: string;
  sparksMilli: number;
  productionPerMinute: number;
  productionPerSecondDisplay: string;
  discoveredCount: number;
  totalDiscoveries: number;
  nodes: readonly KnowledgePrototypeScenarioNode[];
  playableCatalog: PublicKnowledgeCatalog;
  upgradeLevels: Record<PrototypeUpgradeId, number>;
  lastDiscoveryId: KnowledgeConceptId | null;
  discoveryPulse: number;
}

export function createInitialPrototypeGameState(now: number): PrototypeGameState {
  return {
    sparksMilli: PROTOTYPE_STARTING_SPARKS_MILLI,
    productionCarryMilli: 0,
    lastTickMs: now,
    manualTapMs: [],
    upgradeLevels: {
      "manual-lens": 0,
      "auto-burette": 0,
      "auto-calibration": 0,
    },
    discoveredIds: [...PROTOTYPE_INITIAL_DISCOVERED],
    lastDiscoveryId: null,
    discoveryPulse: 0,
  };
}

export function reducePrototypeGame(state: PrototypeGameState, action: PrototypeGameAction): PrototypeGameResult {
  switch (action.type) {
    case "tick":
      return { state: applyProduction(state, action.now) };
    case "manual_analyze":
      return manualAnalyze(state, action.now);
    case "buy_upgrade":
      return buyUpgrade(state, action.upgradeId, action.now);
    case "discover":
      return discoverConcept(state, action.conceptId, action.now);
    case "reset":
      return { state: createInitialPrototypeGameState(action.now) };
    case "clear_discovery_pulse":
      return { state: { ...state, discoveryPulse: 0, lastDiscoveryId: null } };
    default:
      return { state };
  }
}

function manualAnalyze(state: PrototypeGameState, now: number): PrototypeGameResult {
  const withProduction = applyProduction(state, now);
  const recent = withProduction.manualTapMs.filter((stamp) => now - stamp < 1000);
  if (recent.length >= PROTOTYPE_MANUAL_ACTIONS_PER_SECOND) {
    return { state: { ...withProduction, manualTapMs: recent }, error: "rate_limited" };
  }
  const gainMilli = manualSparkGainMilli(withProduction) * SPARKS_MILLI_SCALE;
  return {
    state: {
      ...withProduction,
      sparksMilli: withProduction.sparksMilli + gainMilli,
      manualTapMs: [...recent, now],
    },
  };
}

function buyUpgrade(state: PrototypeGameState, upgradeId: PrototypeUpgradeId, now: number): PrototypeGameResult {
  const withProduction = applyProduction(state, now);
  let definition;
  try {
    definition = upgradeDefinition(upgradeId);
  } catch {
    return { state: withProduction, error: "unknown_upgrade" };
  }
  const level = withProduction.upgradeLevels[upgradeId];
  if (level >= definition.maxLevel) {
    return { state: withProduction, error: "upgrade_maxed" };
  }
  if (definition.requires) {
    const requiredLevel = withProduction.upgradeLevels[definition.requires.upgrade] ?? 0;
    if (requiredLevel < definition.requires.minLevel) {
      return { state: withProduction, error: "upgrade_locked" };
    }
  }
  const costMilli = upgradeCostAtLevel(definition, level) * SPARKS_MILLI_SCALE;
  if (withProduction.sparksMilli < costMilli) {
    return { state: withProduction, error: "insufficient_sparks" };
  }
  return {
    state: {
      ...withProduction,
      sparksMilli: withProduction.sparksMilli - costMilli,
      upgradeLevels: { ...withProduction.upgradeLevels, [upgradeId]: level + 1 },
    },
  };
}

function discoverConcept(state: PrototypeGameState, conceptId: KnowledgeConceptId, now: number): PrototypeGameResult {
  const withProduction = applyProduction(state, now);
  if (withProduction.discoveredIds.includes(conceptId)) {
    return { state: withProduction, error: "already_discovered" };
  }
  if (!KNOWLEDGE_PROTOTYPE_NODES.some((node) => node.id === conceptId)) {
    return { state: withProduction, error: "unknown_concept" };
  }
  const visibility = resolveVisibility(conceptId, new Set(withProduction.discoveredIds));
  if (visibility !== "available") {
    return { state: withProduction, error: "discovery_locked" };
  }
  const cost = PROTOTYPE_DISCOVERY_COSTS[conceptId] ?? Number.POSITIVE_INFINITY;
  const costMilli = cost * SPARKS_MILLI_SCALE;
  if (withProduction.sparksMilli < costMilli) {
    return { state: withProduction, error: "insufficient_sparks" };
  }
  return {
    state: {
      ...withProduction,
      sparksMilli: withProduction.sparksMilli - costMilli,
      discoveredIds: [...withProduction.discoveredIds, conceptId],
      lastDiscoveryId: conceptId,
      discoveryPulse: withProduction.discoveryPulse + 1,
    },
  };
}

function applyProduction(state: PrototypeGameState, now: number): PrototypeGameState {
  const elapsed = Math.max(0, now - state.lastTickMs);
  if (elapsed === 0) return state;
  const rateMilliPerMinute = productionMilliPerMinute(state);
  const accrued = rateMilliPerMinute * elapsed + state.productionCarryMilli;
  const gainedMilli = Math.floor(accrued / 60_000);
  const productionCarryMilli = accrued % 60_000;
  return {
    ...state,
    sparksMilli: state.sparksMilli + gainedMilli,
    productionCarryMilli,
    lastTickMs: now,
    manualTapMs: state.manualTapMs.filter((stamp) => now - stamp < 1000),
  };
}

function manualSparkGainMilli(state: PrototypeGameState) {
  const manualLevel = state.upgradeLevels["manual-lens"];
  return 1 + manualLevel;
}

export function productionMilliPerMinute(state: PrototypeGameState) {
  let rate = 0;
  if (state.upgradeLevels["auto-burette"] > 0) {
    const auto = upgradeDefinition("auto-burette");
    rate += auto.unlockAutoMilliPerMinute ?? 0;
    rate += (state.upgradeLevels["auto-calibration"] ?? 0) * (upgradeDefinition("auto-calibration").autoMilliPerMinutePerLevel ?? 0);
  }
  rate += state.discoveredIds.length * PROTOTYPE_DISCOVERY_PRODUCTION_BONUS_MILLI;
  return rate;
}

export function productionPerMinute(state: PrototypeGameState) {
  return Math.round((productionMilliPerMinute(state) / SPARKS_MILLI_SCALE) * 10) / 10;
}

export function sparksWhole(state: PrototypeGameState) {
  return Math.floor(state.sparksMilli / SPARKS_MILLI_SCALE);
}

export function resolveVisibility(
  conceptId: KnowledgeConceptId,
  discovered: ReadonlySet<KnowledgeConceptId>,
): KnowledgePrototypeState {
  if (discovered.has(conceptId)) return "discovered";
  const incoming = KNOWLEDGE_PROTOTYPE_DEPENDENCIES.filter((edge) => edge.to === conceptId);
  if (incoming.length === 0) return discovered.has(conceptId) ? "discovered" : "hidden";
  if (incoming.every((edge) => discovered.has(edge.from))) return "available";
  if (incoming.some((edge) => discovered.has(edge.from))) return "hinted";
  return "hidden";
}

export function projectPrototypeNodes(state: PrototypeGameState): readonly KnowledgePrototypeScenarioNode[] {
  const discovered = new Set(state.discoveredIds);
  return KNOWLEDGE_PROTOTYPE_NODES.map((node) => ({
    ...node,
    state: resolveVisibility(node.id, discovered),
  }));
}

export function prototypeCatalogForGame(state: PrototypeGameState): PublicKnowledgeCatalog {
  const identifiable = new Set(
    projectPrototypeNodes(state)
      .filter((node) => node.state !== "hinted" && node.state !== "hidden")
      .map((node) => node.id),
  );
  return {
    ...KNOWLEDGE_PROTOTYPE_CATALOG,
    concepts: KNOWLEDGE_PROTOTYPE_CATALOG.concepts.filter((concept) => identifiable.has(concept.id)),
    relations: KNOWLEDGE_PROTOTYPE_CATALOG.relations.filter(
      (relation) => identifiable.has(relation.subject) && identifiable.has(relation.object),
    ),
  };
}

export function derivePrototypeGameView(state: PrototypeGameState): PrototypeGameView {
  const sparks = sparksWhole(state);
  const milliRate = productionMilliPerMinute(state);
  return {
    sparks,
    sparksDisplay: formatPrototypeSparksDisplay(state.sparksMilli),
    sparksMilli: state.sparksMilli,
    productionPerMinute: productionPerMinute(state),
    productionPerSecondDisplay: formatPrototypeProductionPerSecond(milliRate),
    discoveredCount: state.discoveredIds.length,
    totalDiscoveries: KNOWLEDGE_PROTOTYPE_NODES.length,
    nodes: projectPrototypeNodes(state),
    playableCatalog: prototypeCatalogForGame(state),
    upgradeLevels: { ...state.upgradeLevels },
    lastDiscoveryId: state.lastDiscoveryId,
    discoveryPulse: state.discoveryPulse,
  };
}

export function canPurchaseDiscovery(state: PrototypeGameState, conceptId: KnowledgeConceptId) {
  const visibility = resolveVisibility(conceptId, new Set(state.discoveredIds));
  if (visibility !== "available") return false;
  const cost = PROTOTYPE_DISCOVERY_COSTS[conceptId] ?? Number.POSITIVE_INFINITY;
  return state.sparksMilli >= cost * SPARKS_MILLI_SCALE;
}

export function discoveryCost(conceptId: KnowledgeConceptId) {
  return PROTOTYPE_DISCOVERY_COSTS[conceptId] ?? 0;
}

export function canPurchaseUpgrade(state: PrototypeGameState, upgradeId: PrototypeUpgradeId) {
  const definition = PROTOTYPE_UPGRADE_DEFINITIONS.find((item) => item.id === upgradeId);
  if (!definition) return false;
  const level = state.upgradeLevels[upgradeId];
  if (level >= definition.maxLevel) return false;
  if (definition.requires) {
    if ((state.upgradeLevels[definition.requires.upgrade] ?? 0) < definition.requires.minLevel) return false;
  }
  const costMilli = upgradeCostAtLevel(definition, level) * SPARKS_MILLI_SCALE;
  return state.sparksMilli >= costMilli;
}

export function upgradeOffers(state: PrototypeGameState) {
  return PROTOTYPE_UPGRADE_DEFINITIONS.map((definition) => {
    const level = state.upgradeLevels[definition.id];
    const maxed = level >= definition.maxLevel;
    const locked = definition.requires
      ? (state.upgradeLevels[definition.requires.upgrade] ?? 0) < definition.requires.minLevel
      : false;
    const cost = maxed ? null : upgradeCostAtLevel(definition, level);
    return {
      id: definition.id,
      level,
      maxLevel: definition.maxLevel,
      cost,
      maxed,
      locked,
      affordable: !maxed && !locked && cost !== null && state.sparksMilli >= cost * SPARKS_MILLI_SCALE,
    };
  });
}