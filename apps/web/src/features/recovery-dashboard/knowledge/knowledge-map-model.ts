import { buildKnowledgeNeighborhood } from "./knowledge-catalog.js";
import type {
  KnowledgeConcept,
  KnowledgeConceptId,
  KnowledgeRelation,
  KnowledgeCatalog,
} from "./knowledge-types.js";

export const KNOWLEDGE_MAP_VIEWBOX = {
  width: 1200,
  height: 900,
} as const;

const CENTER = {
  x: KNOWLEDGE_MAP_VIEWBOX.width / 2,
  y: KNOWLEDGE_MAP_VIEWBOX.height / 2,
} as const;
const RINGS = [
  { capacity: 8, radiusX: 250, radiusY: 160 },
  { capacity: 16, radiusX: 410, radiusY: 275 },
  { capacity: 24, radiusX: 530, radiusY: 370 },
] as const;
const EDGE_NODE_OFFSET = 78;

export interface KnowledgeMapNode {
  concept: KnowledgeConcept;
  x: number;
  y: number;
  depth: 0 | 1 | 2;
  central: boolean;
}

export type KnowledgeMapEdgeKind = "incoming" | "outgoing" | "context";

export interface KnowledgeMapEdge {
  relation: KnowledgeRelation;
  kind: KnowledgeMapEdgeKind;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  labelX: number;
  labelY: number;
}

export interface KnowledgeMapModel {
  rootId: KnowledgeConceptId;
  depth: 1 | 2;
  nodes: readonly KnowledgeMapNode[];
  edges: readonly KnowledgeMapEdge[];
  truncated: boolean;
  maxNodes: number;
}

/**
 * Presentation-only transform. Scientific reach, cycles and the 25-node cap
 * remain owned by UI-01A's neighborhood builder.
 */
export function buildKnowledgeMapModel(
  catalog: KnowledgeCatalog,
  rootId: KnowledgeConceptId,
  depth: 1 | 2,
): KnowledgeMapModel {
  const neighborhood = buildKnowledgeNeighborhood(catalog, rootId, {
    maxDepth: depth,
    maxNodes: 25,
  });
  const depths = neighborhoodDepths(rootId, neighborhood.discoveries);
  const positioned = layoutNodes(neighborhood.concepts, rootId, depths);
  const byId = new Map(positioned.map((node) => [node.concept.id, node]));
  const edges = layoutEdges(neighborhood.relations, byId, rootId);
  return {
    rootId,
    depth,
    nodes: positioned,
    edges,
    truncated: neighborhood.truncated,
    maxNodes: neighborhood.maxNodes,
  };
}

function neighborhoodDepths(
  rootId: KnowledgeConceptId,
  discoveries: ReturnType<typeof buildKnowledgeNeighborhood>["discoveries"],
): Map<KnowledgeConceptId, 0 | 1 | 2> {
  const depths = new Map<KnowledgeConceptId, 0 | 1 | 2>([[rootId, 0]]);
  for (const traversal of discoveries) {
    const fromDepth = depths.get(traversal.from) ?? 0;
    depths.set(traversal.to, Math.min(2, fromDepth + 1) as 1 | 2);
  }
  return depths;
}

function layoutNodes(
  concepts: readonly KnowledgeConcept[],
  rootId: KnowledgeConceptId,
  depths: ReadonlyMap<KnowledgeConceptId, 0 | 1 | 2>,
): KnowledgeMapNode[] {
  const root = concepts.find((concept) => concept.id === rootId);
  if (!root) return [];
  const result: KnowledgeMapNode[] = [
    { concept: root, ...CENTER, depth: 0, central: true },
  ];
  let ringIndex = 0;
  for (const depth of [1, 2] as const) {
    const pending = concepts
      .filter((concept) => concept.id !== rootId && depths.get(concept.id) === depth)
      .sort((left, right) => left.id.localeCompare(right.id));
    let cursor = 0;
    while (cursor < pending.length) {
      const ring = RINGS[Math.min(ringIndex, RINGS.length - 1)]!;
      const count = Math.min(ring.capacity, pending.length - cursor);
      const slice = pending.slice(cursor, cursor + count);
      slice.forEach((concept, index) => {
        const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
        result.push({
          concept,
          x: round(CENTER.x + Math.cos(angle) * ring.radiusX),
          y: round(CENTER.y + Math.sin(angle) * ring.radiusY),
          depth,
          central: false,
        });
      });
      cursor += count;
      ringIndex += 1;
    }
  }
  return result;
}

function layoutEdges(
  relations: readonly KnowledgeRelation[],
  nodes: ReadonlyMap<KnowledgeConceptId, KnowledgeMapNode>,
  rootId: KnowledgeConceptId,
): KnowledgeMapEdge[] {
  const sorted = [...relations].sort((left, right) => left.id.localeCompare(right.id));
  const parallelGroups = new Map<string, KnowledgeRelation[]>();
  for (const relation of sorted) {
    const pair = [relation.subject, relation.object].sort().join("|");
    const group = parallelGroups.get(pair) ?? [];
    group.push(relation);
    parallelGroups.set(pair, group);
  }

  return sorted.flatMap((relation) => {
    const subject = nodes.get(relation.subject);
    const object = nodes.get(relation.object);
    if (!subject || !object) return [];
    const pair = [relation.subject, relation.object].sort().join("|");
    const group = parallelGroups.get(pair) ?? [relation];
    const index = group.findIndex((item) => item.id === relation.id);
    const parallelOffset = (index - (group.length - 1) / 2) * 14;
    const points = edgePoints(subject, object, parallelOffset);
    return [
      {
        relation,
        kind:
          relation.subject === rootId
            ? "outgoing"
            : relation.object === rootId
              ? "incoming"
              : "context",
        ...points,
      },
    ];
  });
}

function edgePoints(
  subject: KnowledgeMapNode,
  object: KnowledgeMapNode,
  parallelOffset: number,
): Omit<KnowledgeMapEdge, "relation" | "kind"> {
  const dx = object.x - subject.x;
  const dy = object.y - subject.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const unitX = dx / distance;
  const unitY = dy / distance;
  const perpendicularX = -unitY * parallelOffset;
  const perpendicularY = unitX * parallelOffset;
  const x1 = subject.x + unitX * EDGE_NODE_OFFSET + perpendicularX;
  const y1 = subject.y + unitY * EDGE_NODE_OFFSET + perpendicularY;
  const x2 = object.x - unitX * EDGE_NODE_OFFSET + perpendicularX;
  const y2 = object.y - unitY * EDGE_NODE_OFFSET + perpendicularY;
  return {
    x1: round(x1),
    y1: round(y1),
    x2: round(x2),
    y2: round(y2),
    labelX: round((x1 + x2) / 2),
    labelY: round((y1 + y2) / 2 - 8),
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
