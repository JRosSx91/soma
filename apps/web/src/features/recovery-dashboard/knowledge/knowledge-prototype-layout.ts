import {
  KNOWLEDGE_PROTOTYPE_NODES,
  type KnowledgePrototypeDependency,
  type KnowledgePrototypeScenarioNode,
  type KnowledgePrototypeState,
} from "./knowledge-prototype-fixture.js";
import type { KnowledgeConceptId } from "./knowledge-types.js";
import {
  branchClusterPosition,
  cardsOverlap,
  clampNodePosition,
  enforceCardSeparation,
  organicNodeOffset,
  prototypeCardFootprint,
  relaxNodeOverlaps,
  spineSerpentineX,
  spineTierY,
} from "./knowledge-prototype-organic-layout.js";

export interface PrototypeCanvasMetrics {
  width: number;
  top: number;
  rowGap: number;
  sideMargin: number;
  cardHalfHeight: number;
}

/** Stable geometry from the full chapter graph; visibility only affects rendering. */
export function mergeLayoutScenarioNodes(
  visible: readonly KnowledgePrototypeScenarioNode[],
): KnowledgePrototypeScenarioNode[] {
  const byId = new Map(visible.map((node) => [node.id, node]));
  return KNOWLEDGE_PROTOTYPE_NODES.map((node) => {
    const live = byId.get(node.id);
    if (live) return live;
    return { ...node, state: "hidden" as KnowledgePrototypeState };
  });
}

export function buildPrototypeLayout(
  visibleNodes: readonly KnowledgePrototypeScenarioNode[],
  _dependencies: readonly KnowledgePrototypeDependency[],
  metrics: PrototypeCanvasMetrics,
) {
  const nodes = mergeLayoutScenarioNodes(visibleNodes);
  const cardHalfWidth = prototypeCardFootprint(metrics).halfWidth;
  const { halfHeight } = prototypeCardFootprint(metrics);

  const drafts = nodes.map((node) => ({
    id: node.id,
    node,
    x: metrics.width / 2,
    y: metrics.top,
    spine: node.progression.track === "spine",
    side: node.progression.track === "branch" ? node.progression.side : undefined,
    cluster: node.cluster,
  }));

  for (const item of drafts) {
    const progression = item.node.progression;
    if (progression.track !== "spine") continue;
    const organic = organicNodeOffset(item.id, metrics, "spine");
    const placed = clampNodePosition(
      spineSerpentineX(progression.tier, metrics) + organic.dx,
      spineTierY(progression.tier, metrics) + organic.dy,
      metrics,
      cardHalfWidth,
    );
    item.x = placed.x;
    item.y = placed.y;
  }

  const spineRows = drafts
    .filter((item) => item.spine)
    .sort(
      (a, b) =>
        (a.node.progression.track === "spine" ? a.node.progression.tier : 0) -
        (b.node.progression.track === "spine" ? b.node.progression.tier : 0),
    );
  let previousSpineY = metrics.top;
  let previousCluster = 0;
  for (const row of spineRows) {
    const tier = row.node.progression.track === "spine" ? row.node.progression.tier : 0;
    const clusterGap = previousCluster !== 0 && row.node.cluster !== previousCluster ? halfHeight * 1.45 : 0;
    row.x = spineSerpentineX(tier, metrics) + organicNodeOffset(row.id, metrics, "spine").dx;
    row.y = Math.max(spineTierY(tier, metrics), previousSpineY + halfHeight * 2.28 + clusterGap);
    previousSpineY = row.y;
    previousCluster = row.node.cluster;
    const clamped = clampNodePosition(row.x, row.y, metrics, cardHalfWidth);
    row.x = clamped.x;
    row.y = clamped.y;
  }

  const draftsById = new Map<KnowledgeConceptId, (typeof drafts)[number]>(drafts.map((item) => [item.id, item]));
  for (const item of drafts) {
    const progression = item.node.progression;
    if (progression.track !== "branch") continue;
    const yAnchor = draftsById.get(progression.anchor);
    if (!yAnchor) continue;
    const cluster = branchClusterPosition(
      item.id,
      progression.side,
      yAnchor,
      yAnchor,
      metrics,
      progression.dropRows,
      progression.chainDepth,
    );
    const placed = clampNodePosition(cluster.x, cluster.y, metrics, cardHalfWidth);
    item.x = placed.x;
    item.y = placed.y;
  }

  const mobile = metrics.width < 720;
  if (mobile) {
    placeMobileConstellations(drafts, metrics, halfHeight, cardHalfWidth);
  } else {
    for (const item of drafts) {
      const progression = item.node.progression;
      if (progression.track !== "branch") continue;
      const anchor = draftsById.get(progression.anchor);
      if (!anchor) continue;
      const gap = (1.35 + progression.chainDepth * 0.72 + progression.dropRows * 0.28) * halfHeight;
      item.y = Math.max(item.y, anchor.y + gap);
    }
    nudgeBranchesOffSpine(drafts, metrics, halfHeight, cardHalfWidth);
    relaxNodeOverlaps(drafts, metrics);
    enforceCardSeparation(drafts, metrics);
    separateUntilClear(drafts, metrics, halfHeight, cardHalfWidth);
  }

  const positioned = drafts.map(({ node, x, y }) => {
    const depth =
      node.progression.track === "spine"
        ? node.progression.tier
        : Math.round((y - metrics.top) / metrics.rowGap);
    return { node, x, y, depth };
  });

  const maxY = Math.max(metrics.top, ...positioned.map((item) => item.y));
  return {
    width: metrics.width,
    height: maxY + metrics.cardHalfHeight + 72,
    nodes: positioned,
  };
}

type LayoutDraft = {
  id: KnowledgeConceptId;
  node: KnowledgePrototypeScenarioNode;
  x: number;
  y: number;
  spine: boolean;
  side?: "left" | "right";
  cluster: number;
};

/** Canvas height that stops after the last revealed card. Hidden constellations stay below the frame. */
export function visibleFrameHeight(
  layout: { height: number; nodes: readonly { y: number; node: { state: KnowledgePrototypeState } }[] },
  metrics: Pick<PrototypeCanvasMetrics, "top" | "cardHalfHeight">,
) {
  const visible = layout.nodes.filter((item) => item.node.state !== "hidden");
  if (visible.length === 0) return layout.height;
  const bottom = Math.max(...visible.map((item) => item.y));
  return Math.min(layout.height, Math.max(metrics.top + metrics.cardHalfHeight, bottom + metrics.cardHalfHeight + 96));
}

function separateUntilClear(
  drafts: readonly LayoutDraft[],
  metrics: PrototypeCanvasMetrics,
  halfHeight: number,
  cardHalfWidth: number,
) {
  for (let pass = 0; pass < 40; pass += 1) {
    let moved = false;
    for (let left = 0; left < drafts.length; left += 1) {
      for (let right = left + 1; right < drafts.length; right += 1) {
        const a = drafts[left]!;
        const b = drafts[right]!;
        if (!cardsOverlap(a, b, metrics)) continue;
        const upper = a.y <= b.y ? a : b;
        const lower = upper === a ? b : a;
        lower.y = upper.y + halfHeight * 2 + 10;
        const clamped = clampNodePosition(lower.x, lower.y, metrics, cardHalfWidth);
        lower.x = clamped.x;
        lower.y = clamped.y;
        moved = true;
      }
    }
    if (!moved) break;
  }
}

function nudgeBranchesOffSpine(
  drafts: readonly LayoutDraft[],
  metrics: PrototypeCanvasMetrics,
  halfHeight: number,
  cardHalfWidth: number,
) {
  for (const item of drafts) {
    if (item.spine) continue;
    const blocker = drafts.find((candidate) => candidate.spine && cardsOverlap(item, candidate, metrics));
    if (!blocker) continue;
    const direction = item.side === "left" ? -1 : 1;
    item.x += direction * (cardHalfWidth * 0.85);
    item.y = Math.max(item.y, blocker.y + halfHeight * 0.35);
    const clamped = clampNodePosition(item.x, item.y, metrics, cardHalfWidth);
    item.x = clamped.x;
    item.y = clamped.y;
  }
}

function placeMobileConstellations(
  drafts: readonly LayoutDraft[],
  metrics: PrototypeCanvasMetrics,
  halfHeight: number,
  cardHalfWidth: number,
) {
  const center = metrics.width / 2;
  const row = halfHeight * 2.22;
  let y = metrics.top;
  const field = drafts.find((item) => item.node.sequence === 23);
  for (const cluster of [1, 2, 3, 4] as const) {
    const members = drafts
      .filter((item) => item.node.cluster === cluster && item.node.sequence !== 23)
      .sort((a, b) => a.node.sequence - b.node.sequence);
    for (const item of members) {
      const sway = organicNodeOffset(item.id, metrics, item.spine ? "spine" : "branch").dx * 0.2;
      item.x = center + sway;
      item.y = y;
      const clamped = clampNodePosition(item.x, item.y, metrics, cardHalfWidth);
      item.x = clamped.x;
      item.y = clamped.y;
      y += row;
    }
    if (cluster === 1 && field) {
      field.x = center + organicNodeOffset(field.id, metrics, "branch").dx * 0.2;
      field.y = y;
      const clamped = clampNodePosition(field.x, field.y, metrics, cardHalfWidth);
      field.x = clamped.x;
      field.y = clamped.y;
      y += row;
    }
    y += halfHeight * 1.35;
  }
}