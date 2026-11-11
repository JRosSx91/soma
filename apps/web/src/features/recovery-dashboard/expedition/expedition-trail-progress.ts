/**
 * GAME-07E: derive overlay fill from existing mission and temporal clocks.
 * Selection, XP and medals do not contribute.
 */

import type {
  ExpeditionNode,
  ExpeditionRouteId,
} from "./expedition-model.js";

export const TRAIL_HALO_TICKS = 10;

export interface KnowledgeTrailFill {
  neurotransmitters: number;
  processes: number;
}

function publishedRatio(node: ExpeditionNode | undefined): number {
  if (
    node == null ||
    node.completed == null ||
    node.total == null ||
    node.total < 1
  ) {
    return 0;
  }
  if (node.completed <= 0) return 0;
  return Math.min(100, Math.round((node.completed * 100) / node.total));
}

export function knowledgeTrailFill(
  nodes: readonly ExpeditionNode[],
): KnowledgeTrailFill {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return {
    neurotransmitters: publishedRatio(byId.get("neurotransmitters")),
    processes: publishedRatio(byId.get("processes")),
  };
}

export function perseveranceHaloTicks(
  node: ExpeditionNode | undefined,
): { completed: number; total: number } {
  if (node == null || node.route !== "perseverance") {
    return { completed: 0, total: TRAIL_HALO_TICKS };
  }
  if (node.completed == null || node.total == null || node.total < 1) {
    return { completed: 0, total: TRAIL_HALO_TICKS };
  }
  return {
    completed: Math.min(node.completed, node.total),
    total: node.total,
  };
}

export function knowledgeFillForRoute(
  route: ExpeditionRouteId,
  nodes: readonly ExpeditionNode[],
): KnowledgeTrailFill {
  if (route !== "knowledge") {
    return { neurotransmitters: 0, processes: 0 };
  }
  return knowledgeTrailFill(nodes);
}
