/**
 * Derived lookdev for the DEV stratum map. Originals stay in docs/design.
 * Vite rewrites these URLs in the dev server. The production build drops the
 * module together with the DEV-only route.
 */
export const STRATUM_BACKGROUND_URL = new URL("./lookdev/s00-background.webp", import.meta.url).href;
export const CURIOSITY_SPARK_URL = new URL("./lookdev/curiosity-spark-32.webp", import.meta.url).href;

export const STRATUM_SHEET_ART: Readonly<Record<number, string>> = {
  1: new URL("./lookdev/f00-01.webp", import.meta.url).href,
  2: new URL("./lookdev/f00-02.webp", import.meta.url).href,
  3: new URL("./lookdev/f00-03.webp", import.meta.url).href,
  4: new URL("./lookdev/f00-04.webp", import.meta.url).href,
};

/** Square crops for the opening discs. These are not the panoramic sheet images. */
export const STRATUM_NODE_ART: Readonly<Record<number, string>> = {
  1: new URL("./lookdev/node-f00-01.webp", import.meta.url).href,
  2: new URL("./lookdev/node-f00-02.webp", import.meta.url).href,
  3: new URL("./lookdev/node-f00-03.webp", import.meta.url).href,
  4: new URL("./lookdev/node-f00-04.webp", import.meta.url).href,
};
