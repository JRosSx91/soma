import type { BodySystem, OrganId } from "@soma/shared-types";

/** Shared frame for plates and future hit regions. */
export const ATLAS_VIEWBOX = { width: 1000, height: 1600 } as const;

/**
 * Rectangle, in viewBox units, where a plate is fitted.
 * A future region path must be authored in the same viewBox.
 */
export const ATLAS_PLATE_FRAME = { x: 70, y: 80, width: 860, height: 1440 } as const;

export type AtlasViewId = "anterior" | "posterior";

export interface AtlasPlate {
  src: string;
  /** What the file shows. Not a license to draw hit areas on top. */
  depicts: string;
  /** CSS aspect-ratio of the file, so a full-body plate can fit without cropping. */
  aspectRatio?: string;
}

export interface AtlasOrgan {
  id: OrganId;
  name: string;
  /** Null when no file depicts this organ on its own. */
  plate: AtlasPlate | null;
  /**
   * SVG path in `ATLAS_VIEWBOX`, or null when the region is not registered.
   * An empty string is not a region.
   */
  regions: Record<AtlasViewId, string | null>;
}

export interface AtlasSystem {
  id: string;
  catalogSystem: BodySystem;
  name: string;
  plates: Record<AtlasViewId, AtlasPlate | null>;
  organs: readonly AtlasOrgan[];
}

export interface UnboundAnatomyFile {
  src: string;
  reason: string;
}
