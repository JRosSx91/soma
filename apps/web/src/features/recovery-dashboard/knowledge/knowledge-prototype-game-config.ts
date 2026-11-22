import { KNOWLEDGE_PROTOTYPE_NODES } from "./knowledge-prototype-fixture.js";
import type { KnowledgeConceptId } from "./knowledge-types.js";

/**
 * Provisional B2 / ECON-01D balance on the 28-concept Stratum 00 fixture.
 * Costs and generator rates are the simulated S00 table. T2 and T3 stay
 * configured and locked because their gates belong to later strata.
 */
export const PROTOTYPE_BALANCE_ID = "b2-econ-01d-s00-28";

export const PROTOTYPE_SAVE_KEY = "soma.dev.knowledge-prototype.economy.v1";

export const PROTOTYPE_SAVE_VERSION = 2;

/** 1 spark = 1000 milli-sparks. The ledger stores milli-sparks as bigint. */
export const SPARKS_MILLI_SCALE = 1000n;

/** Technical cap. A sliding second, not a minimum gap, so uneven human taps still count. */
export const PROTOTYPE_TAP_EVENTS_PER_SECOND = 12;

export const PROTOTYPE_TAP_DRAG_CANCEL_PX = 8;

const conceptId = (sequence: number): KnowledgeConceptId => {
  const node = KNOWLEDGE_PROTOTYPE_NODES[sequence - 1];
  if (!node) throw new Error(`Prototype sequence ${sequence} is outside the 19-node bench.`);
  return node.id;
};

export type PrototypeTapGate =
  | { kind: "open" }
  | { kind: "concept"; sequence: number }
  | { kind: "later-stratum"; stratum: 1 | 2 };

export interface PrototypeTapStep {
  id: string;
  yieldSparks: number;
  /** Whole sparks. The free step is not purchased. */
  costSparks: number;
  gate: PrototypeTapGate;
}

export const PROTOTYPE_TAP_STEPS: readonly PrototypeTapStep[] = [
  { id: "free", yieldSparks: 1, costSparks: 0, gate: { kind: "open" } },
  { id: "t0-2", yieldSparks: 2, costSparks: 40, gate: { kind: "open" } },
  { id: "t0-3", yieldSparks: 3, costSparks: 150, gate: { kind: "open" } },
  { id: "t1-5", yieldSparks: 5, costSparks: 600, gate: { kind: "concept", sequence: 15 } },
  { id: "t1-8", yieldSparks: 8, costSparks: 2_500, gate: { kind: "concept", sequence: 15 } },
  { id: "t2-14", yieldSparks: 14, costSparks: 12_000, gate: { kind: "later-stratum", stratum: 1 } },
  { id: "t2-24", yieldSparks: 24, costSparks: 45_000, gate: { kind: "later-stratum", stratum: 1 } },
  { id: "t3-40", yieldSparks: 40, costSparks: 160_000, gate: { kind: "later-stratum", stratum: 2 } },
  { id: "t3-70", yieldSparks: 70, costSparks: 520_000, gate: { kind: "later-stratum", stratum: 2 } },
];

export interface PrototypeGeneratorDefinition {
  id: "f00-universe" | "f00-spacetime" | "f00-field" | "f00-energy";
  sequence: number;
  /** Milli-sparks per second at levels 1..5. Level 0 produces nothing. */
  ratesMilliPerSecond: readonly [number, number, number, number, number];
  /** Whole-spark cost to reach the next level, from L1 through L4. */
  upgradeCosts: readonly [number, number, number, number];
}

export const PROTOTYPE_GENERATORS: readonly PrototypeGeneratorDefinition[] = [
  {
    id: "f00-universe",
    sequence: 1,
    ratesMilliPerSecond: [8, 14, 18, 21, 23],
    upgradeCosts: [40, 110, 280, 700],
  },
  {
    id: "f00-spacetime",
    sequence: 5,
    ratesMilliPerSecond: [10, 16, 20, 23, 25],
    upgradeCosts: [90, 240, 600, 1_400],
  },
  {
    id: "f00-field",
    sequence: 23,
    ratesMilliPerSecond: [12, 18, 23, 26, 28],
    upgradeCosts: [180, 480, 1_200, 2_800],
  },
  {
    id: "f00-energy",
    sequence: 15,
    ratesMilliPerSecond: [18, 30, 38, 44, 48],
    upgradeCosts: [500, 1_400, 3_600, 8_000],
  },
];

export type PrototypeGeneratorId = PrototypeGeneratorDefinition["id"];

/**
 * Whole-spark prices from the B2 Stratum 00 table, in F00 order.
 * The door, F00.26, costs 0. Sums are checked by the engine test.
 */
export const PROTOTYPE_DISCOVERY_COST_SPARKS = [
  0, 12, 12, 28, 70, 280, 90, 1_600, 2_400, 70, 110, 110, 260, 700, 1_800, 480, 480, 4_200, 11_000, 1_400, 1_400, 1_800, 160, 420, 6_500, 0, 14_000, 320,
] as const;

export const PROTOTYPE_ESSENTIAL_SEQUENCES = [1, 2, 3, 5, 6, 10, 13, 14, 15, 18, 19, 23, 26] as const;

export const PROTOTYPE_DISCOVERY_COSTS: Readonly<Record<KnowledgeConceptId, number>> = Object.fromEntries(
  KNOWLEDGE_PROTOTYPE_NODES.map((node, index) => [node.id, PROTOTYPE_DISCOVERY_COST_SPARKS[index] ?? 0]),
) as Record<KnowledgeConceptId, number>;

export const PROTOTYPE_CHAPTER_DISCOVERY_SPARK_TOTAL = PROTOTYPE_DISCOVERY_COST_SPARKS.reduce<number>(
  (sum, cost) => sum + cost,
  0,
);

export const PROTOTYPE_ESSENTIAL_DISCOVERY_SPARK_TOTAL = PROTOTYPE_ESSENTIAL_SEQUENCES.reduce<number>(
  (sum, sequence) => sum + (PROTOTYPE_DISCOVERY_COST_SPARKS[sequence - 1] ?? 0),
  0,
);

export function tapGateOpen(discoveredIds: readonly KnowledgeConceptId[], gate: PrototypeTapGate) {
  if (gate.kind === "open") return true;
  if (gate.kind === "later-stratum") return false;
  return discoveredIds.includes(prototypeConceptId(gate.sequence));
}

export const PROTOTYPE_INITIAL_DISCOVERED: readonly KnowledgeConceptId[] = [conceptId(1)];

export function prototypeConceptId(sequence: number) {
  return conceptId(sequence);
}

export function generatorForConcept(concept: KnowledgeConceptId) {
  return PROTOTYPE_GENERATORS.find((generator) => conceptId(generator.sequence) === concept) ?? null;
}

export function generatorById(id: string) {
  return PROTOTYPE_GENERATORS.find((generator) => generator.id === id) ?? null;
}
