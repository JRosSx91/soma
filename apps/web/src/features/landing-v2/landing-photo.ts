/**
 * PERF-01C: WebP srcset for landing-v2 plates, showcase medals, and atlas
 * layers used on the public landing. PNG masters remain the fallback `src`.
 */

export interface LandingPhoto {
  png: string;
  width: number;
  height: number;
  webpSrcSet: string;
}

interface PlateSpec {
  dir: "/images/landing-v2" | "/images/anatomy" | "/images/achievements";
  width: number;
  height: number;
  steps: readonly number[];
}

const LANDING_PLATES: Record<string, PlateSpec> = {
  "hero-holographic-anatomy": {
    dir: "/images/landing-v2",
    width: 1828,
    height: 860,
    steps: [768, 1280],
  },
  "soma-journey-bg": {
    dir: "/images/landing-v2",
    width: 1819,
    height: 865,
    steps: [960, 1600],
  },
  "soma-atlas-bg": {
    dir: "/images/landing-v2",
    width: 1821,
    height: 864,
    steps: [960, 1600],
  },
  "soma-science-bg": {
    dir: "/images/landing-v2",
    width: 1821,
    height: 864,
    steps: [960, 1600],
  },
  "soma-methodology-bg": {
    dir: "/images/landing-v2",
    width: 1821,
    height: 864,
    steps: [960, 1600],
  },
  "soma-origin-bg": {
    dir: "/images/landing-v2",
    width: 2103,
    height: 748,
    steps: [960, 1600],
  },
  "soma-missions-journal-bg": {
    dir: "/images/landing-v2",
    width: 2079,
    height: 756,
    steps: [960, 1600],
  },
  "soma-achievements-bg": {
    dir: "/images/landing-v2",
    width: 1829,
    height: 860,
    steps: [960, 1600],
  },
  "body-master-anterior": {
    dir: "/images/anatomy",
    width: 1024,
    height: 1536,
    steps: [640],
  },
  "system-central-nervous": {
    dir: "/images/anatomy",
    width: 1024,
    height: 1536,
    steps: [640],
  },
  "respiratory-highlight-anterior": {
    dir: "/images/anatomy",
    width: 1024,
    height: 1536,
    steps: [640],
  },
  "system-digestive": {
    dir: "/images/anatomy",
    width: 1024,
    height: 1536,
    steps: [640],
  },
  "system-integumentary": {
    dir: "/images/anatomy",
    width: 1024,
    height: 1536,
    steps: [640],
  },
  "nicotine-bronze": {
    dir: "/images/achievements",
    width: 1278,
    height: 1230,
    steps: [256, 512],
  },
  "alcohol-bronze": {
    dir: "/images/achievements",
    width: 1269,
    height: 1240,
    steps: [256, 512],
  },
  "alcohol-gold": {
    dir: "/images/achievements",
    width: 1286,
    height: 1223,
    steps: [256, 512],
  },
  "nicotine-gold": {
    dir: "/images/achievements",
    width: 1286,
    height: 1223,
    steps: [256, 512],
  },
  "cannabis-gold": {
    dir: "/images/achievements",
    width: 1286,
    height: 1223,
    steps: [256, 512],
  },
};

const PNG_RE =
  /^\/images\/(landing-v2|anatomy|achievements)\/([a-z0-9-]+)\.png$/;

export function landingPhotoFor(pngSrc: string): LandingPhoto | null {
  const match = pngSrc.match(PNG_RE);
  if (!match) return null;
  const id = match[2];
  const spec = LANDING_PLATES[id];
  if (!spec) return null;
  if (pngSrc !== `${spec.dir}/${id}.png`) return null;
  const parts = spec.steps
    .filter((width) => width < spec.width - 80)
    .map((width) => `${spec.dir}/${id}-${width}.webp ${width}w`);
  parts.push(`${spec.dir}/${id}.webp ${spec.width}w`);
  return {
    png: pngSrc,
    width: spec.width,
    height: spec.height,
    webpSrcSet: parts.join(", "),
  };
}
