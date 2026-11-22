import {
  KNOWLEDGE_PROTOTYPE_CATALOG,
  KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
  KNOWLEDGE_PROTOTYPE_NODES,
  type KnowledgePrototypeScenarioNode,
  type KnowledgePrototypeState,
} from "./knowledge-prototype-fixture.js";
import type { KnowledgeConceptId, PublicKnowledgeCatalog } from "./knowledge-types.js";
import {
  PROTOTYPE_BALANCE_ID,
  PROTOTYPE_DISCOVERY_COSTS,
  PROTOTYPE_GENERATORS,
  PROTOTYPE_INITIAL_DISCOVERED,
  PROTOTYPE_SAVE_VERSION,
  PROTOTYPE_TAP_EVENTS_PER_SECOND,
  PROTOTYPE_TAP_STEPS,
  SPARKS_MILLI_SCALE,
  generatorById,
  generatorForConcept,
  prototypeConceptId,
  type PrototypeGeneratorId,
} from "./knowledge-prototype-game-config.js";

export interface PrototypeGameState {
  sparksMilli: bigint;
  /** Remainder of milli-sparks × milliseconds, so short ticks do not drop production. */
  carryMilliMs: bigint;
  lastSettledAt: number;
  tapTimestamps: number[];
  /** Index into PROTOTYPE_TAP_STEPS. 0 is the free yield. */
  manualStep: number;
  generatorLevels: Record<PrototypeGeneratorId, number>;
  discoveredIds: KnowledgeConceptId[];
  lastDiscoveryId: KnowledgeConceptId | null;
  discoveryPulse: number;
}

export type PrototypeGameAction =
  | { type: "tick"; now: number }
  | { type: "tap"; now: number; count: number }
  | { type: "buy_manual"; now: number }
  | { type: "buy_generator"; generatorId: PrototypeGeneratorId; now: number }
  | { type: "discover"; conceptId: KnowledgeConceptId; now: number }
  | { type: "reset"; now: number }
  | { type: "clear_discovery_pulse" };

export type PrototypeGameError =
  | "rate_limited"
  | "clock_regressed"
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
  creditedTaps?: number;
}

export interface PrototypeManualOffer {
  stepId: string | null;
  yieldSparks: number;
  nextYieldSparks: number | null;
  costSparks: number | null;
  locked: boolean;
  maxed: boolean;
  affordable: boolean;
  gateSequence: number | null;
}

export interface PrototypeGeneratorOffer {
  id: PrototypeGeneratorId;
  conceptId: KnowledgeConceptId;
  level: number;
  maxLevel: number;
  rateMilliPerSecond: bigint;
  nextRateMilliPerSecond: bigint | null;
  costSparks: number | null;
  discovered: boolean;
  maxed: boolean;
  affordable: boolean;
}

export interface PrototypeNextDiscovery {
  status: "available" | "blocked" | "complete";
  conceptId: KnowledgeConceptId | null;
  costSparks: number | null;
  missingIds: KnowledgeConceptId[];
}

export interface PrototypeGameView {
  sparksMilli: bigint;
  sparksDisplay: string;
  perTapDisplay: string;
  perTapSparks: number;
  productionMilliPerSecond: bigint;
  productionPerSecondDisplay: string;
  discoveredCount: number;
  totalDiscoveries: number;
  nodes: readonly KnowledgePrototypeScenarioNode[];
  playableCatalog: PublicKnowledgeCatalog;
  manual: PrototypeManualOffer;
  generators: readonly PrototypeGeneratorOffer[];
  nextDiscovery: PrototypeNextDiscovery;
  lastDiscoveryId: KnowledgeConceptId | null;
  discoveryPulse: number;
}

function emptyGeneratorLevels(): Record<PrototypeGeneratorId, number> {
  return {
    "bench-charge": 0,
    "bench-channel": 0,
    "bench-neuron": 0,
    "bench-synapse": 0,
  };
}

export function createInitialPrototypeGameState(now: number): PrototypeGameState {
  const generatorLevels = emptyGeneratorLevels();
  for (const generator of PROTOTYPE_GENERATORS) {
    const id = prototypeConceptId(generator.sequence);
    if (PROTOTYPE_INITIAL_DISCOVERED.includes(id)) generatorLevels[generator.id] = 1;
  }
  return {
    sparksMilli: 0n,
    carryMilliMs: 0n,
    lastSettledAt: now,
    tapTimestamps: [],
    manualStep: 0,
    generatorLevels,
    discoveredIds: [...PROTOTYPE_INITIAL_DISCOVERED],
    lastDiscoveryId: null,
    discoveryPulse: 0,
  };
}

export function reducePrototypeGame(state: PrototypeGameState, action: PrototypeGameAction): PrototypeGameResult {
  switch (action.type) {
    case "tick":
      return { state: settle(state, action.now) };
    case "tap":
      return creditTaps(state, action.now, action.count);
    case "buy_manual":
      return buyManual(state, action.now);
    case "buy_generator":
      return buyGenerator(state, action.generatorId, action.now);
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

function effectiveGeneratorLevel(state: PrototypeGameState, generatorId: PrototypeGeneratorId) {
  const generator = generatorById(generatorId);
  if (!generator) return 0;
  if (!state.discoveredIds.includes(prototypeConceptId(generator.sequence))) return 0;
  const stored = state.generatorLevels[generator.id] ?? 0;
  return Math.max(1, Math.min(stored, generator.ratesMilliPerSecond.length));
}

export function productionMilliPerSecond(state: PrototypeGameState) {
  let rate = 0n;
  for (const generator of PROTOTYPE_GENERATORS) {
    const level = effectiveGeneratorLevel(state, generator.id);
    if (level <= 0) continue;
    rate += BigInt(generator.ratesMilliPerSecond[level - 1] ?? 0);
  }
  return rate;
}

export function currentTapYieldSparks(state: PrototypeGameState) {
  return PROTOTYPE_TAP_STEPS[state.manualStep]?.yieldSparks ?? 1;
}

function settle(state: PrototypeGameState, now: number): PrototypeGameState {
  if (!Number.isFinite(now)) return state;
  if (now < state.lastSettledAt) return state;
  if (now === state.lastSettledAt) {
    return { ...state, tapTimestamps: freshTapWindow(state.tapTimestamps, now) };
  }
  const elapsedMs = BigInt(now - state.lastSettledAt);
  const accrued = productionMilliPerSecond(state) * elapsedMs + state.carryMilliMs;
  const gained = accrued / 1000n;
  const carry = accrued % 1000n;
  return {
    ...state,
    sparksMilli: state.sparksMilli + gained,
    carryMilliMs: carry < 0n ? 0n : carry,
    lastSettledAt: now,
    tapTimestamps: freshTapWindow(state.tapTimestamps, now),
  };
}

function freshTapWindow(stamps: readonly number[], now: number) {
  return stamps.filter((stamp) => now - stamp < 1000 && now - stamp >= 0);
}

function creditTaps(state: PrototypeGameState, now: number, requested: number): PrototypeGameResult {
  if (!Number.isFinite(now) || now < state.lastSettledAt) {
    return { state, error: "clock_regressed", creditedTaps: 0 };
  }
  const settled = settle(state, now);
  const room = PROTOTYPE_TAP_EVENTS_PER_SECOND - settled.tapTimestamps.length;
  const asked = Number.isFinite(requested) ? Math.max(0, Math.floor(requested)) : 0;
  const credited = Math.max(0, Math.min(asked, room));
  if (credited === 0) {
    return {
      state: settled,
      error: asked > 0 ? "rate_limited" : undefined,
      creditedTaps: 0,
    };
  }
  const gain = BigInt(currentTapYieldSparks(settled)) * SPARKS_MILLI_SCALE * BigInt(credited);
  return {
    state: {
      ...settled,
      sparksMilli: settled.sparksMilli + gain,
      tapTimestamps: settled.tapTimestamps.concat(Array.from({ length: credited }, () => now)),
    },
    creditedTaps: credited,
    error: credited < asked ? "rate_limited" : undefined,
  };
}

function buyManual(state: PrototypeGameState, now: number): PrototypeGameResult {
  const settled = settle(state, now);
  const next = PROTOTYPE_TAP_STEPS[settled.manualStep + 1];
  if (!next) return { state: settled, error: "upgrade_maxed" };
  if (next.yieldSparks <= currentTapYieldSparks(settled)) {
    return { state: settled, error: "upgrade_maxed" };
  }
  if (next.gateSequence !== null && !settled.discoveredIds.includes(prototypeConceptId(next.gateSequence))) {
    return { state: settled, error: "upgrade_locked" };
  }
  const cost = BigInt(next.costSparks) * SPARKS_MILLI_SCALE;
  if (settled.sparksMilli < cost) return { state: settled, error: "insufficient_sparks" };
  return {
    state: {
      ...settled,
      sparksMilli: settled.sparksMilli - cost,
      manualStep: settled.manualStep + 1,
    },
  };
}

function buyGenerator(state: PrototypeGameState, generatorId: PrototypeGeneratorId, now: number): PrototypeGameResult {
  const settled = settle(state, now);
  const generator = generatorById(generatorId);
  if (!generator) return { state: settled, error: "unknown_upgrade" };
  const level = effectiveGeneratorLevel(settled, generator.id);
  if (level <= 0) return { state: settled, error: "upgrade_locked" };
  if (level >= generator.ratesMilliPerSecond.length) return { state: settled, error: "upgrade_maxed" };
  const costSparks = generator.upgradeCosts[level - 1];
  if (costSparks === undefined) return { state: settled, error: "upgrade_maxed" };
  const cost = BigInt(costSparks) * SPARKS_MILLI_SCALE;
  if (settled.sparksMilli < cost) return { state: settled, error: "insufficient_sparks" };
  return {
    state: {
      ...settled,
      sparksMilli: settled.sparksMilli - cost,
      generatorLevels: { ...settled.generatorLevels, [generator.id]: level + 1 },
    },
  };
}

function discoverConcept(state: PrototypeGameState, conceptId: KnowledgeConceptId, now: number): PrototypeGameResult {
  const settled = settle(state, now);
  if (settled.discoveredIds.includes(conceptId)) {
    return { state: settled, error: "already_discovered" };
  }
  if (!KNOWLEDGE_PROTOTYPE_NODES.some((node) => node.id === conceptId)) {
    return { state: settled, error: "unknown_concept" };
  }
  if (resolveVisibility(conceptId, new Set(settled.discoveredIds)) !== "available") {
    return { state: settled, error: "discovery_locked" };
  }
  const costSparks = PROTOTYPE_DISCOVERY_COSTS[conceptId];
  if (costSparks === undefined) return { state: settled, error: "unknown_concept" };
  const cost = BigInt(costSparks) * SPARKS_MILLI_SCALE;
  if (settled.sparksMilli < cost) return { state: settled, error: "insufficient_sparks" };
  const generator = generatorForConcept(conceptId);
  const generatorLevels = generator
    ? { ...settled.generatorLevels, [generator.id]: Math.max(1, settled.generatorLevels[generator.id] ?? 0) }
    : settled.generatorLevels;
  return {
    state: {
      ...settled,
      sparksMilli: settled.sparksMilli - cost,
      discoveredIds: [...settled.discoveredIds, conceptId],
      generatorLevels,
      lastDiscoveryId: conceptId,
      discoveryPulse: settled.discoveryPulse + 1,
    },
  };
}

export function resolveVisibility(
  conceptId: KnowledgeConceptId,
  discovered: ReadonlySet<KnowledgeConceptId>,
): KnowledgePrototypeState {
  if (discovered.has(conceptId)) return "discovered";
  const incoming = KNOWLEDGE_PROTOTYPE_DEPENDENCIES.filter((edge) => edge.to === conceptId);
  if (incoming.length === 0) return "hidden";
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

export function formatSparkMilli(milli: bigint) {
  const negative = milli < 0n;
  const absolute = negative ? -milli : milli;
  const whole = absolute / SPARKS_MILLI_SCALE;
  const fraction = (absolute % SPARKS_MILLI_SCALE).toString().padStart(3, "0").replace(/0+$/, "");
  const body = fraction.length > 0 ? `${whole.toString()}.${fraction}` : whole.toString();
  return negative ? `-${body}` : body;
}

export function formatMilliPerSecond(milliPerSecond: bigint) {
  return formatSparkMilli(milliPerSecond);
}

export function discoveryCost(conceptId: KnowledgeConceptId) {
  return PROTOTYPE_DISCOVERY_COSTS[conceptId] ?? 0;
}

export function canPurchaseDiscovery(state: PrototypeGameState, conceptId: KnowledgeConceptId) {
  if (resolveVisibility(conceptId, new Set(state.discoveredIds)) !== "available") return false;
  const cost = PROTOTYPE_DISCOVERY_COSTS[conceptId];
  if (cost === undefined) return false;
  return state.sparksMilli >= BigInt(cost) * SPARKS_MILLI_SCALE;
}

export function manualOffer(state: PrototypeGameState): PrototypeManualOffer {
  const current = PROTOTYPE_TAP_STEPS[state.manualStep];
  const next = PROTOTYPE_TAP_STEPS[state.manualStep + 1];
  const yieldSparks = current?.yieldSparks ?? 1;
  if (!next || next.yieldSparks <= yieldSparks) {
    return {
      stepId: null,
      yieldSparks,
      nextYieldSparks: null,
      costSparks: null,
      locked: false,
      maxed: true,
      affordable: false,
      gateSequence: null,
    };
  }
  const locked = next.gateSequence !== null && !state.discoveredIds.includes(prototypeConceptId(next.gateSequence));
  const cost = BigInt(next.costSparks) * SPARKS_MILLI_SCALE;
  return {
    stepId: next.id,
    yieldSparks,
    nextYieldSparks: next.yieldSparks,
    costSparks: next.costSparks,
    locked,
    maxed: false,
    affordable: !locked && state.sparksMilli >= cost,
    gateSequence: next.gateSequence,
  };
}

export function generatorOffers(state: PrototypeGameState): readonly PrototypeGeneratorOffer[] {
  const owned = new Set(state.discoveredIds);
  return PROTOTYPE_GENERATORS.map((generator) => {
    const conceptId = prototypeConceptId(generator.sequence);
    const discovered = owned.has(conceptId);
    const level = effectiveGeneratorLevel(state, generator.id);
    const maxLevel = generator.ratesMilliPerSecond.length;
    const rate = level > 0 ? BigInt(generator.ratesMilliPerSecond[level - 1] ?? 0) : 0n;
    const maxed = level >= maxLevel;
    const nextRate = maxed || level <= 0 ? null : BigInt(generator.ratesMilliPerSecond[level] ?? 0);
    const costSparks = !discovered || maxed || level <= 0 ? null : generator.upgradeCosts[level - 1] ?? null;
    const affordable = costSparks !== null && state.sparksMilli >= BigInt(costSparks) * SPARKS_MILLI_SCALE;
    return {
      id: generator.id,
      conceptId,
      level,
      maxLevel,
      rateMilliPerSecond: rate,
      nextRateMilliPerSecond: nextRate,
      costSparks,
      discovered,
      maxed: discovered && maxed,
      affordable,
    };
  });
}

export function nextDiscovery(state: PrototypeGameState): PrototypeNextDiscovery {
  const discovered = new Set(state.discoveredIds);
  const available = KNOWLEDGE_PROTOTYPE_NODES.filter(
    (node) => resolveVisibility(node.id, discovered) === "available",
  );
  if (available.length > 0) {
    const cheapest = [...available].sort(
      (left, right) => discoveryCost(left.id) - discoveryCost(right.id) || left.id.localeCompare(right.id),
    )[0]!;
    return {
      status: "available",
      conceptId: cheapest.id,
      costSparks: discoveryCost(cheapest.id),
      missingIds: [],
    };
  }
  const blocked = KNOWLEDGE_PROTOTYPE_NODES.find((node) => {
    const visibility = resolveVisibility(node.id, discovered);
    return visibility === "hinted" || visibility === "hidden";
  });
  if (!blocked) return { status: "complete", conceptId: null, costSparks: null, missingIds: [] };
  const missingIds = KNOWLEDGE_PROTOTYPE_DEPENDENCIES.filter(
    (edge) => edge.to === blocked.id && !discovered.has(edge.from),
  ).map((edge) => edge.from);
  return {
    status: "blocked",
    conceptId: blocked.id,
    costSparks: discoveryCost(blocked.id),
    missingIds,
  };
}

export function derivePrototypeGameView(state: PrototypeGameState): PrototypeGameView {
  const rate = productionMilliPerSecond(state);
  const perTap = currentTapYieldSparks(state);
  return {
    sparksMilli: state.sparksMilli,
    sparksDisplay: formatSparkMilli(state.sparksMilli),
    perTapDisplay: String(perTap),
    perTapSparks: perTap,
    productionMilliPerSecond: rate,
    productionPerSecondDisplay: formatMilliPerSecond(rate),
    discoveredCount: state.discoveredIds.length,
    totalDiscoveries: KNOWLEDGE_PROTOTYPE_NODES.length,
    nodes: projectPrototypeNodes(state),
    playableCatalog: prototypeCatalogForGame(state),
    manual: manualOffer(state),
    generators: generatorOffers(state),
    nextDiscovery: nextDiscovery(state),
    lastDiscoveryId: state.lastDiscoveryId,
    discoveryPulse: state.discoveryPulse,
  };
}

export interface PrototypeSaveDocument {
  version: number;
  balanceId: string;
  sparksMilli: string;
  carryMilliMs: string;
  lastSettledAt: number;
  tapTimestamps: number[];
  manualStep: number;
  generatorLevels: Record<PrototypeGeneratorId, number>;
  discoveredIds: KnowledgeConceptId[];
}

export function prototypeStateToDocument(state: PrototypeGameState): PrototypeSaveDocument {
  return {
    version: PROTOTYPE_SAVE_VERSION,
    balanceId: PROTOTYPE_BALANCE_ID,
    sparksMilli: state.sparksMilli.toString(),
    carryMilliMs: state.carryMilliMs.toString(),
    lastSettledAt: state.lastSettledAt,
    tapTimestamps: state.tapTimestamps.slice(-PROTOTYPE_TAP_EVENTS_PER_SECOND),
    manualStep: state.manualStep,
    generatorLevels: { ...state.generatorLevels },
    discoveredIds: [...state.discoveredIds],
  };
}

export function prototypeStateFromDocument(raw: unknown): PrototypeGameState | null {
  if (!raw || typeof raw !== "object") return null;
  const document = raw as Partial<PrototypeSaveDocument>;
  if (document.version !== PROTOTYPE_SAVE_VERSION || document.balanceId !== PROTOTYPE_BALANCE_ID) return null;
  if (typeof document.sparksMilli !== "string" || !/^\d+$/.test(document.sparksMilli)) return null;
  if (typeof document.carryMilliMs !== "string" || !/^\d+$/.test(document.carryMilliMs)) return null;
  if (typeof document.lastSettledAt !== "number" || !Number.isFinite(document.lastSettledAt)) return null;
  if (!Array.isArray(document.discoveredIds) || document.discoveredIds.length === 0) return null;
  const known = new Set(KNOWLEDGE_PROTOTYPE_NODES.map((node) => node.id));
  if (!document.discoveredIds.every((id) => typeof id === "string" && known.has(id as KnowledgeConceptId))) return null;
  if (typeof document.manualStep !== "number" || !Number.isInteger(document.manualStep)) return null;
  if (document.manualStep < 0 || document.manualStep >= PROTOTYPE_TAP_STEPS.length) return null;
  const levels = emptyGeneratorLevels();
  const stored = document.generatorLevels;
  if (!stored || typeof stored !== "object") return null;
  for (const generator of PROTOTYPE_GENERATORS) {
    const level = stored[generator.id];
    if (typeof level !== "number" || !Number.isInteger(level) || level < 0 || level > generator.ratesMilliPerSecond.length) {
      return null;
    }
    levels[generator.id] = level;
  }
  const stamps = Array.isArray(document.tapTimestamps)
    ? document.tapTimestamps.filter((stamp) => typeof stamp === "number" && Number.isFinite(stamp))
    : [];
  return {
    sparksMilli: BigInt(document.sparksMilli),
    carryMilliMs: BigInt(document.carryMilliMs),
    lastSettledAt: document.lastSettledAt,
    tapTimestamps: stamps.slice(-PROTOTYPE_TAP_EVENTS_PER_SECOND),
    manualStep: document.manualStep,
    generatorLevels: levels,
    discoveredIds: [...new Set(document.discoveredIds as KnowledgeConceptId[])],
    lastDiscoveryId: null,
    discoveryPulse: 0,
  };
}
