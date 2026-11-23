import { cameraTravelRange, clampMapCamera, type MapCamera, type MapSize } from "./knowledge-prototype-camera.js";
import { captionIsVisible, labelSide, mapDetail, type CaptionSide } from "./knowledge-prototype-presentation.js";

export interface ScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ClearanceNode {
  sequence: number;
  x: number;
  y: number;
  r: number;
  role: string;
  state: string;
}

export interface TitlePlacement {
  index: number;
  left: number;
  top: number;
  visible: boolean;
}

/**
 * Screen box reserved by the editorial intro. The wide desktop block includes
 * the description; a narrower map (the side panel is open) drops that line
 * so the opening discs can sit below it.
 */
export function introSafeRect(variant: "desktop" | "mobile", viewportWidth = 1440): ScreenRect {
  if (variant === "mobile") return { x: 12, y: 8, width: 168, height: 72 };
  if (viewportWidth < 1100) return { x: 16, y: 8, width: 220, height: 86 };
  return { x: 16, y: 12, width: 256, height: 124 };
}

export function minimapSafeRect(viewport: MapSize): ScreenRect {
  return { x: 8, y: Math.max(0, viewport.height - 118), width: 188, height: 110 };
}

/**
 * Disc diameter at scale 1. Rendered size is this value times the camera scale.
 * Sequences 2 and 3 stay large because they carry the opening illustrations.
 */
export function prototypeDiscPixels(node: { sequence: number; visualRole: string; essential: boolean; state: string }) {
  if (node.state === "hinted") return 40;
  if (node.sequence === 2 || node.sequence === 3) return 72;
  if (node.sequence === 4) return 56;
  if (node.visualRole === "door" || node.visualRole === "milestone" || node.visualRole === "convergence") return 84;
  if (node.visualRole === "bridge") return 56;
  if (!node.essential) return 40;
  return 52;
}

const TITLE_GAP = 8;
const VIEW_MARGIN = 8;

/**
 * World top-left candidates, first choice first. The placer keeps the first
 * one whose screen box misses discs, captions, the intro and the minimap.
 */
export const CLUSTER_TITLE_CANDIDATES: Record<1 | 2 | 3 | 4, readonly { x: number; y: number }[]> = {
  1: [
    { x: 24, y: 500 },
    { x: 650, y: 36 },
    { x: 390, y: 28 },
    { x: 24, y: 28 },
  ],
  2: [
    { x: 640, y: 108 },
    { x: 860, y: 210 },
    { x: 1040, y: 520 },
    { x: 1240, y: 90 },
  ],
  3: [
    { x: 80, y: 640 },
    { x: 200, y: 960 },
    { x: 540, y: 620 },
    { x: 24, y: 1360 },
  ],
  4: [
    { x: 860, y: 820 },
    { x: 1080, y: 600 },
    { x: 1320, y: 640 },
    { x: 1500, y: 1040 },
  ],
};

/** Screen size of the title box. Wider than the glyphs so the test is conservative. */
/** Measured at 13px semibold, including the region dot, plus a few pixels. */
export const CLUSTER_TITLE_BOX: Record<1 | 2 | 3 | 4, { width: number; height: number }> = {
  1: { width: 80, height: 22 },
  2: { width: 224, height: 22 },
  3: { width: 204, height: 22 },
  4: { width: 168, height: 22 },
};

export function circleHitsRect(cx: number, cy: number, r: number, rect: ScreenRect, gap = 0) {
  const nearestX = Math.max(rect.x - gap, Math.min(cx, rect.x + rect.width + gap));
  const nearestY = Math.max(rect.y - gap, Math.min(cy, rect.y + rect.height + gap));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < r * r;
}

export function rectsOverlap(a: ScreenRect, b: ScreenRect, gap = 0) {
  return a.x < b.x + b.width + gap
    && a.x + a.width + gap > b.x
    && a.y < b.y + b.height + gap
    && a.y + a.height + gap > b.y;
}

function labelWorldRect(node: ClearanceNode, scale: number) {
  if (node.state === "hinted" || node.state === "hidden") return null;
  if (!captionIsVisible(mapDetail(scale), node.role)) return null;
  const side: CaptionSide = labelSide(node.sequence);
  const width = 128;
  const height = 42;
  const gap = 6;
  if (side === "above") return { x: node.x - width / 2, y: node.y - node.r - gap - height, width, height };
  if (side === "below") return { x: node.x - width / 2, y: node.y + node.r + gap, width, height };
  if (side === "left") return { x: node.x - node.r - gap - width, y: node.y - height / 2, width, height };
  return { x: node.x + node.r + gap, y: node.y - height / 2, width, height };
}

function projectRect(rect: { x: number; y: number; width: number; height: number }, camera: MapCamera): ScreenRect {
  return {
    x: camera.x + rect.x * camera.scale,
    y: camera.y + rect.y * camera.scale,
    width: rect.width * camera.scale,
    height: rect.height * camera.scale,
  };
}

function titleHitsScene(
  title: ScreenRect,
  camera: MapCamera,
  viewport: MapSize,
  nodes: readonly ClearanceNode[],
  blocked: readonly ScreenRect[],
) {
  if (title.x < VIEW_MARGIN || title.y < VIEW_MARGIN) return true;
  if (title.x + title.width > viewport.width - VIEW_MARGIN) return true;
  if (title.y + title.height > viewport.height - VIEW_MARGIN) return true;
  if (blocked.some((rect) => rectsOverlap(title, rect, TITLE_GAP))) return true;
  return nodes.some((node) => {
    const cx = camera.x + node.x * camera.scale;
    const cy = camera.y + node.y * camera.scale;
    if (circleHitsRect(cx, cy, node.r * camera.scale, title, TITLE_GAP)) return true;
    const label = labelWorldRect(node, camera.scale);
    return label ? rectsOverlap(title, projectRect(label, camera), TITLE_GAP) : false;
  });
}

function overlapScore(
  title: ScreenRect,
  camera: MapCamera,
  viewport: MapSize,
  nodes: readonly ClearanceNode[],
  blocked: readonly ScreenRect[],
) {
  let score = 0;
  if (title.x < VIEW_MARGIN || title.y < VIEW_MARGIN) score += 5000;
  if (title.x + title.width > viewport.width - VIEW_MARGIN) score += 5000;
  if (title.y + title.height > viewport.height - VIEW_MARGIN) score += 5000;
  for (const rect of blocked) {
    if (rectsOverlap(title, rect, 0)) score += 1000;
  }
  for (const node of nodes) {
    const cx = camera.x + node.x * camera.scale;
    const cy = camera.y + node.y * camera.scale;
    if (circleHitsRect(cx, cy, node.r * camera.scale, title, 0)) score += 100;
    const label = labelWorldRect(node, camera.scale);
    if (label && rectsOverlap(title, projectRect(label, camera), 0)) score += 40;
  }
  return score;
}

export function placeClusterTitles(
  camera: MapCamera,
  viewport: MapSize,
  nodes: readonly ClearanceNode[],
  blocked: readonly ScreenRect[],
): Record<1 | 2 | 3 | 4, TitlePlacement> {
  const placed: ScreenRect[] = [];
  const result = {} as Record<1 | 2 | 3 | 4, TitlePlacement>;
  for (const cluster of [1, 2, 3, 4] as const) {
    const box = CLUSTER_TITLE_BOX[cluster];
    const candidates = CLUSTER_TITLE_CANDIDATES[cluster];
    let chosen = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    let best = 0;
    let found = false;
    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index]!;
      const title = {
        x: camera.x + candidate.x * camera.scale,
        y: camera.y + candidate.y * camera.scale,
        width: box.width,
        height: box.height,
      };
      const score = overlapScore(title, camera, viewport, nodes, [...blocked, ...placed]);
      if (score < bestScore) {
        bestScore = score;
        best = index;
      }
      if (!titleHitsScene(title, camera, viewport, nodes, [...blocked, ...placed])) {
        chosen = index;
        found = true;
        break;
      }
    }
    const winner = candidates[found ? chosen : best]!;
    const left = camera.x + winner.x * camera.scale;
    const top = camera.y + winner.y * camera.scale;
    result[cluster] = { index: found ? chosen : best, left, top, visible: found };
    if (found) placed.push({ x: left, y: top, width: box.width, height: box.height });
  }
  return result;
}

function sceneHitsIntro(camera: MapCamera, intro: ScreenRect, nodes: readonly ClearanceNode[], gap: number) {
  return nodes.some((node) => {
    const cx = camera.x + node.x * camera.scale;
    const cy = camera.y + node.y * camera.scale;
    if (circleHitsRect(cx, cy, node.r * camera.scale, intro, gap)) return true;
    const label = labelWorldRect(node, camera.scale);
    return label ? rectsOverlap(projectRect(label, camera), intro, gap) : false;
  });
}

/**
 * Slides a framed camera right, then down, until the listed discs and their
 * captions sit outside the intro. Free pan keeps the ordinary clamp.
 */
export function shiftCameraClearOf(
  camera: MapCamera,
  viewport: MapSize,
  world: MapSize,
  intro: ScreenRect,
  nodes: readonly ClearanceNode[],
  gap = 12,
): MapCamera {
  const limits = cameraTravelRange(camera.scale, viewport, world);
  const settle = (x: number, y: number) => clampMapCamera(
    { scale: camera.scale, x, y },
    viewport,
    world,
  );
  if (!sceneHitsIntro(camera, intro, nodes, gap)) return settle(camera.x, camera.y);

  const xValues: number[] = [];
  for (let x = camera.x; x <= limits.maxX + 0.01; x += 8) xValues.push(Math.min(x, limits.maxX));
  if (xValues.length === 0 || xValues[xValues.length - 1] !== limits.maxX) xValues.push(limits.maxX);

  const yValues: number[] = [];
  for (let y = camera.y; y <= limits.maxY + 0.01; y += 8) yValues.push(Math.min(y, limits.maxY));
  if (yValues.length === 0 || yValues[yValues.length - 1] !== limits.maxY) yValues.push(limits.maxY);

  for (const x of xValues) {
    const next = settle(x, camera.y);
    if (!sceneHitsIntro(next, intro, nodes, gap)) return next;
  }
  for (const y of yValues) {
    const next = settle(camera.x, y);
    if (!sceneHitsIntro(next, intro, nodes, gap)) return next;
  }
  for (const y of yValues) {
    for (const x of xValues) {
      const next = settle(x, y);
      if (!sceneHitsIntro(next, intro, nodes, gap)) return next;
    }
  }
  return settle(limits.maxX, limits.maxY);
}
