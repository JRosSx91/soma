/**
 * GAME-07E: gold-following overlay paths on the 1672×941 illustration.
 * Coordinates are illustration pixels, matching MAP_TRAIL_POINTS percentages.
 */

import {
  EXPEDITION_MAP_HEIGHT,
  EXPEDITION_MAP_WIDTH,
  MAP_TRAIL_POINTS,
} from "./expedition-map-layout.js";
import type { ExpeditionNodeId } from "./expedition-model.js";

export const TRAIL_VIEWBOX_WIDTH = EXPEDITION_MAP_WIDTH;
export const TRAIL_VIEWBOX_HEIGHT = EXPEDITION_MAP_HEIGHT;

/** West hairpin at the ruins + ridge to the tree: one educational stroke. */
export const NEUROSCIENCE_TRAIL_D =
  "M 242 503 C 188 510 152 470 160 449 C 168 428 200 396 247 399 C 262 400 270 404 274 406 C 303 391 333 379 363 370 C 401 356 430 345 460 343 C 489 335 518 323 540 302 C 568 290 599 281 633 277 C 640 276 648 278 654 280";

/** Bridge deck only. Not the south valley, lake spur, or cave path. */
export const PROCESSES_TRAIL_D =
  "M 1153 625 C 1185 614 1218 608 1235 610 C 1250 608 1262 605 1275 600";

/** Raster re-light of painted gold. Revealed by SVG mask, never drawn as a product stroke. PNG masters stay on disk as source. */
export const NEUROSCIENCE_LIGHT_SRC =
  "/images/expedition/trail-neuro-light.webp";
export const PROCESSES_LIGHT_SRC =
  "/images/expedition/trail-processes-light.webp";
export const NEUROSCIENCE_MASK_STROKE = 50;
export const PROCESSES_MASK_STROKE = 36;

export function beaconPixel(index: number): { x: number; y: number } | null {
  const point = MAP_TRAIL_POINTS[index];
  if (!point) return null;
  return {
    x: (point.x / 100) * TRAIL_VIEWBOX_WIDTH,
    y: (point.y / 100) * TRAIL_VIEWBOX_HEIGHT,
  };
}

export function beaconPixelForNode(
  id: ExpeditionNodeId,
  route: "knowledge" | "perseverance",
): { x: number; y: number; left: number; top: number } | null {
  const order =
    route === "knowledge"
      ? ([
          "neurotransmitters",
          "orientation",
          "substances",
          "processes",
          "recovery",
        ] as const)
      : (["alcohol", "nicotine", "cannabis", "cocaine", "caffeine"] as const);
  const index = (order as readonly string[]).indexOf(id);
  if (index < 0) return null;
  const point = MAP_TRAIL_POINTS[index];
  if (!point) return null;
  return {
    x: (point.x / 100) * TRAIL_VIEWBOX_WIDTH,
    y: (point.y / 100) * TRAIL_VIEWBOX_HEIGHT,
    left: point.x,
    top: point.y,
  };
}
