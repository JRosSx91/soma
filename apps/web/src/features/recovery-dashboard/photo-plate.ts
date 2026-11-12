/**
 * IMG-PERF-01A: WebP srcset for photographic plates in `public/images/decoration`.
 * PNG masters remain the fallback `src`.
 */

export interface PhotoPlate {
  png: string;
  width: number;
  height: number;
  webpSrcSet: string;
}

interface PlateSpec {
  width: number;
  height: number;
  /** Extra WebP widths besides the native file `{id}.webp`. */
  steps: readonly number[];
}

const NATURE_PLATES: Record<string, PlateSpec> = {
  "nature-1": { width: 1673, height: 940, steps: [960] },
  "nature-2": { width: 1942, height: 809, steps: [960, 1600] },
  "nature-3": { width: 2167, height: 726, steps: [960, 1600] },
  "nature-4": { width: 2172, height: 724, steps: [960, 1600] },
  "nature-5": { width: 2172, height: 724, steps: [960, 1600] },
  "nature-6": { width: 1672, height: 941, steps: [960] },
  "nature-7": { width: 2142, height: 734, steps: [960, 1600] },
  "nature-8": { width: 2048, height: 768, steps: [960, 1600] },
  "nature-9": { width: 2172, height: 724, steps: [960, 1600] },
  "nature-10": { width: 2172, height: 724, steps: [960, 1600] },
  "nature-11": { width: 2172, height: 724, steps: [960, 1600] },
};

const DECORATION_DIR = "/images/decoration";

export function photoPlateFor(pngSrc: string): PhotoPlate | null {
  const match = pngSrc.match(/\/images\/decoration\/(nature-\d+)\.png$/);
  if (!match) return null;
  const id = match[1];
  const spec = NATURE_PLATES[id];
  if (!spec) return null;
  const parts = spec.steps
    .filter((width) => width < spec.width - 80)
    .map((width) => `${DECORATION_DIR}/${id}-${width}.webp ${width}w`);
  parts.push(`${DECORATION_DIR}/${id}.webp ${spec.width}w`);
  return {
    png: pngSrc,
    width: spec.width,
    height: spec.height,
    webpSrcSet: parts.join(", "),
  };
}
