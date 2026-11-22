import type { KnowledgePrototypeState } from "./knowledge-prototype-fixture.js";
import type { KnowledgeConceptId } from "./knowledge-types.js";
import { pathOrganicBias } from "./knowledge-prototype-organic-layout.js";

export type PrototypeConnectionKind = "scientific" | "game";

export interface PrototypeConnectionEdge {
  id: string;
  from: KnowledgeConceptId;
  to: KnowledgeConceptId;
  kind: PrototypeConnectionKind;
}

export interface PrototypeRenderedConnection extends PrototypeConnectionEdge {
  index: number;
  pairKey: string;
  sharesPair: boolean;
  laneOffset: number;
  length: number;
}

const SCIENCE_LANE = -16;
const GAME_LANE = 16;

export function buildRenderedConnections(
  relations: readonly { id: string; subject: KnowledgeConceptId; object: KnowledgeConceptId }[],
  dependencies: readonly { id: string; from: KnowledgeConceptId; to: KnowledgeConceptId }[],
  positions: ReadonlyMap<KnowledgeConceptId, { x: number; y: number }>,
  laneScale = 1,
): PrototypeRenderedConnection[] {
  const edges: PrototypeConnectionEdge[] = [
    ...relations.map((relation) => ({
      id: relation.id,
      from: relation.subject,
      to: relation.object,
      kind: "scientific" as const,
    })),
    ...dependencies.map((dependency) => ({
      id: dependency.id,
      from: dependency.from,
      to: dependency.to,
      kind: "game" as const,
    })),
  ];

  const pairKinds = new Map<string, Set<PrototypeConnectionKind>>();
  for (const edge of edges) {
    const key = pairKey(edge.from, edge.to);
    pairKinds.set(key, new Set([...(pairKinds.get(key) ?? []), edge.kind]));
  }

  return edges
    .map((edge, index) => {
      const from = positions.get(edge.from);
      const to = positions.get(edge.to);
      const key = pairKey(edge.from, edge.to);
      const sharesPair = (pairKinds.get(key)?.size ?? 0) > 1;
      const baseLane = edge.kind === "scientific" ? SCIENCE_LANE : GAME_LANE;
      const laneOffset = baseLane * laneScale * (sharesPair ? 1.12 : 1);
      return {
        ...edge,
        index,
        pairKey: key,
        sharesPair,
        laneOffset,
        length: from && to ? Math.hypot(to.x - from.x, to.y - from.y) : 0,
      };
    })
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "scientific" ? -1 : 1;
      return b.length - a.length;
    });
}

export function connectionStrokeStyle(
  kind: PrototypeConnectionKind,
  fromState: KnowledgePrototypeState,
  toState: KnowledgePrototypeState,
): { width: number; opacity: number; dash?: string } {
  const researching = fromState === "researching" || toState === "researching";
  const availablePath = fromState === "available" || toState === "available";
  if (kind === "game") {
    return {
      width: researching ? 3.15 : sharesProgressWeight(availablePath, 2.75, 2.55),
      opacity: researching ? 0.94 : sharesProgressWeight(availablePath, 0.86, 0.82),
      dash: "10 7",
    };
  }
  return {
    width: researching ? 2.65 : 2.4,
    opacity: researching ? 0.78 : sharesProgressWeight(availablePath, 0.7, 0.64),
    dash: undefined,
  };
}

function sharesProgressWeight(availablePath: boolean, availableValue: number, base: number) {
  return availablePath ? availableValue : base;
}

type RoutingMode = "vertical" | "lateral";

export function connectionAnchors(
  from: { x: number; y: number },
  to: { x: number; y: number },
  cardHalfHeight: number,
  cardHalfWidth: number,
  laneOffset: number,
): {
  start: { x: number; y: number };
  end: { x: number; y: number };
  routing: RoutingMode;
} {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx < 58 && absDy > cardHalfHeight) {
    return {
      start: { x: from.x + laneOffset, y: from.y + cardHalfHeight },
      end: { x: to.x + laneOffset, y: to.y - cardHalfHeight },
      routing: "vertical",
    };
  }

  const leaveFromSide = dx < 0 ? -cardHalfWidth * 0.94 : cardHalfWidth * 0.94;
  const enterFromSide = dx > 0 ? -cardHalfWidth * 0.94 : cardHalfWidth * 0.94;
  const laneMix = laneOffset * 0.38;
  const verticalTrim = Math.min(cardHalfHeight * 0.52, Math.abs(dy) * 0.15);
  const verticalSign = Math.sign(dy) || 1;

  return {
    start: {
      x: from.x + leaveFromSide + laneMix,
      y: from.y + verticalSign * verticalTrim,
    },
    end: {
      x: to.x + enterFromSide + laneMix,
      y: to.y - verticalSign * verticalTrim,
    },
    routing: "lateral",
  };
}

export function verticalFlowPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  cardHalfHeight: number,
  laneOffset: number,
  pathKey?: string,
  cardHalfWidth = 88,
): string {
  const { start, end, routing } = connectionAnchors(
    from,
    to,
    cardHalfHeight,
    cardHalfWidth,
    laneOffset,
  );
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const span = Math.hypot(dx, dy);
  if (span <= 8) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  const horizontal = Math.abs(dx);
  const bias = pathOrganicBias(
    pathKey ?? `${start.x}:${start.y}:${end.x}:${end.y}`,
    laneOffset,
    span,
    horizontal,
  );
  const bend = Math.min(18, Math.abs(bias.bend) * 0.55);

  if (routing === "vertical") {
    const gap = dy;
    const strength = Math.min(0.36, 0.2 + horizontal / Math.max(520, span * 3.2));
    const c1 = { x: start.x + bend * Math.sign(dx || 1) * 0.4, y: start.y + gap * strength };
    const c2 = { x: end.x - bend * Math.sign(dx || 1) * 0.35, y: end.y - gap * strength };
    return `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`;
  }

  const c1 = {
    x: start.x + dx * 0.36 + bend * Math.sign(dx || 1),
    y: start.y + dy * 0.2,
  };
  const c2 = {
    x: end.x - dx * 0.36 - bend * Math.sign(dx || 1) * 0.45,
    y: end.y - dy * 0.2,
  };
  return `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`;
}

/** Samples points along a cubic path for geometric regression checks. */
export function sampleCubicPath(path: string, steps = 12): Array<{ x: number; y: number }> {
  const moveMatch = path.match(/^M\s+([\d.-]+)\s+([\d.-]+)/);
  if (!moveMatch) return [];
  const lineMatch = path.match(/^M\s+([\d.-]+)\s+([\d.-]+)\s+L\s+([\d.-]+)\s+([\d.-]+)$/);
  if (lineMatch) {
    const x0 = Number(lineMatch[1]);
    const y0 = Number(lineMatch[2]);
    const x1 = Number(lineMatch[3]);
    const y1 = Number(lineMatch[4]);
    return Array.from({ length: steps + 1 }, (_, index) => {
      const t = index / steps;
      return { x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t };
    });
  }
  const curveMatch = path.match(
    /^M\s+([\d.-]+)\s+([\d.-]+)\s+C\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)$/,
  );
  if (!curveMatch) return [];
  const x0 = Number(curveMatch[1]);
  const y0 = Number(curveMatch[2]);
  const x1 = Number(curveMatch[3]);
  const y1 = Number(curveMatch[4]);
  const x2 = Number(curveMatch[5]);
  const y2 = Number(curveMatch[6]);
  const x3 = Number(curveMatch[7]);
  const y3 = Number(curveMatch[8]);
  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    const mt = 1 - t;
    return {
      x: mt ** 3 * x0 + 3 * mt ** 2 * t * x1 + 3 * mt * t ** 2 * x2 + t ** 3 * x3,
      y: mt ** 3 * y0 + 3 * mt ** 2 * t * y1 + 3 * mt * t ** 2 * y2 + t ** 3 * y3,
    };
  });
}

export function exploredFrontierY(
  nodes: ReadonlyArray<{ node: { state: KnowledgePrototypeState }; y: number }>,
  fallbackTop: number,
): number {
  const lit = new Set<KnowledgePrototypeState>(["discovered", "researching", "available"]);
  let frontier = fallbackTop;
  for (const item of nodes) {
    if (lit.has(item.node.state)) frontier = Math.max(frontier, item.y);
  }
  return frontier;
}

function pairKey(from: KnowledgeConceptId, to: KnowledgeConceptId) {
  return `${from}→${to}`;
}