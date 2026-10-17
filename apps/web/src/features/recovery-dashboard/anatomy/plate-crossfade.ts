/** Crossfade between two full-body plates. Neither image is scaled or warped. */
export const PLATE_CROSSFADE_MS = 300;

export interface PlateLayer {
  id: number;
  src: string;
  opacity: number;
}

export function crossfadeOpacities(
  elapsedMs: number,
  durationMs: number,
  outgoingStart = 1,
): { outgoing: number; incoming: number; done: boolean } {
  const progress = durationMs <= 0 ? 1 : Math.min(1, Math.max(0, elapsedMs / durationMs));
  return {
    outgoing: outgoingStart * (1 - progress),
    incoming: progress,
    done: progress >= 1,
  };
}

/**
 * Starts a crossfade from the plate that is currently visible.
 * Reduced motion keeps only the next plate, fully opaque.
 */
export function beginPlateCrossfade(
  current: readonly PlateLayer[],
  nextSrc: string,
  nextId: number,
  reducedMotion: boolean,
): PlateLayer[] {
  if (reducedMotion) return [{ id: nextId, src: nextSrc, opacity: 1 }];
  const outgoing = [...current].reverse().find((layer) => layer.src !== nextSrc && layer.opacity > 0.01);
  if (!outgoing) return [{ id: nextId, src: nextSrc, opacity: 1 }];
  return [
    { id: outgoing.id, src: outgoing.src, opacity: outgoing.opacity },
    { id: nextId, src: nextSrc, opacity: 0 },
  ];
}

export function applyCrossfadeOpacities(
  layers: readonly PlateLayer[],
  incomingId: number,
  outgoingOpacity: number,
  incomingOpacity: number,
): PlateLayer[] {
  return layers.map((layer) => {
    if (layer.id === incomingId) return { ...layer, opacity: incomingOpacity };
    return { ...layer, opacity: outgoingOpacity };
  });
}

/** Drops every plate except the one that finished arriving. */
export function settlePlateLayers(layers: readonly PlateLayer[], id: number): PlateLayer[] {
  const settled = layers.find((layer) => layer.id === id);
  return settled ? [{ ...settled, opacity: 1 }] : layers.filter((layer) => layer.id === id);
}
