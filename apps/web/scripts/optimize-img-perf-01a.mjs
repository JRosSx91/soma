/**
 * IMG-PERF-01A — generate WebP derivatives with ImageMagick (already on PATH/install).
 * Does not replace PNG masters. Re-runnable.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
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
const MAP_QUALITY = "90";
const ICON_QUALITY = "88";

const nature = [
  { id: "nature-1", width: 1673, steps: [960] },
  { id: "nature-2", width: 1942, steps: [960, 1600] },
  { id: "nature-3", width: 2167, steps: [960, 1600] },
  { id: "nature-4", width: 2172, steps: [960, 1600] },
  { id: "nature-5", width: 2172, steps: [960, 1600] },
  { id: "nature-6", width: 1672, steps: [960] },
  { id: "nature-7", width: 2142, steps: [960, 1600] },
  { id: "nature-8", width: 2048, steps: [960, 1600] },
  { id: "nature-9", width: 2172, steps: [960, 1600] },
  { id: "nature-10", width: 2172, steps: [960, 1600] },
  { id: "nature-11", width: 2172, steps: [960, 1600] },
];

const knowledgeIcons = [
  "knowledge-neuroscience",
  "knowledge-anatomy",
  "knowledge-substances",
  "knowledge-processes",
  "knowledge-recovery",
];

const perseveranceIcons = [
  "perseverance-alcohol",
  "perseverance-nicotine",
  "perseverance-cannabis",
  "perseverance-cocaine",
  "perseverance-caffeine",
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

function emitPhoto(id, nativeWidth, steps) {
  const png = join(webRoot, "public/images/decoration", `${id}.png`);
  const dir = dirname(png);
  const nativeWebp = join(dir, `${id}.webp`);
  run([
    png,
    "-strip",
    "-quality",
    PHOTO_QUALITY,
    "-define",
    "webp:method=6",
    nativeWebp,
  ]);
  console.log(`${id}.webp (native) ${kb(nativeWebp)} KB`);
  for (const w of steps) {
    if (w >= nativeWidth - 80) continue;
    const out = join(dir, `${id}-${w}.webp`);
    run([
      png,
      "-strip",
      "-resize",
      `${w}x`,
      "-quality",
      PHOTO_QUALITY,
      "-define",
      "webp:method=6",
      out,
    ]);
    console.log(`${id}-${w}.webp ${kb(out)} KB`);
  }
}

function emitMap() {
  const png = join(webRoot, "public/images/decoration/expedition-map.png");
  const out = join(webRoot, "public/images/decoration/expedition-map.webp");
  run([
    png,
    "-strip",
    "-quality",
    MAP_QUALITY,
    "-define",
    "webp:method=6",
    out,
  ]);
  console.log(`expedition-map.webp ${kb(out)} KB (same ${1672}x${941})`);
}

function emitIcon(id) {
  const png = join(webRoot, "public/images/expedition/icons", `${id}.png`);
  const dir = join(webRoot, "public/images/expedition/icons");
  mkdirSync(dir, { recursive: true });
  for (const size of [96, 192]) {
    const out = join(dir, `${id}-${size}.webp`);
    run([
      png,
      "-strip",
      "-background",
      "none",
      "-alpha",
      "set",
      "-resize",
      `${size}x${size}`,
      "-quality",
      ICON_QUALITY,
      "-define",
      "webp:method=6",
      "-define",
      "webp:alpha-quality=90",
      out,
    ]);
    console.log(`${id}-${size}.webp ${kb(out)} KB`);
  }
}

console.log("IMG-PERF-01A using", magick, only === "all" ? "" : `(only=${only})`);
if (only === "all" || only === "photos") {
  for (const plate of nature) emitPhoto(plate.id, plate.width, plate.steps);
}
const singlePlate = nature.find((plate) => plate.id === only);
if (singlePlate) emitPhoto(singlePlate.id, singlePlate.width, singlePlate.steps);
if (only === "all" || only === "map") emitMap();
if (only === "all" || only === "knowledge") {
  for (const id of knowledgeIcons) emitIcon(id);
}
if (only === "all" || only === "perseverance") {
  for (const id of perseveranceIcons) emitIcon(id);
}
console.log("done");
