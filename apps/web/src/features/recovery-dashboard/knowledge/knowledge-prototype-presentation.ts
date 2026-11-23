import { KNOWLEDGE_PROTOTYPE_NODES, type PrototypeCluster } from "./knowledge-prototype-fixture.js";

/**
 * Fixed disc centers for the 28 concepts. Anchors sit in four constellations;
 * the other concepts keep a stable offset around them. Nothing here is random
 * and nothing here changes a playable dependency.
 */
export const STRATUM_POSITIONS: Readonly<Record<number, { x: number; y: number }>> = {
  1: { x: 360, y: 260 },
  2: { x: 170, y: 400 },
  3: { x: 560, y: 180 },
  4: { x: 180, y: 120 },
  5: { x: 1180, y: 300 },
  6: { x: 1480, y: 160 },
  7: { x: 1040, y: 460 },
  8: { x: 1140, y: 600 },
  9: { x: 1580, y: 420 },
  10: { x: 300, y: 880 },
  11: { x: 140, y: 1000 },
  12: { x: 500, y: 720 },
  13: { x: 480, y: 920 },
  14: { x: 280, y: 1100 },
  15: { x: 500, y: 1100 },
  16: { x: 120, y: 1220 },
  17: { x: 280, y: 1300 },
  18: { x: 720, y: 1160 },
  19: { x: 1000, y: 980 },
  20: { x: 1300, y: 740 },
  21: { x: 1220, y: 1140 },
  22: { x: 1460, y: 860 },
  23: { x: 800, y: 680 },
  24: { x: 700, y: 560 },
  25: { x: 620, y: 840 },
  26: { x: 1000, y: 1220 },
  27: { x: 1580, y: 1260 },
  28: { x: 860, y: 500 },
};

export const PRESENTATION_WIDTH = 1760;
export const PRESENTATION_HEIGHT = 1500;

/**
 * Causality → Interaction is the one optional cross-constellation chord that
 * would otherwise pass through the opening hub. The bow lifts that single
 * thread; it does not add or remove the dependency.
 */
export const THREAD_BOW: Readonly<Record<string, number>> = {
  "4-24": 140,
  // Long trunks bow away from neighbouring captions. The dependencies stay.
  "2-23": -42,
  "6-26": 88,
};

const SATELLITE_ANCHOR: Readonly<Record<number, number>> = {
  2: 1,
  3: 1,
  4: 1,
  7: 5,
  8: 5,
  9: 8,
  11: 10,
  12: 10,
  13: 10,
  15: 14,
  16: 14,
  17: 14,
  18: 15,
  20: 19,
  21: 19,
  22: 19,
  24: 23,
  25: 19,
  27: 26,
  28: 5,
};

export type MapDetail = "far" | "mid" | "near";
export type CaptionSide = "above" | "below" | "left" | "right";

export function mapDetail(scale: number): MapDetail {
  if (scale < 0.58) return "far";
  if (scale < 1.05) return "mid";
  return "near";
}

export function captionIsVisible(detail: MapDetail, role: string) {
  if (detail !== "far") return true;
  return role === "milestone" || role === "convergence" || role === "door" || role === "bridge";
}

export function labelSide(sequence: number): CaptionSide {
  const node = STRATUM_POSITIONS[sequence];
  const anchorId = SATELLITE_ANCHOR[sequence];
  const anchor = anchorId ? STRATUM_POSITIONS[anchorId] : undefined;
  let side: CaptionSide = "above";
  if (node && anchor) {
    const ox = node.x - anchor.x;
    const oy = node.y - anchor.y;
    if (Math.abs(ox) >= Math.abs(oy)) side = ox >= 0 ? "right" : "left";
    else side = oy >= 0 ? "below" : "above";
  }
  if (!node) return side;
  if (side === "above" && node.y < 180) return "below";
  if (side === "below" && node.y > PRESENTATION_HEIGHT - 180) return "above";
  if (side === "left" && node.x < 220) return "right";
  if (side === "right" && node.x > PRESENTATION_WIDTH - 220) return "left";
  return side;
}

/** Box around the essential anchors of a constellation, used to frame a phone. */
export function clusterFocusBounds(cluster: PrototypeCluster) {
  const members = KNOWLEDGE_PROTOTYPE_NODES.filter((node) => node.cluster === cluster);
  const anchors = members.filter((node) => node.essential);
  const source = anchors.length > 0 ? anchors : members;
  const points = source
    .map((node) => STRATUM_POSITIONS[node.sequence])
    .filter((point): point is { x: number; y: number } => Boolean(point));
  const pad = 120;
  return {
    minX: Math.min(...points.map((point) => point.x)) - pad,
    maxX: Math.max(...points.map((point) => point.x)) + pad,
    minY: Math.min(...points.map((point) => point.y)) - pad,
    maxY: Math.max(...points.map((point) => point.y)) + pad,
  };
}

export function clusterBounds(cluster: PrototypeCluster) {
  const points = KNOWLEDGE_PROTOTYPE_NODES
    .filter((node) => node.cluster === cluster)
    .map((node) => STRATUM_POSITIONS[node.sequence])
    .filter((point): point is { x: number; y: number } => Boolean(point));
  const pad = 110;
  return {
    minX: Math.min(...points.map((point) => point.x)) - pad,
    maxX: Math.max(...points.map((point) => point.x)) + pad,
    minY: Math.min(...points.map((point) => point.y)) - pad,
    maxY: Math.max(...points.map((point) => point.y)) + pad,
  };
}
