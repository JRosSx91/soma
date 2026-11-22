import {
  KNOWLEDGE_PROTOTYPE_NODES,
  type KnowledgePrototypeDependency,
  type KnowledgePrototypeScenarioNode,
  type KnowledgePrototypeState,
} from "./knowledge-prototype-fixture.js";
import type { KnowledgeConceptId } from "./knowledge-types.js";
import {
  branchChainDepth,
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
  for (const row of spineRows) {
    const tier = row.node.progression.track === "spine" ? row.node.progression.tier : 0;
    row.x = spineSerpentineX(tier, metrics) + organicNodeOffset(row.id, metrics, "spine").dx;
    row.y = Math.max(spineTierY(tier, metrics), previousSpineY + halfHeight * 2.28);
    previousSpineY = row.y;
    const clamped = clampNodePosition(row.x, row.y, metrics, cardHalfWidth);
    row.x = clamped.x;
    row.y = clamped.y;
  }

  const membraneId = KNOWLEDGE_PROTOTYPE_NODES[3]!.id;
  const potentialId = KNOWLEDGE_PROTOTYPE_NODES[5]!.id;
  const draftsById = new Map<KnowledgeConceptId, (typeof drafts)[number]>(drafts.map((item) => [item.id, item]));
  for (const item of drafts) {
    const progression = item.node.progression;
    if (progression.track !== "branch") continue;
    const yAnchor = draftsById.get(progression.anchor);
    if (!yAnchor) continue;
    const clusterOrigin =
      progression.side === "left"
        ? draftsById.get(membraneId) ?? yAnchor
        : draftsById.get(potentialId) ?? yAnchor;
    const cluster = branchClusterPosition(
      item.id,
      progression.side,
      yAnchor,
      clusterOrigin,
      metrics,
      progression.dropRows,
    );
    const placed = clampNodePosition(cluster.x, cluster.y, metrics, cardHalfWidth);
    item.x = placed.x;
    item.y = placed.y;
  }

  const potentialDraft = draftsById.get(potentialId);
  const mobile = metrics.width < 720;
  const branchStepY = halfHeight * (mobile ? 2.14 : 2.06);
  for (const item of drafts) {
    const progression = item.node.progression;
    if (progression.track !== "branch") continue;
    const anchor = draftsById.get(progression.anchor);
    if (!anchor) continue;
    const chainDepth = branchChainDepth(item.id);
    const gap = (mobile ? 2.42 : 1.62 + chainDepth * 0.22) * halfHeight;
    item.y = Math.max(item.y, anchor.y + gap);
  }

  const desktop = !mobile;
  const branchLane = cardHalfWidth * 2.12;
  const pinBranchLanes = () => {
    if (!desktop || !potentialDraft) return;
    for (const item of drafts) {
      const progression = item.node.progression;
      if (progression.track !== "branch") continue;
      if (progression.side === "left") {
        item.x = Math.min(item.x, potentialDraft.x - branchLane);
      } else {
        item.x = Math.max(item.x, potentialDraft.x + branchLane);
      }
      const clamped = clampNodePosition(item.x, item.y, metrics, cardHalfWidth);
      item.x = clamped.x;
      item.y = clamped.y;
    }
  };

  pinBranchLanes();

  for (const item of drafts) {
    if (item.spine) continue;
    for (let pass = 0; pass < 16; pass += 1) {
      const blocker = drafts.find((candidate) => candidate.spine && cardsOverlap(item, candidate, metrics));
      if (!blocker) break;
      item.y = Math.max(item.y, blocker.y + halfHeight * 2.06);
      const clamped = clampNodePosition(item.x, item.y, metrics, cardHalfWidth);
      item.x = clamped.x;
      item.y = clamped.y;
    }
  }

  if (desktop) {
    const stackBranchChain = (side: "left" | "right") => {
      const chain = drafts
        .filter(
          (item) =>
            item.node.progression.track === "branch" && item.node.progression.side === side,
        )
        .sort((a, b) => branchChainDepth(a.id) - branchChainDepth(b.id));
      let cursor = metrics.top;
      for (const item of chain) {
        cursor = Math.max(cursor + branchStepY, item.y);
        item.y = cursor;
        cursor = item.y;
      }
    };
    stackBranchChain("left");
    stackBranchChain("right");
  }

  relaxNodeOverlaps(drafts, metrics);
  pinBranchLanes();
  enforceCardSeparation(drafts, metrics);
  pinBranchLanes();
  enforceCardSeparation(drafts, metrics);

  if (mobile) {
    const center = metrics.width / 2;
    const progressionRank = (item: (typeof drafts)[number]) => {
      const progression = item.node.progression;
      if (progression.track === "spine") return progression.tier * 100;
      const anchor = draftsById.get(progression.anchor);
      const anchorTier =
        anchor?.node.progression.track === "spine" ? anchor.node.progression.tier : 0;
      const depth = branchChainDepth(item.id);
      return anchorTier * 100 + (progression.side === "left" ? 20 : 30) + depth * 3;
    };
    const ordered = [...drafts].sort((a, b) => progressionRank(a) - progressionRank(b));
    let yCursor = metrics.top;
    for (const item of ordered) {
      yCursor = Math.max(yCursor + branchStepY, item.y);
      item.y = yCursor;
      const sway = item.spine ? organicNodeOffset(item.id, metrics, "spine").dx * 0.42 : 0;
      item.x = center + sway;
      const clamped = clampNodePosition(item.x, item.y, metrics, cardHalfWidth);
      item.x = clamped.x;
      item.y = clamped.y;
      yCursor = item.y;
    }
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