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
  5: new URL("./lookdev/f00-05.webp", import.meta.url).href,
  6: new URL("./lookdev/f00-06.webp", import.meta.url).href,
  7: new URL("./lookdev/f00-07.webp", import.meta.url).href,
  8: new URL("./lookdev/f00-08.webp", import.meta.url).href,
  9: new URL("./lookdev/f00-09.webp", import.meta.url).href,
  10: new URL("./lookdev/f00-10.webp", import.meta.url).href,
  11: new URL("./lookdev/f00-11.webp", import.meta.url).href,
  12: new URL("./lookdev/f00-12.webp", import.meta.url).href,
  13: new URL("./lookdev/f00-13.webp", import.meta.url).href,
  14: new URL("./lookdev/f00-14.webp", import.meta.url).href,
  15: new URL("./lookdev/f00-15.webp", import.meta.url).href,
  16: new URL("./lookdev/f00-16.webp", import.meta.url).href,
  17: new URL("./lookdev/f00-17.webp", import.meta.url).href,
  18: new URL("./lookdev/f00-18.webp", import.meta.url).href,
  19: new URL("./lookdev/f00-19.webp", import.meta.url).href,
  20: new URL("./lookdev/f00-20.webp", import.meta.url).href,
  21: new URL("./lookdev/f00-21.webp", import.meta.url).href,
  22: new URL("./lookdev/f00-22.webp", import.meta.url).href,
  23: new URL("./lookdev/f00-23.webp", import.meta.url).href,
  24: new URL("./lookdev/f00-24.webp", import.meta.url).href,
  25: new URL("./lookdev/f00-25.webp", import.meta.url).href,
  26: new URL("./lookdev/f00-26.webp", import.meta.url).href,
  27: new URL("./lookdev/f00-27.webp", import.meta.url).href,
  28: new URL("./lookdev/f00-28.webp", import.meta.url).href,
};

/** Square crops for the opening discs. These are not the panoramic sheet images. */
export const STRATUM_NODE_ART: Readonly<Record<number, string>> = {
  1: new URL("./lookdev/node-f00-01.webp", import.meta.url).href,
  2: new URL("./lookdev/node-f00-02.webp", import.meta.url).href,
  3: new URL("./lookdev/node-f00-03.webp", import.meta.url).href,
  4: new URL("./lookdev/node-f00-04.webp", import.meta.url).href,
  5: new URL("./lookdev/node-f00-05.webp", import.meta.url).href,
  6: new URL("./lookdev/node-f00-06.webp", import.meta.url).href,
  7: new URL("./lookdev/node-f00-07.webp", import.meta.url).href,
  8: new URL("./lookdev/node-f00-08.webp", import.meta.url).href,
  9: new URL("./lookdev/node-f00-09.webp", import.meta.url).href,
  10: new URL("./lookdev/node-f00-10.webp", import.meta.url).href,
  11: new URL("./lookdev/node-f00-11.webp", import.meta.url).href,
  12: new URL("./lookdev/node-f00-12.webp", import.meta.url).href,
  13: new URL("./lookdev/node-f00-13.webp", import.meta.url).href,
  14: new URL("./lookdev/node-f00-14.webp", import.meta.url).href,
  15: new URL("./lookdev/node-f00-15.webp", import.meta.url).href,
  16: new URL("./lookdev/node-f00-16.webp", import.meta.url).href,
  17: new URL("./lookdev/node-f00-17.webp", import.meta.url).href,
  18: new URL("./lookdev/node-f00-18.webp", import.meta.url).href,
  19: new URL("./lookdev/node-f00-19.webp", import.meta.url).href,
  20: new URL("./lookdev/node-f00-20.webp", import.meta.url).href,
  21: new URL("./lookdev/node-f00-21.webp", import.meta.url).href,
  22: new URL("./lookdev/node-f00-22.webp", import.meta.url).href,
  23: new URL("./lookdev/node-f00-23.webp", import.meta.url).href,
  24: new URL("./lookdev/node-f00-24.webp", import.meta.url).href,
  25: new URL("./lookdev/node-f00-25.webp", import.meta.url).href,
  26: new URL("./lookdev/node-f00-26.webp", import.meta.url).href,
  27: new URL("./lookdev/node-f00-27.webp", import.meta.url).href,
  28: new URL("./lookdev/node-f00-28.webp", import.meta.url).href,
};
