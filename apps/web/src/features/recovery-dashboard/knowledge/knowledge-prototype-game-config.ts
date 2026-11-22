import { KNOWLEDGE_PROTOTYPE_NODES } from "./knowledge-prototype-fixture.js";
import type { KnowledgeConceptId } from "./knowledge-types.js";

/** Maximum manual «Analizar» actions validated per calendar second (GAME-01A demo). */
export const PROTOTYPE_MANUAL_ACTIONS_PER_SECOND = 2;

/** Sparks are stored as milli-sparks (1 spark = 1000 milli). */
export const SPARKS_MILLI_SCALE = 1000;

export const PROTOTYPE_STARTING_SPARKS_MILLI = 22_000;

export type PrototypeUpgradeId = "manual-lens" | "auto-burette" | "auto-calibration";

export interface PrototypeUpgradeDefinition {
  id: PrototypeUpgradeId;
  maxLevel: number;
  baseCost: number;
  costExponent: number;
  requires?: { upgrade: PrototypeUpgradeId; minLevel: number };
  manualBonusPerLevel?: number;
  autoMilliPerMinutePerLevel?: number;
  unlockAutoMilliPerMinute?: number;
}

export const PROTOTYPE_UPGRADE_DEFINITIONS: readonly PrototypeUpgradeDefinition[] = [
  {
    id: "manual-lens",
    maxLevel: 3,
    baseCost: 22,
    costExponent: 1.65,
    manualBonusPerLevel: 1,
  },
  {
    id: "auto-burette",
    maxLevel: 1,
    baseCost: 38,
    costExponent: 1,
    unlockAutoMilliPerMinute: 6_000,
  },
  {
    id: "auto-calibration",
    maxLevel: 3,
    baseCost: 30,
    costExponent: 1.6,
    requires: { upgrade: "auto-burette", minLevel: 1 },
    autoMilliPerMinutePerLevel: 4_000,
  },
];

const firstNodeId = KNOWLEDGE_PROTOTYPE_NODES[0]!.id;

/** Demo-only costs for the 19-node chapter (not the 7 735-spark design budget). */
const DEMO_DISCOVERY_COST_BY_INDEX = [
  0,
  18,
  18,
  44,
  30,
  38,
  52,
  56,
  20,
  22,
  34,
  40,
  42,
  46,
  48,
  38,
  52,
  58,
  68,
] as const;

export const PROTOTYPE_DISCOVERY_COSTS: Readonly<Record<KnowledgeConceptId, number>> = Object.fromEntries(
  KNOWLEDGE_PROTOTYPE_NODES.map((node, index) => [node.id, DEMO_DISCOVERY_COST_BY_INDEX[index] ?? 80]),
) as Record<KnowledgeConceptId, number>;

export const PROTOTYPE_CHAPTER_DISCOVERY_SPARK_TOTAL = [...DEMO_DISCOVERY_COST_BY_INDEX].reduce<number>(
  (sum, cost) => sum + cost,
  0,
);

export const PROTOTYPE_INITIAL_DISCOVERED: readonly KnowledgeConceptId[] = [firstNodeId];

/** Small passive bonus per discovered node (milli-sparks per minute). */
export const PROTOTYPE_DISCOVERY_PRODUCTION_BONUS_MILLI = 550;

export function upgradeCostAtLevel(definition: PrototypeUpgradeDefinition, currentLevel: number): number {
  if (currentLevel >= definition.maxLevel) return Number.POSITIVE_INFINITY;
  if (definition.costExponent === 1) return definition.baseCost;
  return Math.round(definition.baseCost * definition.costExponent ** currentLevel);
}

export function upgradeDefinition(id: PrototypeUpgradeId) {
  const definition = PROTOTYPE_UPGRADE_DEFINITIONS.find((item) => item.id === id);
  if (!definition) throw new Error(`Unknown upgrade ${id}`);
  return definition;
}