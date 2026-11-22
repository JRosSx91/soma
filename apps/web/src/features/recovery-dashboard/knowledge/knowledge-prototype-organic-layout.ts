import type { KnowledgeConceptId } from "./knowledge-types.js";
import type { PrototypeCanvasMetrics } from "./knowledge-prototype-layout.js";

export function stableLayoutSeed(id: string, slot: number) {
  let hash = 2_166_136_261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  hash = Math.imul(hash ^ slot, 3_747_613_93);
  return ((hash >>> 0) % 10_000) / 10_000;
}

export function spineSerpentineX(tier: number, metrics: PrototypeCanvasMetrics) {
  const mobile = metrics.width < 720;
  const center = metrics.width / 2;
  const amplitude = mobile ? 18 : 42;
  const wave = Math.sin(tier * 0.58 + 0.25);
  const drift = Math.sin(tier * 0.27 + 1.05) * amplitude * 0.18;
  const earlyRamp = 0;
  const micro = (stableLayoutSeed(`spine-tier-${tier}`, 0) - 0.5) * (mobile ? 8 : 14);
  return center + wave * amplitude + drift + earlyRamp + micro;
}

export function spineTierY(tier: number, metrics: PrototypeCanvasMetrics) {
  const compress = tier <= 4 ? 0.9 : tier <= 8 ? 0.95 : 1;
  return metrics.top + tier * metrics.rowGap * compress;
}

export function organicNodeOffset(
  id: KnowledgeConceptId,
  metrics: PrototypeCanvasMetrics,
  track: "spine" | "branch",
) {
  const scale = metrics.width / 1000;
  const swayY = (stableLayoutSeed(id, 2) - 0.5) * (track === "spine" ? 12 : 16) * scale;
  const swayX = (stableLayoutSeed(id, 1) - 0.5) * (track === "spine" ? 14 : 18) * scale;
  return { dx: swayX, dy: swayY };
}

export function branchClusterPosition(
  nodeId: KnowledgeConceptId,
  side: "left" | "right",
  yAnchor: { x: number; y: number },
  clusterOrigin: { x: number; y: number },
  metrics: PrototypeCanvasMetrics,
  dropRows: number,
  chainDepth: number,
) {
  const mobile = metrics.width < 720;
  const micro = organicNodeOffset(nodeId, metrics, "branch");
  const direction = side === "left" ? -1 : 1;
  if (mobile) {
    const xBias = direction * (22 + chainDepth * 11) + micro.dx * 0.22;
    const verticalReach =
      metrics.rowGap *
      (chainDepth === 0 ? 1.24 + dropRows * 0.32 : 0.92 + chainDepth * 0.11);
    return {
      x: clusterOrigin.x + xBias,
      y: yAnchor.y + verticalReach + micro.dy,
    };
  }
  const lateralReach =
    metrics.rowGap * (chainDepth === 0 ? 1.14 : 1.05 + chainDepth * 0.16);
  const verticalReach =
    metrics.rowGap *
    (chainDepth === 0 ? 0.94 + dropRows * 0.12 : 0.52 + dropRows * 0.36 + chainDepth * 0.16);
  const jitter = (stableLayoutSeed(nodeId, 5) - 0.5) * 26;
  return {
    x: clusterOrigin.x + direction * (lateralReach + jitter) + micro.dx * 0.5,
    y: yAnchor.y + verticalReach + micro.dy,
  };
}

export function clampNodePosition(
  x: number,
  y: number,
  metrics: PrototypeCanvasMetrics,
  cardHalfWidth = 88,
) {
  const minX = metrics.sideMargin + cardHalfWidth;
  const maxX = metrics.width - metrics.sideMargin - cardHalfWidth;
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.max(metrics.top, y),
  };
}

export function prototypeCardFootprint(metrics: PrototypeCanvasMetrics) {
  const mobile = metrics.width < 720;
  return {
    halfWidth: mobile ? 70 : 88,
    halfHeight: mobile ? 80 : 96,
  };
}

type SeparationPoint = {
  id: KnowledgeConceptId;
  x: number;
  y: number;
  spine?: boolean;
  side?: "left" | "right";
  cluster?: number;
};

export function enforceCardSeparation(
  points: Array<SeparationPoint>,
  metrics: PrototypeCanvasMetrics,
) {
  const mobile = metrics.width < 720;
  const { halfWidth, halfHeight } = prototypeCardFootprint(metrics);
  const minDx = halfWidth * 2;
  const minDy = halfHeight * 2;
  const pad = 2.5;

  const nudgeBranchX = (point: SeparationPoint, direction: -1 | 1, amount: number) => {
    point.x += direction * amount;
  };

  for (let pass = 0; pass < 36; pass += 1) {
    let moved = false;
    for (let left = 0; left < points.length; left += 1) {
      for (let right = left + 1; right < points.length; right += 1) {
        const a = points[left]!;
        const b = points[right]!;
        const overlapX = minDx - Math.abs(b.x - a.x);
        const overlapY = minDy - Math.abs(b.y - a.y);
        if (overlapX <= 0 || overlapY <= 0) continue;
        moved = true;
        const moveB = Boolean(a.spine && !b.spine);
        const moveA = Boolean(b.spine && !a.spine);
        const branchPair = !a.spine && !b.spine;
        const sameBranchLane =
          branchPair && Boolean(a.side && b.side && a.side === b.side && a.cluster === b.cluster);
        const preferVertical = (mobile && (!a.spine || !b.spine)) || sameBranchLane;
        if (!preferVertical && overlapX <= overlapY) {
          const shift = overlapX / 2 + pad;
          if (branchPair && a.side === "left" && b.side === "right") {
            nudgeBranchX(a, -1, shift);
            nudgeBranchX(b, 1, shift);
          } else if (moveB) {
            const bias = b.side === "left" ? -1 : b.side === "right" ? 1 : b.x >= a.x ? 1 : -1;
            b.x += bias * shift;
          } else if (moveA) {
            const bias = a.side === "left" ? -1 : a.side === "right" ? 1 : a.x >= b.x ? 1 : -1;
            a.x += bias * shift;
          } else if (a.spine && b.spine) {
            a.x -= shift * 0.35;
            b.x += shift * 0.35;
          } else {
            a.x -= shift;
            b.x += shift;
          }
        } else {
          const shift = overlapY / 2 + pad;
          if (sameBranchLane) {
            const lower = a.y <= b.y ? b : a;
            lower.y += overlapY + pad;
          } else if (moveB) {
            b.y += b.y >= a.y ? shift : -shift;
          } else if (moveA) {
            a.y += a.y >= b.y ? shift : -shift;
          } else if (a.spine && b.spine) {
            a.y -= shift * 0.35;
            b.y += shift * 0.35;
          } else {
            a.y -= shift * 0.55;
            b.y += shift * 0.55;
          }
        }
        const clampedA = clampNodePosition(a.x, a.y, metrics, halfWidth);
        const clampedB = clampNodePosition(b.x, b.y, metrics, halfWidth);
        a.x = clampedA.x;
        a.y = clampedA.y;
        b.x = clampedB.x;
        b.y = clampedB.y;
      }
    }
    if (!moved) break;
  }
}

export function relaxNodeOverlaps(
  points: Array<{ id: KnowledgeConceptId; x: number; y: number; spine?: boolean }>,
  metrics: PrototypeCanvasMetrics,
) {
  const { halfWidth, halfHeight } = prototypeCardFootprint(metrics);
  const cardHalfWidth = halfWidth;
  const minimumCenterGap = Math.hypot(halfWidth * 1.08, halfHeight * 1.08);
  for (let pass = 0; pass < 10; pass += 1) {
    for (let left = 0; left < points.length; left += 1) {
      for (let right = left + 1; right < points.length; right += 1) {
        const a = points[left]!;
        const b = points[right]!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (Math.abs(dx) >= halfWidth * 2.05 || Math.abs(dy) >= halfHeight * 2.05) continue;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance >= minimumCenterGap) continue;
        const push = (minimumCenterGap - distance) / 2;
        const unitX = dx / distance;
        const unitY = dy / distance;
        const aSpine = a.spine;
        const bSpine = b.spine;
        if (aSpine && bSpine) continue;
        if (aSpine && !bSpine) {
          b.x += unitX * push * 2.1;
          b.y += unitY * push * 2.1 * 0.7;
        } else if (!aSpine && bSpine) {
          a.x -= unitX * push * 2.1;
          a.y -= unitY * push * 2.1 * 0.7;
        } else {
          a.x -= unitX * push;
          a.y -= unitY * push * 0.5;
          b.x += unitX * push;
          b.y += unitY * push * 0.5;
        }
        const clampedA = clampNodePosition(a.x, a.y, metrics, cardHalfWidth);
        const clampedB = clampNodePosition(b.x, b.y, metrics, cardHalfWidth);
        a.x = clampedA.x;
        a.y = clampedA.y;
        b.x = clampedB.x;
        b.y = clampedB.y;
      }
    }
  }
}

export function pathOrganicBias(pathKey: string, laneOffset: number, span: number, horizontalSpan: number) {
  const seed = stableLayoutSeed(pathKey, 7) - 0.5;
  const bendCap = Math.min(24, horizontalSpan * 0.16 + 6, span * 0.08);
  return {
    bend: seed * bendCap + laneOffset * 0.12,
    lift: (stableLayoutSeed(pathKey, 11) - 0.5) * Math.min(14, span * 0.05),
  };
}

export function cardsOverlap(
  a: { x: number; y: number },
  b: { x: number; y: number },
  metrics: PrototypeCanvasMetrics,
) {
  const { halfWidth, halfHeight } = prototypeCardFootprint(metrics);
  return Math.abs(b.x - a.x) < halfWidth * 2 && Math.abs(b.y - a.y) < halfHeight * 2;
}