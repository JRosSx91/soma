import type { ExpeditionNodeId, ExpeditionRouteId } from "./expedition-model.js";
import {
  KNOWLEDGE_NODE_IDS,
  PERSEVERANCE_NODE_IDS,
} from "./expedition-model.js";

/** Intrinsic size of `public/images/decoration/expedition-map.png`. */
export const EXPEDITION_MAP_WIDTH = 1672;
export const EXPEDITION_MAP_HEIGHT = 941;
export const EXPEDITION_MAP_SRC = "/images/decoration/expedition-map.png";
export const EXPEDITION_MAP_WEBP_SRC = "/images/decoration/expedition-map.webp";

export interface MapPoint {
  /** Percentage of illustration width (0–100). */
  x: number;
  /** Percentage of illustration height (0–100). */
  y: number;
  /** Label placement so captions do not sit on a neighbouring beacon. */
  label: "above" | "below";
}

/**
 * Centres of the five painted gold beacons, as % of the 1672×941 PNG.
 * Knowledge and perseverance share this canvas — not viewport percentages.
 */
export const MAP_TRAIL_POINTS: readonly MapPoint[] = [
  { x: 16.4, y: 43.1, label: "below" }, // ruins
  { x: 39.1, y: 29.8, label: "below" }, // luminous tree
  { x: 58.3, y: 59.6, label: "above" }, // central lake
  { x: 73.8, y: 64.8, label: "below" }, // stone bridge
  { x: 90.5, y: 45.1, label: "below" }, // crystal cave
];

export function nodeIdsForRoute(
  route: ExpeditionRouteId,
): readonly ExpeditionNodeId[] {
  return route === "knowledge" ? KNOWLEDGE_NODE_IDS : PERSEVERANCE_NODE_IDS;
}

export function trailLayout(
  route: ExpeditionRouteId,
): Record<string, MapPoint> {
  const ids = nodeIdsForRoute(route);
  const points: Record<string, MapPoint> = {};
  ids.forEach((id, index) => {
    const point = MAP_TRAIL_POINTS[index];
    if (point) points[id] = point;
  });
  return points;
}
