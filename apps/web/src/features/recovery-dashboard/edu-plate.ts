/**
 * IMG-PERF-01B: WebP srcset for educational process plates and the
 * Explore missions banner. PNG masters remain the fallback `src`.
 */

import { exploreMissionsArt, exploreProcessArt } from "./explore/explore-art.js";

export interface EduPlate {
  png: string;
  width: number;
  height: number;
  webpSrcSet: string;
}

const PROCESS_NATIVE: Record<
  keyof typeof exploreProcessArt,
  { width: number; height: number }
> = {
  receptors: { width: 499, height: 656 },
  tolerance: { width: 497, height: 660 },
  dependence: { width: 502, height: 656 },
  neuroadaptation: { width: 499, height: 659 },
  metabolism: { width: 497, height: 659 },
};

const PROCESS_THUMB_WIDTH = 240;

const MISSIONS_PLATE: EduPlate = {
  png: exploreMissionsArt,
  width: 1774,
  height: 887,
  webpSrcSet:
    "/images/missions/educational-missions-960.webp 960w, /images/missions/educational-missions.webp 1774w",
};

export function eduPlateFor(pngSrc: string): EduPlate | null {
  if (pngSrc === exploreMissionsArt) return MISSIONS_PLATE;
  const match = pngSrc.match(/\/images\/processes\/process-([a-z]+)\.png$/);
  if (!match) return null;
  const id = match[1] as keyof typeof exploreProcessArt;
  const spec = PROCESS_NATIVE[id];
  if (!spec || exploreProcessArt[id] !== pngSrc) return null;
  return {
    png: pngSrc,
    width: spec.width,
    height: spec.height,
    webpSrcSet: `/images/processes/process-${id}-${PROCESS_THUMB_WIDTH}.webp ${PROCESS_THUMB_WIDTH}w, /images/processes/process-${id}.webp ${spec.width}w`,
  };
}
