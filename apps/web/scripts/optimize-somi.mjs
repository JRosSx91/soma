/**
 * One-shot SOMI-02B optimizer. Not a runtime dependency of the app.
 * Usage from apps/web: pnpm dlx --package sharp node scripts/optimize-somi.mjs
 */
import { createRequire } from "node:module";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const repoRoot = resolve(webRoot, "../..");
const publicPng = resolve(webRoot, "public/assets/somi/somi-idle.png");
const masterDir = resolve(webRoot, "src/features/somi/masters");
const masterPng = resolve(masterDir, "somi-idle.png");
const outWebp = resolve(webRoot, "public/assets/somi/somi-idle.webp");

const sharpRequireFrom = process.env.SHARP_REQUIRE_FROM;
const sharp = sharpRequireFrom
  ? createRequire(pathToFileURL(join(sharpRequireFrom, "package.json")).href)("sharp")
  : (await import("sharp")).default;

function cleanRgba(data) {
  let cleared = 0;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    const L = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    const nearBlack = L < 16 && data[i] < 20 && data[i + 1] < 20 && data[i + 2] < 20;
    if (a <= 2 || (a < 28 && nearBlack)) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
      cleared++;
    }
  }
  return cleared;
}

mkdirSync(masterDir, { recursive: true });
if (existsSync(publicPng)) {
  copyFileSync(publicPng, masterPng);
}
if (!existsSync(masterPng)) {
  throw new Error("missing Somi master PNG");
}

const src = sharp(masterPng).ensureAlpha();
const { data, info } = await src.raw().toBuffer({ resolveWithObject: true });
if (info.channels !== 4) throw new Error(`expected RGBA, got ${info.channels}`);
const cleared = cleanRgba(data);

const cleaned = sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
});

const resized = cleaned.resize(512, 512, {
  fit: "contain",
  background: { r: 0, g: 0, b: 0, alpha: 0 },
  kernel: "lanczos3",
});

const qualities = [88, 84, 80, 76];
let chosen = null;
for (const quality of qualities) {
  const buf = await resized
    .clone()
    .webp({ quality, alphaQuality: 95, effort: 6, smartSubsample: true })
    .toBuffer();
  const kb = +(buf.length / 1024).toFixed(1);
  console.log(`webp q=${quality} -> ${buf.length} bytes (${kb} KB)`);
  chosen = { quality, buf, kb };
  if (buf.length <= 150 * 1024) break;
}

writeFileSync(outWebp, chosen.buf);

const webpMeta = await sharp(outWebp).metadata();
console.log(
  JSON.stringify(
    {
      master: masterPng.replace(repoRoot, "").replaceAll("\\", "/"),
      masterBytes: readFileSync(masterPng).length,
      source: { width: info.width, height: info.height },
      clearedPixels: cleared,
      webp: outWebp.replace(repoRoot, "").replaceAll("\\", "/"),
      webpBytes: chosen.buf.length,
      webpKb: chosen.kb,
      quality: chosen.quality,
      webpMeta: {
        width: webpMeta.width,
        height: webpMeta.height,
        hasAlpha: webpMeta.hasAlpha,
        format: webpMeta.format,
      },
    },
    null,
    2,
  ),
);
