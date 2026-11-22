import { KNOWLEDGE_PROTOTYPE_NODES } from "./knowledge-prototype-fixture.js";
import type { KnowledgeConceptId } from "./knowledge-types.js";

/**
 * Provisional B2 / ECON-01D bench for the 19-node prototype.
 * Figures are the approved tables. Gates and discovery prices are a
 * playable stand-in, not the definitive Stratum 00 catalog.
 * Correspondence is recorded in docs/design/gam-03b/economy-status.md.
 */
export const PROTOTYPE_BALANCE_ID = "b2-econ-01d-provisional-19";

export const PROTOTYPE_SAVE_KEY = "soma.dev.knowledge-prototype.economy.v1";

export const PROTOTYPE_SAVE_VERSION = 1;

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

export interface PrototypeTapStep {
  id: string;
  yieldSparks: number;
  /** Whole sparks. The free step is not purchased. */
  costSparks: number;
  /** Playable milestone on this bench. Null means available from the start. */
  gateSequence: number | null;
  /** What this gate stands in for. Not a scientific identification. */
  standsFor: string | null;
}

export const PROTOTYPE_TAP_STEPS: readonly PrototypeTapStep[] = [
  { id: "free", yieldSparks: 1, costSparks: 0, gateSequence: null, standsFor: null },
  { id: "t0-2", yieldSparks: 2, costSparks: 40, gateSequence: null, standsFor: null },
  { id: "t0-3", yieldSparks: 3, costSparks: 150, gateSequence: null, standsFor: null },
  { id: "t1-5", yieldSparks: 5, costSparks: 600, gateSequence: 7, standsFor: "S00 Energy owned" },
  { id: "t1-8", yieldSparks: 8, costSparks: 2_500, gateSequence: 7, standsFor: "S00 Energy owned" },
  { id: "t2-14", yieldSparks: 14, costSparks: 12_000, gateSequence: 15, standsFor: "archetype S1E2" },
  { id: "t2-24", yieldSparks: 24, costSparks: 45_000, gateSequence: 15, standsFor: "archetype S1E2" },
  { id: "t3-40", yieldSparks: 40, costSparks: 160_000, gateSequence: 18, standsFor: "archetype S2E2" },
  { id: "t3-70", yieldSparks: 70, costSparks: 520_000, gateSequence: 18, standsFor: "archetype S2E2" },
];

export interface PrototypeGeneratorDefinition {
  id: "bench-charge" | "bench-channel" | "bench-neuron" | "bench-synapse";
  sequence: number;
  /** B2 role this node stands in for. The fixture concept keeps its own name. */
  standsFor: "Universe" | "Spacetime" | "Field" | "Energy";
  /** Milli-sparks per second at levels 1..5. Level 0 produces nothing. */
  ratesMilliPerSecond: readonly [number, number, number, number, number];
  /** Whole-spark cost to reach the next level, from L1 through L4. */
  upgradeCosts: readonly [number, number, number, number];
}

export const PROTOTYPE_GENERATORS: readonly PrototypeGeneratorDefinition[] = [
  {
    id: "bench-charge",
    sequence: 1,
    standsFor: "Universe",
    ratesMilliPerSecond: [8, 14, 18, 21, 23],
    upgradeCosts: [40, 110, 280, 700],
  },
  {
    id: "bench-channel",
    sequence: 5,
    standsFor: "Spacetime",
    ratesMilliPerSecond: [10, 16, 20, 23, 25],
    upgradeCosts: [90, 240, 600, 1_400],
  },
  {
    id: "bench-neuron",
    sequence: 7,
    standsFor: "Field",
    ratesMilliPerSecond: [12, 18, 23, 26, 28],
    upgradeCosts: [180, 480, 1_200, 2_800],
  },
  {
    id: "bench-synapse",
    sequence: 16,
    standsFor: "Energy",
    ratesMilliPerSecond: [18, 30, 38, 44, 48],
    upgradeCosts: [500, 1_400, 3_600, 8_000],
  },
];

export type PrototypeGeneratorId = PrototypeGeneratorDefinition["id"];

/**
 * Provisional whole-spark prices for the 19-node bench.
 * Magnitudes follow the early Stratum 00 band so the chapter can exercise
 * taps, the first lens steps and generator upgrades. They are not the
 * definitive 28-concept price list.
 */
export const PROTOTYPE_DISCOVERY_COST_SPARKS = [
  0, 12, 12, 28, 70, 70, 160, 260, 280, 320, 420, 480, 700, 1_100, 1_800, 2_400, 4_200, 6_500, 11_000,
] as const;

export const PROTOTYPE_DISCOVERY_COSTS: Readonly<Record<KnowledgeConceptId, number>> = Object.fromEntries(
  KNOWLEDGE_PROTOTYPE_NODES.map((node, index) => [node.id, PROTOTYPE_DISCOVERY_COST_SPARKS[index] ?? 0]),
) as Record<KnowledgeConceptId, number>;

export const PROTOTYPE_CHAPTER_DISCOVERY_SPARK_TOTAL = PROTOTYPE_DISCOVERY_COST_SPARKS.reduce<number>(
  (sum, cost) => sum + cost,
  0,
);

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
