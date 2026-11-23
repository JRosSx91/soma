export interface MapCamera {
  x: number;
  y: number;
  scale: number;
}

export interface MapSize {
  width: number;
  height: number;
}

export const MAP_CAMERA_MIN_SCALE = 0.18;
export const MAP_CAMERA_MAX_SCALE = 1.75;

const EDGE_MARGIN = 72;

export function clampMapScale(scale: number) {
  if (!Number.isFinite(scale)) return 1;
  return Math.min(MAP_CAMERA_MAX_SCALE, Math.max(MAP_CAMERA_MIN_SCALE, scale));
}

function clampAxis(value: number, min: number, max: number) {
  if (min > max) return (min + max) / 2;
  return Math.min(max, Math.max(min, value));
}

/** Inclusive pan range after the same edge rule as clampMapCamera. */
export function cameraTravelRange(scale: number, viewport: MapSize, world: MapSize) {
  const safe = clampMapScale(scale);
  const xBound = viewport.width - world.width * safe - EDGE_MARGIN;
  const yBound = viewport.height - world.height * safe - EDGE_MARGIN;
  return {
    scale: safe,
    minX: Math.min(xBound, EDGE_MARGIN),
    maxX: Math.max(xBound, EDGE_MARGIN),
    minY: Math.min(yBound, EDGE_MARGIN),
    maxY: Math.max(yBound, EDGE_MARGIN),
  };
}

/** Keeps the map from sliding entirely out of the viewport. */
export function clampMapCamera(camera: MapCamera, viewport: MapSize, world: MapSize): MapCamera {
  const scale = clampMapScale(camera.scale);
  const minX = viewport.width - world.width * scale - EDGE_MARGIN;
  const maxX = EDGE_MARGIN;
  const minY = viewport.height - world.height * scale - EDGE_MARGIN;
  const maxY = EDGE_MARGIN;
  return {
    scale,
    x: clampAxis(camera.x, Math.min(minX, maxX), Math.max(minX, maxX)),
    y: clampAxis(camera.y, Math.min(minY, maxY), Math.max(minY, maxY)),
  };
}

export function frameMapCamera(
  point: { x: number; y: number },
  viewport: MapSize,
  world: MapSize,
  scale: number,
): MapCamera {
  const next = clampMapScale(scale);
  return clampMapCamera(
    {
      scale: next,
      x: viewport.width / 2 - point.x * next,
      y: viewport.height / 2 - point.y * next,
    },
    viewport,
    world,
  );
}

/** Frames a box. Scale stays between minScale and maxScale so discs remain tappable. */
export function frameMapBounds(
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  viewport: MapSize,
  world: MapSize,
  maxScale = 1.05,
  minScale = MAP_CAMERA_MIN_SCALE,
): MapCamera {
  const width = Math.max(160, bounds.maxX - bounds.minX);
  const height = Math.max(160, bounds.maxY - bounds.minY);
  const fit = Math.min(viewport.width / width, viewport.height / height);
  return frameMapCamera(
    { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 },
    viewport,
    world,
    clampMapScale(Math.min(maxScale, Math.max(minScale, fit))),
  );
}

/** True when a world point already sits inside the viewport, away from the edges. */
export function mapPointInView(
  point: { x: number; y: number },
  camera: MapCamera,
  viewport: MapSize,
  margin = 64,
): boolean {
  const sx = camera.x + point.x * camera.scale;
  const sy = camera.y + point.y * camera.scale;
  return sx >= margin && sy >= margin && sx <= viewport.width - margin && sy <= viewport.height - margin;
}

/** Keeps the same world point centered when the viewport changes size. */
export function holdMapFocus(
  camera: MapCamera,
  previous: MapSize,
  next: MapSize,
  world: MapSize,
): MapCamera {
  const safeScale = camera.scale || 1;
  const worldX = (previous.width / 2 - camera.x) / safeScale;
  const worldY = (previous.height / 2 - camera.y) / safeScale;
  return clampMapCamera(
    {
      scale: camera.scale,
      x: next.width / 2 - worldX * camera.scale,
      y: next.height / 2 - worldY * camera.scale,
    },
    next,
    world,
  );
}

/** Wheel and pinch zoom around a viewport point. Positive deltaY zooms out. */
export function zoomMapCamera(
  camera: MapCamera,
  viewport: MapSize,
  world: MapSize,
  anchor: { x: number; y: number },
  deltaY: number,
): MapCamera {
  if (deltaY === 0) return camera;
  const nextScale = clampMapScale(camera.scale * (deltaY > 0 ? 0.9 : 1.1));
  const worldX = (anchor.x - camera.x) / camera.scale;
  const worldY = (anchor.y - camera.y) / camera.scale;
  return clampMapCamera(
    {
      scale: nextScale,
      x: anchor.x - worldX * nextScale,
      y: anchor.y - worldY * nextScale,
    },
    viewport,
    world,
  );
}
