/**
 * PERF-01C — WebP derivatives for landing-v2 plates, hero, showcase medals,
 * and atlas layers used on the public landing. Does not replace PNG masters.
 * Requires ImageMagick on PATH / MAGICK_BIN (same as IMG-PERF-01A/01B).
 */
import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const magick =
  process.env.MAGICK_BIN ??
  "C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI\\magick.exe";

if (!existsSync(magick)) {
  console.error("ImageMagick not found:", magick);
  process.exit(1);
}

const PHOTO_QUALITY = "82";
const ART_QUALITY = "86";

const landingPlates = [
  { id: "hero-holographic-anatomy", width: 1828, steps: [768, 1280] },
  { id: "soma-journey-bg", width: 1819, steps: [960, 1600] },
  { id: "soma-atlas-bg", width: 1821, steps: [960, 1600] },
  { id: "soma-science-bg", width: 1821, steps: [960, 1600] },
  { id: "soma-methodology-bg", width: 1821, steps: [960, 1600] },
  { id: "soma-origin-bg", width: 2103, steps: [960, 1600] },
  { id: "soma-missions-journal-bg", width: 2079, steps: [960, 1600] },
  { id: "soma-achievements-bg", width: 1829, steps: [960, 1600] },
];

/** Showcase medals on LandingV2Achievements (+ shared AchievementMedal benefit). */
const medals = [
  "nicotine-bronze",
  "alcohol-bronze",
  "alcohol-gold",
  "nicotine-gold",
  "cannabis-gold",
];

const anatomy = [
  "body-master-anterior",
  "system-central-nervous",
  "respiratory-highlight-anterior",
  "system-digestive",
  "system-integumentary",
];

const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const only = onlyArg ? onlyArg.slice("--only=".length) : "all";

function run(args) {
  const result = spawnSync(magick, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`magick failed: ${args.join(" ")}`);
  }
}

function kb(path) {
  return (statSync(path).size / 1024).toFixed(1);
}

function emitPhoto(dir, id, nativeWidth, steps, quality = PHOTO_QUALITY) {
  const png = join(dir, `${id}.png`);
  if (!existsSync(png)) {
    throw new Error(`missing ${png}`);
  }
  const nativeWebp = join(dir, `${id}.webp`);
  run([
    png,
    "-strip",
    "-quality",
    quality,
    "-define",
    "webp:method=6",
    nativeWebp,
  ]);
  console.log(`${id}.webp (native) ${kb(nativeWebp)} KB (png ${kb(png)} KB)`);
  for (const w of steps) {
    if (w >= nativeWidth - 80) continue;
    const out = join(dir, `${id}-${w}.webp`);
    run([
      png,
      "-strip",
      "-resize",
      `${w}x`,
      "-quality",
      quality,
      "-define",
      "webp:method=6",
      out,
    ]);
    console.log(`${id}-${w}.webp ${kb(out)} KB`);
  }
}

function emitMedal(id) {
  const dir = join(webRoot, "public/images/achievements");
  const png = join(dir, `${id}.png`);
  if (!existsSync(png)) throw new Error(`missing ${png}`);
  const native = join(dir, `${id}.webp`);
  const mid = join(dir, `${id}-512.webp`);
  const thumb = join(dir, `${id}-256.webp`);
  run([
    png,
    "-strip",
    "-background",
    "none",
    "-alpha",
    "set",
    "-quality",
    ART_QUALITY,
    "-define",
    "webp:method=6",
    "-define",
    "webp:alpha-quality=90",
    native,
  ]);
  console.log(`${id}.webp (native) ${kb(native)} KB (png ${kb(png)} KB)`);
  run([
    png,
    "-strip",
    "-background",
    "none",
    "-alpha",
    "set",
    "-resize",
    "512x",
    "-quality",
    ART_QUALITY,
    "-define",
    "webp:method=6",
    "-define",
    "webp:alpha-quality=90",
    mid,
  ]);
  console.log(`${id}-512.webp ${kb(mid)} KB`);
  run([
    png,
    "-strip",
    "-background",
    "none",
    "-alpha",
    "set",
    "-resize",
    "256x",
    "-quality",
    ART_QUALITY,
    "-define",
    "webp:method=6",
    "-define",
    "webp:alpha-quality=90",
    thumb,
  ]);
  console.log(`${id}-256.webp ${kb(thumb)} KB`);
}

function emitAnatomy(id) {
  const dir = join(webRoot, "public/images/anatomy");
  emitPhoto(dir, id, 1024, [640], ART_QUALITY);
}

const landingDir = join(webRoot, "public/images/landing-v2");

if (only === "all" || only === "landing") {
  for (const plate of landingPlates) {
    emitPhoto(landingDir, plate.id, plate.width, plate.steps);
  }
}
if (only === "all" || only === "medals") {
  for (const id of medals) emitMedal(id);
}
if (only === "all" || only === "anatomy") {
  for (const id of anatomy) emitAnatomy(id);
}

console.log("PERF-01C optimize done.");
