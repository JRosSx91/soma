/**
 * CHR-01B optimizer. Converts public PNG masters to WebP without mutating PNGs.
 * Requires ImageMagick (`magick`) on PATH. Not a runtime dependency.
 *
 * Usage from apps/web: node scripts/optimize-somi.mjs
 */
import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const STATES = ["idle", "celebrating", "thinking", "sleeping", "waving", "supportive"];
const QUALITIES = [88, 84, 80, 76];
const MAX_EDGE = 512;
const TARGET_BYTES = 150 * 1024;

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "../public/assets/somi");

function magick(args) {
  const result = spawnSync("magick", args, { encoding: "utf8", windowsHide: true });
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || result.stdout?.trim() || `magick ${args.join(" ")}`);
  }
  return result.stdout.trim();
}

function identify(path) {
  const line = magick([
    "identify",
    "-format",
    "%w|%h|%[channels]|%[opaque]|%[fx:minima.a]",
    path,
  ]);
  const [widthRaw, heightRaw, channels, opaqueRaw, minAlphaRaw] = line.split("|");
  const minAlpha = Number(minAlphaRaw);
  const opaque = opaqueRaw.toLowerCase() === "true";
  return {
    width: Number(widthRaw),
    height: Number(heightRaw),
    channels,
    opaque,
    minAlpha,
    hasAlpha: !opaque && Number.isFinite(minAlpha) && minAlpha < 1,
  };
}

const report = [];

for (const state of STATES) {
  const png = resolve(publicDir, `somi-${state}.png`);
  const webp = resolve(publicDir, `somi-${state}.webp`);
  if (!existsSync(png)) throw new Error(`missing ${png}`);

  const pngStat = statSync(png);
  const pngMeta = identify(png);
  if (!pngMeta.hasAlpha) {
    throw new Error(`${state} PNG has no real alpha (opaque=${pngMeta.opaque}, minA=${pngMeta.minAlpha})`);
  }

  let chosen = null;
  for (const quality of QUALITIES) {
    magick([
      png,
      "-resize",
      `${MAX_EDGE}x${MAX_EDGE}>`,
      "-define",
      "webp:method=6",
      "-quality",
      String(quality),
      "-define",
      "webp:alpha-quality=95",
      webp,
    ]);
    const bytes = statSync(webp).size;
    chosen = { quality, bytes, kb: +(bytes / 1024).toFixed(1) };
    console.log(`${state} webp q=${quality} -> ${bytes} bytes (${chosen.kb} KB)`);
    if (bytes <= TARGET_BYTES) break;
  }

  const webpMeta = identify(webp);
  if (!webpMeta.hasAlpha) {
    throw new Error(`${state} WebP lost alpha`);
  }
  if (Math.max(webpMeta.width, webpMeta.height) > MAX_EDGE) {
    throw new Error(`${state} WebP exceeds ${MAX_EDGE}px`);
  }

  report.push({
    state,
    pngBytes: pngStat.size,
    png: pngMeta,
    webp: { ...webpMeta, ...chosen },
  });
}

console.log(JSON.stringify(report, null, 2));
